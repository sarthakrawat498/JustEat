package com.JustEat.service.helper;

import com.JustEat.entity.*;
import com.JustEat.exception.BadRequestException;
import com.JustEat.exception.NotFoundException;
import com.JustEat.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EntityFetcher {
    private final UserRepository userRepository;
    private final RestaurantRepository restaurantRepository;
    private final MenuItemRepository menuItemRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final OrderRepository orderRepository;

    // Finds a user by their public UUID; throws NotFoundException if not found
    public User getUser(UUID userId) {
        return userRepository.findByPublicId(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));
    }

    // Finds a restaurant by its public UUID; throws NotFoundException if not found
    public Restaurant getRestaurant(UUID restaurantId) {
        return restaurantRepository.findByPublicId(restaurantId)
                .orElseThrow(() -> new NotFoundException("Restaurant not found"));
    }

    // Finds a menu item by its numeric ID; throws NotFoundException if not found
    public MenuItem getMenuItem(Long id) {
        return menuItemRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Menu item not found"));
    }

    // Finds the active cart for a user; throws NotFoundException if no cart exists
    public Cart getCart(User user) {
        return cartRepository.findByUser(user)
                .orElseThrow(() -> new NotFoundException("Cart not found"));
    }
    // Finds a specific item inside the cart; throws BadRequestException if the item isn't in the cart
    public CartItem getCartItem(Cart cart, MenuItem menuItem){
        return cartItemRepository.findByCartAndMenuItem(cart,menuItem)
                .orElseThrow(()->new BadRequestException("Item not in cart"));
    }
    // Finds an order by its numeric ID; throws NotFoundException if not found
    public Order getOrder(Long id){
        return orderRepository.findById(id)
                .orElseThrow(()-> new NotFoundException("Order not found"));
    }
}
