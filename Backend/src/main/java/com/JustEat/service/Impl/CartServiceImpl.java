package com.JustEat.service.Impl;

import com.JustEat.dto.request.AddToCartRequest;
import com.JustEat.dto.request.UpdateCartItemRequest;
import com.JustEat.dto.response.CartItemResponse;
import com.JustEat.dto.response.CartResponse;
import com.JustEat.entity.Cart;
import com.JustEat.entity.CartItem;
import com.JustEat.entity.MenuItem;
import com.JustEat.entity.User;
import com.JustEat.enums.RestaurantStatus;
import com.JustEat.exception.BadRequestException;
import com.JustEat.repository.CartItemRepository;
import com.JustEat.repository.CartRepository;
import com.JustEat.service.CartService;
import com.JustEat.service.helper.CartHelper;
import com.JustEat.service.helper.EntityFetcher;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CartServiceImpl implements CartService {
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final EntityFetcher entityFetcher;
    // Adds a menu item to the user's cart; clears cart first if from a different restaurant
    @Transactional
    @Override
    public void addToCart(AddToCartRequest request, UUID userId) {
        User user = entityFetcher.getUser(userId);
        MenuItem menuItem = entityFetcher.getMenuItem(request.getMenuItemId());
        if (!menuItem.isAvailable()) {
            throw new BadRequestException("Item is not available");
        }
        if (menuItem.getRestaurant().getStatus() != RestaurantStatus.OPEN) {
            throw new BadRequestException("Restaurant is currently closed");
        }
        Cart cart = cartRepository.findByUser(user)
                .orElseGet(()->{
                    Cart newCart = new Cart();
                    newCart.setUser(user);
                    return cartRepository.save(newCart);
                });
        if(cart.getRestaurant() != null &&
                !cart.getRestaurant().getPublicId().equals(menuItem.getRestaurant().getPublicId())) {
            cart.getItems().clear();
            cart.setTotalAmount(0.0);
            cart.setRestaurant(null);
        }
//        System.out.println("Cart restaurant ID: " +
//                (cart.getRestaurant() != null ? cart.getRestaurant().getId() : null));
//
//        System.out.println("MenuItem restaurant ID: " +
//                menuItem.getRestaurant().getId());
        cart.setRestaurant(menuItem.getRestaurant());

        CartItem cartItem = cartItemRepository.findByCartAndMenuItem(cart,menuItem)
                .orElseGet(()->{
                    CartItem newItem = new CartItem();
                    newItem.setCart(cart);
                    newItem.setMenuItem(menuItem);
                    newItem.setQuantity(0);
                    newItem.setPrice(0.0);
                    return newItem;
                });
        if (request.getQuantity() < 0) {
            throw new BadRequestException("Invalid quantity");
        }
        int newQuantity = cartItem.getQuantity() + request.getQuantity();
        cartItem.setQuantity(newQuantity);
        cartItem.setPrice(menuItem.getPrice() * newQuantity);
        cartItemRepository.save(cartItem);

        CartHelper.updateCartTotal(cart);
        cartRepository.save(cart);
    }

    // Returns the user's current cart; returns an empty cart response if the cart is empty
    @Override
    public CartResponse getCart(UUID userId) {
        User user = entityFetcher.getUser(userId);
//        Cart cart = cartRepository.findByUser(user).orElseThrow(()->new RuntimeException("Cart is empty")); bad UX
        Optional<Cart> cartOptional = cartRepository.findByUser(user);
        if(cartOptional.isEmpty() || cartOptional.get().getItems().isEmpty()){
            return CartResponse.builder()
                    .restaurantName(null)
                    .restaurantId(null)
                    .totalAmount(0.0)
                    .items(List.of())
                    .build();
        }
        Cart cart = cartOptional.get();
        List<CartItemResponse> items = cart.getItems().stream()
                .map(item -> CartItemResponse.builder()
                        .menuItemId(item.getMenuItem().getId())
                        .name(item.getMenuItem().getName())
                        .price(item.getPrice())
                        .quantity(item.getQuantity())
                        .imageUrl(item.getMenuItem().getImageUrl())
                        .build())
                .toList();
        return CartResponse.builder()
                .restaurantId(cart.getRestaurant().getPublicId())
                .restaurantName(cart.getRestaurant().getName())
                .totalAmount(cart.getTotalAmount())
                .items(items)
                .build();
    }

    // Updates quantity of an existing cart item; removes the item if quantity is set to 0
    @Transactional
    @Override
    public void updateCartItem(UpdateCartItemRequest request, UUID userId) {
        User user = entityFetcher.getUser(userId);
        Cart cart = entityFetcher.getCart(user);
        MenuItem menuItem = entityFetcher.getMenuItem(request.getMenuItemId());
        CartItem cartItem = entityFetcher.getCartItem(cart,menuItem);
        if (!menuItem.isAvailable()) {
            throw new BadRequestException("Item is not available");
        }
        if (menuItem.getRestaurant().getStatus() != RestaurantStatus.OPEN) {
            throw new BadRequestException("Restaurant is currently closed");
        }
        if (request.getQuantity() < 0) {
            throw new BadRequestException("Invalid quantity");
        }
        //if quantity equal to zero then remove else update
        if(request.getQuantity()==0){
            cart.getItems().remove(cartItem);
        }else{
            cartItem.setQuantity(request.getQuantity());
            cartItem.setPrice(menuItem.getPrice() * request.getQuantity());
        }
        if (cart.getItems().isEmpty()) {
            cart.setRestaurant(null);
        }

        //re calculate total
        CartHelper.updateCartTotal(cart);
        cartRepository.save(cart);
    }

    // Removes a specific item from the cart and recalculates the total
    @Transactional
    @Override
    public void removeItem(Long menuItemId, UUID userId) {
        User user = entityFetcher.getUser(userId);
        Cart cart = entityFetcher.getCart(user);
        MenuItem menuItem = entityFetcher.getMenuItem(menuItemId);
        CartItem cartItem = entityFetcher.getCartItem(cart,menuItem);

        cart.getItems().remove(cartItem);
        CartHelper.updateCartTotal(cart);

        if(cart.getItems().isEmpty())cart.setRestaurant(null);
        cartRepository.save(cart);
    }
}
