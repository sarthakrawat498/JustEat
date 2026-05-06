package com.JustEat.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@Builder
public class OrderResponse {

    private Long orderId;
    private String restaurantName;
    private UUID restaurantId;
    private Double totalAmount;
    private String status;

    private List<OrderItemResponse> items;
    private LocalDateTime createdAt;
    private boolean ratingGiven;
}
