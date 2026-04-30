package com.JustEat.dto.response;


import com.JustEat.enums.CuisineType;
import com.JustEat.enums.DietaryRestriction;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class MenuItemResponse {
    private Long id;
    private String name;
    private String description;
    private Double price;
    private String imageUrl;
    private CuisineType cuisineType;
    private DietaryRestriction dietaryRestriction;
    private boolean available;
    private boolean isSpecial;
}
