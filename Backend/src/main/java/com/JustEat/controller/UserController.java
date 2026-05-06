package com.JustEat.controller;

import com.JustEat.dto.request.UpdateUserRequest;
import com.JustEat.dto.request.UserPreferenceRequest;
import com.JustEat.dto.response.RestaurantResponse;
import com.JustEat.dto.response.UserPreferenceResponse;
import com.JustEat.dto.response.UserResponse;
import com.JustEat.service.UserService;
import com.JustEat.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    // GET /users/me — returns the logged-in user's profile
    @GetMapping("/me")
    public UserResponse getMyProfile() {
        UUID userId = SecurityUtils.getCurrentUserId();
        return userService.getCurrentUser(userId);
    }

    // PATCH /users/me — updates the logged-in user's profile fields
    @PatchMapping("/me")
    public UserResponse updateMyProfile(@RequestBody UpdateUserRequest request) {
        UUID userId = SecurityUtils.getCurrentUserId();
        return userService.updateUser(userId, request);
    }

    // GET /users/me/preferences — returns the customer's saved cuisine and dietary preferences
    @GetMapping("/me/preferences")
    @PreAuthorize("hasRole('CUSTOMER')")
    public UserPreferenceResponse getPreferences() {
        UUID userId = SecurityUtils.getCurrentUserId();
        return userService.getPreference(userId);
    }

    // PUT /users/me/preferences — saves or updates the customer's cuisine and dietary preferences
    @PutMapping("/me/preferences")
    @PreAuthorize("hasRole('CUSTOMER')")
    public UserPreferenceResponse savePreferences(@RequestBody UserPreferenceRequest request) {
        UUID userId = SecurityUtils.getCurrentUserId();
        return userService.savePreference(userId, request);
    }

    // GET /users/me/recommendations — returns personalised restaurant recommendations for the customer
    @GetMapping("/me/recommendations")
    @PreAuthorize("hasRole('CUSTOMER')")
    public List<RestaurantResponse> getRecommendations() {
        UUID userId = SecurityUtils.getCurrentUserId();
        return userService.getRecommendations(userId);
    }
}

