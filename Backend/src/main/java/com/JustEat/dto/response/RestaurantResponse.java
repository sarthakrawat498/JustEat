package com.JustEat.dto.response;

import com.JustEat.enums.CuisineType;
import com.JustEat.enums.Location;
import com.JustEat.enums.RestaurantStatus;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.UUID;

@Getter
@Setter
@Builder
public class RestaurantResponse {
    private UUID publicId;
    private String name;
    private String description;
    private Location location;
    private List<CuisineType> cuisineTypes;
    private String imageUrl;
    private RestaurantStatus restaurantStatus;

    private Double rating;
    private Integer ratingCount;
}
