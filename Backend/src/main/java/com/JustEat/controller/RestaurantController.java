package com.JustEat.controller;

import com.JustEat.dto.request.CreateRestaurantRequest;
import com.JustEat.dto.response.RestaurantResponse;
import com.JustEat.entity.Restaurant;
import com.JustEat.enums.CuisineType;
import com.JustEat.enums.Location;
import com.JustEat.service.RestaurantService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/restaurants")
@RequiredArgsConstructor
public class RestaurantController {
    private final RestaurantService restaurantService;

    // POST /restaurants — creates a new restaurant (owner only)
    @PostMapping
    @PreAuthorize("hasRole('OWNER')")
    public Restaurant createRestaurant(@Valid @RequestBody CreateRestaurantRequest request){
        return restaurantService.createRestaurant(request);
    }

    // GET /restaurants — returns all open restaurants, optionally filtered by location
    @GetMapping
    public List<RestaurantResponse> getRestaurants(@RequestParam(required = false)Location location){
        return restaurantService.getAllRestaurants(location);
    }

    // GET /restaurants/{publicId} — returns details for a single open restaurant
    @GetMapping("/{publicId}")
    public RestaurantResponse getRestaurants(@PathVariable UUID publicId){
        return restaurantService.getRestaurant(publicId);
    }

    // GET /restaurants/my — returns all restaurants belonging to the logged-in owner
    @GetMapping("/my")
    @PreAuthorize("hasRole('OWNER')")
    public List<RestaurantResponse> getMyRestaurants(){
        return restaurantService.getMyRestaurants();
    }

    // PATCH /restaurants/{publicId}/image — updates the restaurant's banner image URL
    @PatchMapping("/{publicId}/image")
    @PreAuthorize("hasRole('OWNER')")
    public RestaurantResponse updateImage(@PathVariable UUID publicId,
                                          @RequestBody Map<String, String> body) {
        return restaurantService.updateRestaurantImage(publicId, body.get("imageUrl"));
    }

    // GET /restaurants/search — searches open restaurants by keyword, location, and/or cuisine
    @GetMapping("/search")
    public List<RestaurantResponse> search(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Location location,
            @RequestParam(required = false) CuisineType cuisine) {
        return restaurantService.searchRestaurants(keyword, location, cuisine);
    }
}
