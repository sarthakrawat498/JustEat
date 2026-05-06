package com.JustEat.service;

import com.JustEat.dto.request.UpdateUserRequest;
import com.JustEat.dto.request.UserPreferenceRequest;
import com.JustEat.dto.response.RestaurantResponse;
import com.JustEat.dto.response.UserPreferenceResponse;
import com.JustEat.dto.response.UserResponse;

import java.util.List;
import java.util.UUID;

public interface UserService {
    UserResponse getCurrentUser(UUID publicId);
    UserResponse updateUser(UUID publicId, UpdateUserRequest request);
    UserPreferenceResponse savePreference(UUID userId, UserPreferenceRequest request);
    UserPreferenceResponse getPreference(UUID userId);
    List<RestaurantResponse> getRecommendations(UUID userId);
}
