package com.JustEat.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateCartItemRequest {
    @NotNull
    private Long menuItemId;
    @Min(0)
    @Max(99)
    private int quantity;
}
