package com.JustEat.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class RepeatedItem {
    private Long menuItemId;
    private int quantity;
    private String name;

    private Double oldPrice;
    private Double newPrice;
}
