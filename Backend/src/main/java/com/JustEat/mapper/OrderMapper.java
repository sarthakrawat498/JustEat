package com.JustEat.mapper;

import com.JustEat.dto.response.OrderItemResponse;
import com.JustEat.dto.response.OrderResponse;
import com.JustEat.entity.Order;
import com.JustEat.entity.OrderItem;

import java.util.List;

public class OrderMapper {

    // Converts an Order entity (with its items) into the full order response DTO
    public static OrderResponse toResponse(Order order) {

        List<OrderItemResponse> items = order.getOrderItems() == null
                ? List.of()
                : order.getOrderItems()
                .stream()
                .map(OrderMapper::toItemResponse)
                .toList();

        return OrderResponse.builder()
                .orderId(order.getId())
                .restaurantId(order.getRestaurant().getPublicId())
                .restaurantName(order.getRestaurant().getName())
                .totalAmount(order.getTotalAmount())
                .status(order.getStatus().name())
                .items(items)
                .createdAt(order.getCreatedAt())
                .ratingGiven(order.isRatingGiven())
                .build();
    }

    // Converts a single OrderItem into its response DTO
    public static OrderItemResponse toItemResponse(OrderItem item) {
        return OrderItemResponse.builder()
                .name(item.getMenuItem().getName())
                .quantity(item.getQuantity())
                .price(item.getPrice())
                .menuItemId(item.getMenuItem().getId())
                .build();
    }
}
