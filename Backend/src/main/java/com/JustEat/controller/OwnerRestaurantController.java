package com.JustEat.controller;

import com.JustEat.enums.RestaurantStatus;
import com.JustEat.service.RestaurantService;
import com.JustEat.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/owner/restaurants")
@RequiredArgsConstructor
@PreAuthorize("hasRole('OWNER')")
public class OwnerRestaurantController {
    private final RestaurantService restaurantService;

    // PATCH /owner/restaurants/{id}/status — changes a restaurant's status (OPEN / CLOSED)
    @PatchMapping("/{id}/status")
    public void updateStatus(@PathVariable UUID id, @RequestBody Map<String,String> body){
        UUID ownerId = SecurityUtils.getCurrentUserId();
        RestaurantStatus status = RestaurantStatus.valueOf(body.get("status"));
        restaurantService.updateRestaurantStatus(id,status,ownerId);
    }
}
