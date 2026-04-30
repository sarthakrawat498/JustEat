package com.JustEat.controller;

import com.JustEat.dto.request.CreateRestaurantRequest;
import com.JustEat.dto.response.RestaurantResponse;
import com.JustEat.entity.Restaurant;
import com.JustEat.enums.Location;
import com.JustEat.service.RestaurantService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/restaurants")
@RequiredArgsConstructor
public class RestaurantController {
    private final RestaurantService restaurantService;

    @PostMapping
    @PreAuthorize("hasRole('OWNER')")
    public Restaurant createRestaurant(@Valid @RequestBody CreateRestaurantRequest request){
        return restaurantService.createRestaurant(request);
    }

    @GetMapping
    public List<RestaurantResponse> getRestaurants(@RequestParam(required = false)Location location){
        return restaurantService.getAllRestaurants(location);
    }

    @GetMapping("/{publicId}")
    public RestaurantResponse getRestaurants(@PathVariable UUID publicId){
        return restaurantService.getRestaurant(publicId);
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('OWNER')")
    public List<RestaurantResponse> getMyRestaurants(){
        return restaurantService.getMyRestaurants();
    }
}
