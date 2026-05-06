package com.JustEat.service.Impl;

import com.JustEat.entity.Cart;
import com.JustEat.entity.MenuItem;
import com.JustEat.entity.Order;
import com.JustEat.entity.Restaurant;
import com.JustEat.entity.User;
import com.JustEat.enums.OrderStatus;
import com.JustEat.enums.RestaurantStatus;
import com.JustEat.exception.BadRequestException;
import com.JustEat.repository.CartRepository;
import com.JustEat.repository.MenuItemRepository;
import com.JustEat.repository.OrderItemRepository;
import com.JustEat.repository.OrderRepository;
import com.JustEat.service.helper.EntityFetcher;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceImplTest {

    @Mock
    private CartRepository cartRepository;
    @Mock
    private OrderRepository orderRepository;
    @Mock
    private OrderItemRepository orderItemRepository;
    @Mock
    private MenuItemRepository menuItemRepository;
    @Mock
    private EntityFetcher entityFetcher;

    @InjectMocks
    private OrderServiceImpl orderService;

    @Test
    void checkoutThrowsWhenCartIsEmpty() {
        UUID userId = UUID.randomUUID();
        User user = new User();
        Cart cart = new Cart();

        when(entityFetcher.getUser(userId)).thenReturn(user);
        when(entityFetcher.getCart(user)).thenReturn(cart);

        assertThrows(BadRequestException.class, () -> orderService.checkout(userId));
        verify(orderRepository, never()).save(any(Order.class));
    }

    @Test
    void checkoutThrowsWhenRestaurantClosed() {
        UUID userId = UUID.randomUUID();
        User user = new User();

        Restaurant restaurant = new Restaurant();
        restaurant.setStatus(RestaurantStatus.CLOSED);

        MenuItem item = new MenuItem();
        item.setOrderCount(0);

        Cart cart = new Cart();
        cart.setRestaurant(restaurant);
        cart.setTotalAmount(100.0);
        cart.getItems().add(buildCartItem(item, 1, 100.0, cart));

        when(entityFetcher.getUser(userId)).thenReturn(user);
        when(entityFetcher.getCart(user)).thenReturn(cart);

        assertThrows(BadRequestException.class, () -> orderService.checkout(userId));
        verify(orderRepository, never()).save(any(Order.class));
    }

    @Test
    void updateOrderStatusThrowsWhenOwnerDoesNotOwnOrder() {
        UUID ownerId = UUID.randomUUID();
        UUID differentOwnerId = UUID.randomUUID();

        User owner = new User();
        owner.setPublicId(differentOwnerId);

        Restaurant restaurant = new Restaurant();
        restaurant.setOwner(owner);

        Order order = new Order();
        order.setRestaurant(restaurant);
        order.setStatus(OrderStatus.PENDING);

        when(entityFetcher.getUser(ownerId)).thenReturn(new User());
        when(entityFetcher.getOrder(10L)).thenReturn(order);

        assertThrows(BadRequestException.class,
                () -> orderService.updateOrderStatus(10L, OrderStatus.PREPARING, ownerId));
    }

    @Test
    void updateOrderStatusAppliesValidTransition() {
        UUID ownerId = UUID.randomUUID();

        User owner = new User();
        owner.setPublicId(ownerId);

        Restaurant restaurant = new Restaurant();
        restaurant.setOwner(owner);

        Order order = new Order();
        order.setRestaurant(restaurant);
        order.setStatus(OrderStatus.PENDING);

        when(entityFetcher.getUser(ownerId)).thenReturn(owner);
        when(entityFetcher.getOrder(11L)).thenReturn(order);

        orderService.updateOrderStatus(11L, OrderStatus.PREPARING, ownerId);

        assertEquals(OrderStatus.PREPARING, order.getStatus());
    }

    @Test
    void rateOrderThrowsWhenRatingOutOfRange() {
        UUID userId = UUID.randomUUID();

        User user = new User();
        user.setPublicId(userId);

        Restaurant restaurant = new Restaurant();
        restaurant.setRating(4.0);
        restaurant.setRatingCount(2);

        Order order = new Order();
        order.setUser(user);
        order.setRestaurant(restaurant);
        order.setStatus(OrderStatus.COMPLETED);

        when(entityFetcher.getUser(userId)).thenReturn(user);
        when(entityFetcher.getOrder(15L)).thenReturn(order);

        assertThrows(BadRequestException.class, () -> orderService.rateOrder(15L, 6, userId));
    }

    private com.JustEat.entity.CartItem buildCartItem(MenuItem item, int qty, double price, Cart cart) {
        com.JustEat.entity.CartItem cartItem = new com.JustEat.entity.CartItem();
        cartItem.setMenuItem(item);
        cartItem.setQuantity(qty);
        cartItem.setPrice(price);
        cartItem.setCart(cart);
        return cartItem;
    }
}

