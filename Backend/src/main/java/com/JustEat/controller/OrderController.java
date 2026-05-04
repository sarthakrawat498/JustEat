package com.JustEat.controller;

import com.JustEat.dto.response.OrderResponse;
import com.JustEat.dto.response.RepeatedOrderResponse;
import com.JustEat.service.OrderService;
import com.JustEat.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RequiredArgsConstructor
@RestController
@RequestMapping("/orders")
@PreAuthorize("hasRole('CUSTOMER')")
public class OrderController {
    private final OrderService orderService;

    @PostMapping("/checkout")
    public void checkout(){
        UUID userId = SecurityUtils.getCurrentUserId();
       orderService.checkout(userId);
    }

    @GetMapping
    public List<OrderResponse> getOrders(){
        UUID userId = SecurityUtils.getCurrentUserId();
        return orderService.getUserOrders(userId);
    }

    @PostMapping("/{orderId}/repeat")
    @PreAuthorize("hasRole('CUSTOMER')")
    public RepeatedOrderResponse repeatOrder(@PathVariable Long orderId) {

        UUID userId = SecurityUtils.getCurrentUserId();
        return orderService.repeatOrder(orderId, userId);
    }
}
