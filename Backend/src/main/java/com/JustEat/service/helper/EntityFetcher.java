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

    public User getUser(UUID userId) {
        return userRepository.findByPublicId(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));
    }

    public Restaurant getRestaurant(UUID restaurantId) {
        return restaurantRepository.findByPublicId(restaurantId)
                .orElseThrow(() -> new NotFoundException("Restaurant not found"));
    }

    public MenuItem getMenuItem(Long id) {
        return menuItemRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Menu item not found"));
    }

    public Cart getCart(User user) {
        return cartRepository.findByUser(user)
                .orElseThrow(() -> new NotFoundException("Cart not found"));
    }
    public CartItem getCartItem(Cart cart, MenuItem menuItem){
        return cartItemRepository.findByCartAndMenuItem(cart,menuItem)
                .orElseThrow(()->new BadRequestException("Item not in cart"));
    }

}
