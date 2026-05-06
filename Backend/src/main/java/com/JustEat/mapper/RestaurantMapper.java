package com.JustEat.mapper;

import com.JustEat.dto.response.RestaurantResponse;
import com.JustEat.entity.Restaurant;

public class RestaurantMapper {
    // Converts a Restaurant entity into its API response DTO
    public static RestaurantResponse toResponse(Restaurant restaurant){
        return RestaurantResponse.builder()
                .publicId(restaurant.getPublicId())
                .name(restaurant.getName())
                .description(restaurant.getDescription())
                .location(restaurant.getLocation())
                .cuisineTypes(restaurant.getCuisineTypes())
                .imageUrl(restaurant.getImageUrl())
                .restaurantStatus(restaurant.getStatus())
                .rating(restaurant.getRating())
                .ratingCount(restaurant.getRatingCount())
                .build();
    }
}
