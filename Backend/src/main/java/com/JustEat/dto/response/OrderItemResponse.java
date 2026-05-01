package com.JustEat.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class OrderItemResponse {
    private String name;
    private int quantity;
    private Double price;
    private Long menutItemId;
}
