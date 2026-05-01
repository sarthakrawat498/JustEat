package com.JustEat.service;

import com.JustEat.dto.request.AddToCartRequest;
import com.JustEat.dto.request.UpdateCartItemRequest;
import com.JustEat.dto.response.CartResponse;

import java.util.UUID;

public interface CartService {
    void addToCart(AddToCartRequest request, UUID userId);
    CartResponse getCart(UUID userId);
    void updateCartItem(UpdateCartItemRequest request, UUID userId);
    void removeItem(Long menuItemId, UUID userId);
}
