package com.JustEat.service;

import com.JustEat.dto.request.CreateRestaurantRequest;
import com.JustEat.dto.response.RestaurantResponse;
import com.JustEat.entity.Restaurant;
import com.JustEat.enums.Location;

import java.util.List;
import java.util.UUID;

public interface RestaurantService {
    Restaurant createRestaurant(CreateRestaurantRequest request);
    List<RestaurantResponse> getAllRestaurants(Location location);
    RestaurantResponse getRestaurant(UUID publicId);
    List<RestaurantResponse> getMyRestaurants();
    RestaurantResponse updateRestaurantImage(UUID publicId, String imageUrl);
}
