package com.JustEat.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class CartItemResponse {
    private Long menuItemId;
    private String name;
    private Double price;
    private int quantity;
    private String imageUrl;
}
