package com.JustEat.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AddToCartRequest {
    @NotNull
    private Long menuItemId;
    @Min(1)
    @Max(99)
    private int quantity;
}
