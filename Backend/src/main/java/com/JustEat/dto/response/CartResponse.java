package com.JustEat.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.UUID;

@Getter
@Setter
@Builder
public class CartResponse {
    private UUID restaurantId;
    private String restaurantName;
    private Double totalAmount;

    private List<CartItemResponse> items;
}
