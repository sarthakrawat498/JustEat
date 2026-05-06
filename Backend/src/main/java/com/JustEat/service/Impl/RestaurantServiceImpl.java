package com.JustEat.service.Impl;

import com.JustEat.dto.request.CreateRestaurantRequest;
import com.JustEat.dto.response.RestaurantResponse;
import com.JustEat.entity.MenuItem;
import com.JustEat.entity.Restaurant;
import com.JustEat.entity.User;
import com.JustEat.enums.CuisineType;
import com.JustEat.enums.Location;
import com.JustEat.enums.RestaurantStatus;
import com.JustEat.exception.BadRequestException;
import com.JustEat.mapper.RestaurantMapper;
import com.JustEat.repository.RestaurantRepository;
import com.JustEat.service.RestaurantService;
import com.JustEat.service.helper.EntityFetcher;
import com.JustEat.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
@Service
@RequiredArgsConstructor
public class RestaurantServiceImpl implements RestaurantService {
    private final RestaurantRepository restaurantRepository;
    private final EntityFetcher entityFetcher;
    @Override
    public Restaurant createRestaurant(CreateRestaurantRequest request) {
        //get current user from jwt
        UUID userId = SecurityUtils.getCurrentUserId();
        User owner = entityFetcher.getUser(userId);

        //create restaurant
        Restaurant restaurant = new Restaurant();
        restaurant.setName(request.getName());
        restaurant.setDescription(request.getDescription());
        restaurant.setLocation(request.getLocation());
        restaurant.setCuisineTypes(request.getCuisineTypes());
        restaurant.setImageUrl(request.getImageUrl());
        restaurant.setOwner(owner);
        return restaurantRepository.save(restaurant);
    }

    @Override
    public List<RestaurantResponse> getAllRestaurants(Location location) {
        List<Restaurant> restaurants;
        if(location!=null){
            restaurants = restaurantRepository.findByLocationAndStatus(
                    location,
                    RestaurantStatus.OPEN
            );
        }else{
            restaurants = restaurantRepository.findByStatus(
                    RestaurantStatus.OPEN
            );
        }
        return restaurants.stream().map(restaurant -> RestaurantMapper.toResponse(restaurant))
                .toList();
    }

    public RestaurantResponse getRestaurant(UUID restaurantId){
        Restaurant restaurant = entityFetcher.getRestaurant(restaurantId);
        validateRestaurantOpen(restaurant);
        return RestaurantMapper.toResponse(restaurant);
    }

    private void validateRestaurantOpen(Restaurant restaurant) {
        if (restaurant.getStatus() != RestaurantStatus.OPEN) {
            throw new BadRequestException("Restaurant is not available");
        }
    }

    @Override
    public List<RestaurantResponse> getMyRestaurants() {
        UUID ownerId = SecurityUtils.getCurrentUserId();
        return restaurantRepository.findByOwnerPublicId(ownerId)
                .stream()
                .map(RestaurantMapper::toResponse)
                .toList();
    }

    @Override
    public RestaurantResponse updateRestaurantImage(UUID restaurantId, String imageUrl) {
        UUID ownerId = SecurityUtils.getCurrentUserId();
        Restaurant restaurant = entityFetcher.getRestaurant(restaurantId);
        if (!restaurant.getOwner().getPublicId().equals(ownerId)) {
            throw new BadRequestException("You do not own this restaurant");
        }
        restaurant.setImageUrl(imageUrl);
        return RestaurantMapper.toResponse(restaurantRepository.save(restaurant));
    }

    @Override
    public void updateRestaurantStatus(UUID restaurantId, RestaurantStatus status, UUID ownerId) {
        User owner = entityFetcher.getUser(ownerId);
        Restaurant restaurant = entityFetcher.getRestaurant(restaurantId);
        if(!restaurant.getOwner().getPublicId().equals(ownerId)){
            throw new BadRequestException("Not your restaurant");
        }
        restaurant.setStatus(status);
        restaurantRepository.save(restaurant);
    }
    @Override
    public List<RestaurantResponse> searchRestaurants(String keyword,
                                                      Location location,
                                                      CuisineType cuisine) {
        if (keyword != null && keyword.isBlank()) keyword = null;
        return restaurantRepository.searchRestaurants(keyword, cuisine, location)
                .stream()
                .map(RestaurantMapper::toResponse)
                .toList();
    }

}
