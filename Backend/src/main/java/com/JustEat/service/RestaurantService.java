package com.JustEat.service;

import com.JustEat.dto.request.CreateRestaurantRequest;
import com.JustEat.dto.response.RestaurantResponse;
import com.JustEat.entity.Restaurant;
import com.JustEat.enums.CuisineType;
import com.JustEat.enums.Location;
import com.JustEat.enums.RestaurantStatus;

import java.util.List;
import java.util.UUID;

public interface RestaurantService {
    Restaurant createRestaurant(CreateRestaurantRequest request);
    List<RestaurantResponse> getAllRestaurants(Location location);
    RestaurantResponse getRestaurant(UUID restaurantId);
    List<RestaurantResponse> getMyRestaurants();
    RestaurantResponse updateRestaurantImage(UUID restaurantId, String imageUrl);
    void updateRestaurantStatus(UUID restaurantId, RestaurantStatus status, UUID ownerId);
    void deleteRestaurant(UUID restaurantId, UUID ownerId);
    List<RestaurantResponse> searchRestaurants(String name,
                                               Location location,
                                               CuisineType cuisine);
}
