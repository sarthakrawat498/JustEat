package com.JustEat.mapper;

import com.JustEat.dto.response.MenuItemResponse;
import com.JustEat.entity.MenuItem;

public class MenuItemMapper {
    // Converts a MenuItem entity into its API response DTO
    public static MenuItemResponse toResponse(MenuItem item){
        return MenuItemResponse.builder()
                .id(item.getId())
                .name(item.getName())
                .description(item.getDescription())
                .price(item.getPrice())
                .imageUrl(item.getImageUrl())
                .cuisineType(item.getCuisineType())
                .dietaryRestriction(item.getDietaryRestriction())
                .available(item.isAvailable())
                .isSpecial(item.isSpecial())
                .orderCount(item.getOrderCount() != null ? item.getOrderCount() : 0)
                .build();
    }
}
