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

    @GetMapping("/me")
    public UserResponse getMyProfile() {
        UUID userId = SecurityUtils.getCurrentUserId();
        return userService.getCurrentUser(userId);
    }

    @PatchMapping("/me")
    public UserResponse updateMyProfile(@RequestBody UpdateUserRequest request) {
        UUID userId = SecurityUtils.getCurrentUserId();
        return userService.updateUser(userId, request);
    }

    @GetMapping("/me/preferences")
    @PreAuthorize("hasRole('CUSTOMER')")
    public UserPreferenceResponse getPreferences() {
        UUID userId = SecurityUtils.getCurrentUserId();
        return userService.getPreference(userId);
    }

    @PutMapping("/me/preferences")
    @PreAuthorize("hasRole('CUSTOMER')")
    public UserPreferenceResponse savePreferences(@RequestBody UserPreferenceRequest request) {
        UUID userId = SecurityUtils.getCurrentUserId();
        return userService.savePreference(userId, request);
    }

    @GetMapping("/me/recommendations")
    @PreAuthorize("hasRole('CUSTOMER')")
    public List<RestaurantResponse> getRecommendations() {
        UUID userId = SecurityUtils.getCurrentUserId();
        return userService.getRecommendations(userId);
    }
}

