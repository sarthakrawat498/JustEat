package com.JustEat.service.Impl;

import com.JustEat.dto.request.CreateRestaurantRequest;
import com.JustEat.dto.response.RestaurantResponse;
import com.JustEat.entity.Restaurant;
import com.JustEat.entity.User;
import com.JustEat.enums.Location;
import com.JustEat.enums.RestaurantStatus;
import com.JustEat.exception.BadRequestException;
import com.JustEat.exception.NotFoundException;
import com.JustEat.mapper.RestaurantMapper;
import com.JustEat.repository.RestaurantRepository;
import com.JustEat.repository.UserRepository;
import com.JustEat.service.RestaurantService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
@Service
@RequiredArgsConstructor
public class RestaurantServiceImpl implements RestaurantService {
    private final UserRepository userRepository;
    private final RestaurantRepository restaurantRepository;
    @Override
    public Restaurant createRestaurant(CreateRestaurantRequest request) {
        //get current user from jwt
        String userIdStr = SecurityContextHolder.getContext().getAuthentication().getName();
        //System.out.println("auth name : " + userIdStr);
        UUID userId = UUID.fromString(userIdStr);
        User owner = userRepository.findByPublicId(userId).orElseThrow(() -> new NotFoundException("User not found"));

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

    public RestaurantResponse getRestaurant(UUID publicId){
        Restaurant restaurant = restaurantRepository.findByPublicId(publicId)
                .orElseThrow(()-> new NotFoundException("Restaurant not found"));
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
        String userIdStr = SecurityContextHolder.getContext().getAuthentication().getName();
        UUID ownerId = UUID.fromString(userIdStr);
        return restaurantRepository.findByOwnerPublicId(ownerId)
                .stream()
                .map(RestaurantMapper::toResponse)
                .toList();
    }
}
