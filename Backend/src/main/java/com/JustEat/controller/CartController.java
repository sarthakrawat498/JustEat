package com.JustEat.controller;

import com.JustEat.dto.request.AddToCartRequest;
import com.JustEat.dto.request.UpdateCartItemRequest;
import com.JustEat.dto.response.CartResponse;
import com.JustEat.service.CartService;
import com.JustEat.util.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/cart")
@RequiredArgsConstructor
@PreAuthorize("hasRole('CUSTOMER')")
public class CartController {
    private final CartService cartService;

    // POST /cart/add-item — adds an item to the customer's cart
    @PostMapping("/add-item")
    public void addToCart(@Valid @RequestBody AddToCartRequest request){
        UUID userId = SecurityUtils.getCurrentUserId();
        cartService.addToCart(request,userId);
    }
    // GET /cart — returns the customer's current cart with items and total
    @GetMapping
    public CartResponse getCart(){
        UUID userId = SecurityUtils.getCurrentUserId();
        return cartService.getCart(userId);
    }
    // PATCH /cart/update-item — changes the quantity of an existing cart item (0 removes it)
    @PatchMapping("/update-item")
    public void updateCartItem(@Valid @RequestBody UpdateCartItemRequest request){
        UUID userId = SecurityUtils.getCurrentUserId();
        cartService.updateCartItem(request,userId);
    }
    // DELETE /cart/remove-item/{menuItemId} — removes a specific item from the cart
    @DeleteMapping("/remove-item/{menuItemId}")
    public void removeItem(@PathVariable Long menuItemId){
        UUID userId = SecurityUtils.getCurrentUserId();
        cartService.removeItem(menuItemId, userId);
    }
}
