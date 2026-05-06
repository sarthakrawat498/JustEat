package com.JustEat.service.Impl;

import com.JustEat.dto.request.AddToCartRequest;
import com.JustEat.dto.request.UpdateCartItemRequest;
import com.JustEat.dto.response.CartResponse;
import com.JustEat.entity.Cart;
import com.JustEat.entity.CartItem;
import com.JustEat.entity.MenuItem;
import com.JustEat.entity.Restaurant;
import com.JustEat.entity.User;
import com.JustEat.enums.RestaurantStatus;
import com.JustEat.exception.BadRequestException;
import com.JustEat.repository.CartItemRepository;
import com.JustEat.repository.CartRepository;
import com.JustEat.service.helper.EntityFetcher;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.ArgumentCaptor;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CartServiceImplTest {

    @Mock
    private CartRepository cartRepository;
    @Mock
    private CartItemRepository cartItemRepository;
    @Mock
    private EntityFetcher entityFetcher;

    @InjectMocks
    private CartServiceImpl cartService;

    @Test
    void addToCartThrowsWhenMenuItemUnavailable() {
        UUID userId = UUID.randomUUID();
        User user = new User();
        MenuItem menuItem = new MenuItem();
        menuItem.setAvailable(false);

        AddToCartRequest request = new AddToCartRequest();
        request.setMenuItemId(1L);
        request.setQuantity(2);

        when(entityFetcher.getUser(userId)).thenReturn(user);
        when(entityFetcher.getMenuItem(1L)).thenReturn(menuItem);

        assertThrows(BadRequestException.class, () -> cartService.addToCart(request, userId));
        verify(cartRepository, never()).save(any(Cart.class));
    }

    @Test
    void addToCartClearsCartWhenItemFromDifferentRestaurant() {
        UUID userId = UUID.randomUUID();

        User user = new User();
        Restaurant oldRestaurant = new Restaurant();
        oldRestaurant.setPublicId(UUID.randomUUID());

        Restaurant newRestaurant = new Restaurant();
        newRestaurant.setPublicId(UUID.randomUUID());
        newRestaurant.setStatus(RestaurantStatus.OPEN);

        MenuItem menuItem = new MenuItem();
        menuItem.setId(11L);
        menuItem.setAvailable(true);
        menuItem.setPrice(100.0);
        menuItem.setRestaurant(newRestaurant);

        Cart cart = new Cart();
        cart.setUser(user);
        cart.setRestaurant(oldRestaurant);

        CartItem existingItem = new CartItem();
        existingItem.setQuantity(1);
        existingItem.setPrice(50.0);
        cart.getItems().add(existingItem);

        AddToCartRequest request = new AddToCartRequest();
        request.setMenuItemId(11L);
        request.setQuantity(2);

        when(entityFetcher.getUser(userId)).thenReturn(user);
        when(entityFetcher.getMenuItem(11L)).thenReturn(menuItem);
        when(cartRepository.findByUser(user)).thenReturn(Optional.of(cart));
        when(cartItemRepository.findByCartAndMenuItem(cart, menuItem)).thenReturn(Optional.empty());

        cartService.addToCart(request, userId);

        assertEquals(newRestaurant, cart.getRestaurant());
        ArgumentCaptor<CartItem> cartItemCaptor = ArgumentCaptor.forClass(CartItem.class);
        verify(cartItemRepository).save(cartItemCaptor.capture());
        assertEquals(2, cartItemCaptor.getValue().getQuantity());
        assertEquals(200.0, cartItemCaptor.getValue().getPrice());
        verify(cartRepository).save(cart);
    }

    @Test
    void getCartReturnsEmptyResponseWhenCartMissing() {
        UUID userId = UUID.randomUUID();
        User user = new User();

        when(entityFetcher.getUser(userId)).thenReturn(user);
        when(cartRepository.findByUser(user)).thenReturn(Optional.empty());

        CartResponse response = cartService.getCart(userId);

        assertEquals(0.0, response.getTotalAmount());
        assertTrue(response.getItems().isEmpty());
        assertNull(response.getRestaurantId());
    }

    @Test
    void updateCartItemRemovesItemWhenQuantityIsZero() {
        UUID userId = UUID.randomUUID();

        User user = new User();
        Restaurant restaurant = new Restaurant();
        restaurant.setStatus(RestaurantStatus.OPEN);

        MenuItem menuItem = new MenuItem();
        menuItem.setId(7L);
        menuItem.setAvailable(true);
        menuItem.setPrice(120.0);
        menuItem.setRestaurant(restaurant);

        Cart cart = new Cart();
        cart.setUser(user);
        cart.setRestaurant(restaurant);

        CartItem cartItem = new CartItem();
        cartItem.setMenuItem(menuItem);
        cartItem.setQuantity(1);
        cartItem.setPrice(120.0);
        cart.getItems().add(cartItem);

        UpdateCartItemRequest request = new UpdateCartItemRequest();
        request.setMenuItemId(7L);
        request.setQuantity(0);

        when(entityFetcher.getUser(userId)).thenReturn(user);
        when(entityFetcher.getCart(user)).thenReturn(cart);
        when(entityFetcher.getMenuItem(7L)).thenReturn(menuItem);
        when(entityFetcher.getCartItem(cart, menuItem)).thenReturn(cartItem);

        cartService.updateCartItem(request, userId);

        assertTrue(cart.getItems().isEmpty());
        assertNull(cart.getRestaurant());
        assertEquals(0.0, cart.getTotalAmount());
        verify(cartRepository).save(cart);
    }
}

