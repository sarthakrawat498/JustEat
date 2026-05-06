package com.JustEat.service;

import com.JustEat.dto.response.OrderResponse;
import com.JustEat.dto.response.RepeatedOrderResponse;
import com.JustEat.enums.OrderStatus;

import java.util.List;
import java.util.UUID;

public interface OrderService {
    void checkout(UUID userId);
    List<OrderResponse> getUserOrders(UUID userId);
    List<OrderResponse> getOwnerOrders(UUID ownerID);
    void updateOrderStatus(Long orderId, OrderStatus newStatus, UUID ownerId);
    RepeatedOrderResponse repeatOrder(Long orderId, UUID userId);
    void rateOrder(Long orderId , int ratingValue, UUID userId);
    List<OrderResponse> searchOrders(UUID userId, String keyword);
}
