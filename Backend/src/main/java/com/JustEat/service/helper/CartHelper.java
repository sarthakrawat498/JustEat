package com.JustEat.service.helper;

import com.JustEat.entity.Cart;

public class CartHelper {
    public static void updateCartTotal(Cart cart) {
        double total = cart.getItems().stream()
                .mapToDouble(item -> item.getPrice() != null ? item.getPrice() : 0.0)
                .sum();

        cart.setTotalAmount(total);
    }
}
