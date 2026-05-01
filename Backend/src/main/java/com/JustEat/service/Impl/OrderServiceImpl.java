package com.JustEat.service.Impl;

import com.JustEat.entity.*;
import com.JustEat.enums.OrderStatus;
import com.JustEat.enums.RestaurantStatus;
import com.JustEat.exception.BadRequestException;
import com.JustEat.repository.CartRepository;
import com.JustEat.repository.OrderItemRepository;
import com.JustEat.repository.OrderRepository;
import com.JustEat.service.OrderService;
import com.JustEat.service.helper.EntityFetcher;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {
    private final CartRepository cartRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final EntityFetcher entityFetcher;

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
        }

        cart.getItems().clear();
        cart.setRestaurant(null);
        cart.setTotalAmount(0.0);

        cartRepository.save(cart);
    }
}
