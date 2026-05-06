package com.JustEat.service.Impl;

import com.JustEat.dto.response.OrderItemResponse;
import com.JustEat.dto.response.OrderResponse;
import com.JustEat.dto.response.RepeatedItem;
import com.JustEat.dto.response.RepeatedOrderResponse;
import com.JustEat.entity.*;
import com.JustEat.enums.OrderStatus;
import com.JustEat.enums.RestaurantStatus;
import com.JustEat.exception.BadRequestException;
import com.JustEat.mapper.OrderMapper;
import com.JustEat.repository.CartRepository;
import com.JustEat.repository.MenuItemRepository;
import com.JustEat.repository.OrderItemRepository;
import com.JustEat.repository.OrderRepository;
import com.JustEat.service.OrderService;
import com.JustEat.service.helper.CartHelper;
import com.JustEat.service.helper.EntityFetcher;
import com.JustEat.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {
    private final CartRepository cartRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final MenuItemRepository menuItemRepository;
    private final EntityFetcher entityFetcher;

    // Converts the user's cart into a new order, increments each item's orderCount, then clears the cart
    @Transactional
    @Override
    public void checkout(UUID userId) {
        User user = entityFetcher.getUser(userId);
        Cart cart = entityFetcher.getCart(user);

        if(cart.getItems().isEmpty()){
            throw new BadRequestException("Cart is empty");
        }
        if(cart.getRestaurant().getStatus() != RestaurantStatus.OPEN){
            throw new BadRequestException("Restaurant is closed");
        }

        Order order = new Order();
        order.setUser(user);
        order.setRestaurant(cart.getRestaurant());
        order.setTotalAmount(cart.getTotalAmount());
        order.setStatus(OrderStatus.PENDING);

        orderRepository.save(order);

        for(CartItem item : cart.getItems()){
            OrderItem orderItem = new OrderItem();
            orderItem.setMenuItem(item.getMenuItem());
            orderItem.setOrder(order);
            orderItem.setPrice(item.getPrice());
            orderItem.setQuantity(item.getQuantity());
            orderItemRepository.save(orderItem);

            // Increment popularity counter
            MenuItem menuItem = item.getMenuItem();
            menuItem.setOrderCount((menuItem.getOrderCount() == null ? 0 : menuItem.getOrderCount()) + item.getQuantity());
            menuItemRepository.save(menuItem);
        }

        cart.getItems().clear();
        cart.setRestaurant(null);
        cart.setTotalAmount(0.0);

        cartRepository.save(cart);
    }

    // Returns all orders placed by the given customer, newest first
    @Override
    public List<OrderResponse> getUserOrders(UUID userId) {
        User user = entityFetcher.getUser(userId);
        List<Order> orders = orderRepository.findByUserOrderByCreatedAtDesc(user);
        return orders.stream()
                .map(OrderMapper::toResponse)
                .toList();
    }

    // Returns all orders for the restaurants owned by the given owner, newest first
    @Override
    public List<OrderResponse> getOwnerOrders(UUID ownerID) {
        User owner = entityFetcher.getUser(ownerID);
        List<Order> orders = orderRepository.findByRestaurant_OwnerOrderByCreatedAtDesc(owner);
        return orders.stream()
                .map(OrderMapper::toResponse)
                .toList();
    }

    // Advances an order's status following the allowed sequence: PENDING → PREPARING → READY → COMPLETED
    @Transactional
    @Override
    public void updateOrderStatus(Long orderId, OrderStatus newStatus, UUID ownerId) {
        User owner = entityFetcher.getUser(ownerId);
        Order order = entityFetcher.getOrder(orderId);

        if(!order.getRestaurant().getOwner().getPublicId().equals(ownerId)){
            throw new BadRequestException("Not your order");
        }
        if(order.getStatus() == OrderStatus.COMPLETED){
            throw new BadRequestException("Order already completed");
        }
        validateStatusTransition(order.getStatus(),newStatus);
        order.setStatus(newStatus);
    }

    // Re-adds all items from a past order into the user's cart, reporting added/unavailable/price-changed items
    @Transactional
    @Override
    public RepeatedOrderResponse repeatOrder(Long orderId, UUID userId) {
        User user = entityFetcher.getUser(userId);
        Order order = entityFetcher.getOrder(orderId);

        if (!order.getUser().getPublicId().equals(userId)) {
            throw new BadRequestException("Not your order");
        }
        Cart cart = cartRepository.findByUser(user)
                .orElseGet(() -> {
                    Cart c = new Cart();
                    c.setUser(user);
                    return cartRepository.save(c);
                });

        Restaurant restaurant = order.getRestaurant();
        if (cart.getRestaurant() != null &&
                !cart.getRestaurant().getId().equals(restaurant.getId())) {

            cart.getItems().clear();
            cart.setRestaurant(null);
            cart.setTotalAmount(0.0);
        }

        cart.setRestaurant(restaurant);

        List<RepeatedItem> added = new ArrayList<>();
        List<RepeatedItem> unavailable = new ArrayList<>();
        List<RepeatedItem> priceChanged = new ArrayList<>();

        for (OrderItem orderItem : order.getOrderItems()) {

            MenuItem menuItem = orderItem.getMenuItem();
            if (!menuItem.isAvailable()) {
                unavailable.add(buildItem(orderItem, menuItem, null));
                continue;
            }

            double oldPrice = orderItem.getPrice();
            double newPrice = menuItem.getPrice() * orderItem.getQuantity();
            CartItem cartItem = new CartItem();
            cartItem.setCart(cart);
            cartItem.setMenuItem(menuItem);
            cartItem.setQuantity(orderItem.getQuantity());
            cartItem.setPrice(newPrice);

            cart.getItems().add(cartItem);

            //to handle the precision issues
            if (Math.abs(oldPrice - newPrice) > 0.01) {
                priceChanged.add(buildItem(orderItem, menuItem, newPrice));
            } else {
                added.add(buildItem(orderItem, menuItem, null));
            }
        }
        CartHelper.updateCartTotal(cart);

        return RepeatedOrderResponse.builder()
                .addedItems(added)
                .unavailableItems(unavailable)
                .priceChangedItems(priceChanged)
                .build();
    }

    // Submits a star rating for a completed order and recalculates the restaurant's average rating
    @Override
    @Transactional
    public void rateOrder(Long orderId, int ratingValue, UUID userId) {
        User user = entityFetcher.getUser(userId);
        Order order = entityFetcher.getOrder(orderId);

        if (!order.getUser().getPublicId().equals(userId)) {
            throw new BadRequestException("Not your order");
        }

        if (order.getStatus() != OrderStatus.COMPLETED) {
            throw new BadRequestException("Order not completed");
        }

        if (order.isRatingGiven()) {
            throw new BadRequestException("Order already rated");
        }

        if (ratingValue < 1 || ratingValue > 5) {
            throw new BadRequestException("Rating must be between 1 and 5");
        }

        Restaurant restaurant = order.getRestaurant();

        double currentAvg = restaurant.getRating();
        int count = restaurant.getRatingCount();

        double newAvg = ((currentAvg * count) + ratingValue) / (count + 1);

        restaurant.setRating(newAvg);
        restaurant.setRatingCount(count + 1);

        order.setRatingGiven(true);
    }

    // Builds a RepeatedItem summary from an OrderItem; newPrice is null when price hasn't changed
    private RepeatedItem buildItem(OrderItem orderItem, MenuItem menuItem, Double newPrice) {
        return RepeatedItem.builder()
                .menuItemId(menuItem.getId())
                .name(menuItem.getName())
                .quantity(orderItem.getQuantity())
                .oldPrice(orderItem.getPrice())
                .newPrice(newPrice)
                .build();
    }
    // Ensures status changes follow the correct order flow; throws if the transition is invalid
    private void validateStatusTransition(OrderStatus current , OrderStatus next){
        switch (current){
            case PENDING -> {
                if(next != OrderStatus.PREPARING)throw new BadRequestException("Invalid transition from PENDING");
            }
            case PREPARING -> {
                if(next != OrderStatus.READY)throw new BadRequestException("Invalid transition from PREPARING");
            }
            case READY -> {
                if(next != OrderStatus.COMPLETED)throw new BadRequestException("Invalid transition from READY");
            }
            case COMPLETED -> {
                throw new BadRequestException("Order already completed");
            }
        }
    }

    @Override
    public List<OrderResponse> searchOrders(UUID userId, String keyword) {

        return orderRepository
                .findByUser_PublicIdAndRestaurant_NameContainingIgnoreCase(userId, keyword)
                .stream()
                .map(OrderMapper::toResponse)
                .toList();
    }
}
