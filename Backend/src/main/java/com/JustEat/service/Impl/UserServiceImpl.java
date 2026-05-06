package com.JustEat.service.Impl;

import com.JustEat.dto.request.UpdateUserRequest;
import com.JustEat.dto.request.UserPreferenceRequest;
import com.JustEat.dto.response.RestaurantResponse;
import com.JustEat.dto.response.UserPreferenceResponse;
import com.JustEat.dto.response.UserResponse;
import com.JustEat.entity.Restaurant;
import com.JustEat.entity.User;
import com.JustEat.entity.UserPreference;
import com.JustEat.enums.CuisineType;
import com.JustEat.enums.DietaryRestriction;
import com.JustEat.enums.RestaurantStatus;
import com.JustEat.mapper.RestaurantMapper;
import com.JustEat.mapper.UserMapper;
import com.JustEat.repository.RestaurantRepository;
import com.JustEat.repository.UserPreferenceRepository;
import com.JustEat.repository.UserRepository;
import com.JustEat.service.UserService;
import com.JustEat.service.helper.EntityFetcher;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;
    private final EntityFetcher entityFetcher;
    private final UserPreferenceRepository userPreferenceRepository;
    private final RestaurantRepository restaurantRepository;

    // Returns profile info for the currently logged-in user
    @Override
    public UserResponse getCurrentUser(UUID publicId) {
        User user = entityFetcher.getUser(publicId);
        return UserMapper.ToResponse(user);
    }

    // Updates only the non-null fields of the user's profile
    @Override
    public UserResponse updateUser(UUID publicId, UpdateUserRequest request) {
        User user = entityFetcher.getUser(publicId);
        if (request.getFirstName() != null) user.setFirstName(request.getFirstName());
        if (request.getLastName() != null) user.setLastName(request.getLastName());
        if (request.getPhoneNumber() != null) user.setPhoneNumber(request.getPhoneNumber());
        if (request.getLocation() != null) user.setLocation(request.getLocation());
        if (request.getGender() != null) user.setGender(request.getGender());
        if (request.getProfileImageUrl() != null) user.setProfileImageUrl(request.getProfileImageUrl());
        User updated = userRepository.save(user);
        return UserMapper.ToResponse(updated);
    }

    // Creates or updates the user's saved cuisine and dietary preferences
    @Override
    @Transactional
    public UserPreferenceResponse savePreference(UUID userId, UserPreferenceRequest request) {
        User user = entityFetcher.getUser(userId);
        UserPreference pref = userPreferenceRepository.findByUser(user)
                .orElseGet(() -> {
                    UserPreference p = new UserPreference();
                    p.setUser(user);
                    return p;
                });

        pref.setFavouriteCuisines(request.getFavouriteCuisines() != null
                ? request.getFavouriteCuisines() : new ArrayList<>());
        pref.setDietaryRestrictions(request.getDietaryRestrictions() != null
                ? request.getDietaryRestrictions() : new ArrayList<>());

        userPreferenceRepository.save(pref);
        return toPreferenceResponse(pref);
    }

    // Returns the user's saved preferences, or empty lists if none are saved yet
    @Override
    public UserPreferenceResponse getPreference(UUID userId) {
        User user = entityFetcher.getUser(userId);
        return userPreferenceRepository.findByUser(user)
                .map(this::toPreferenceResponse)
                .orElse(UserPreferenceResponse.builder()
                        .favouriteCuisines(new ArrayList<>())
                        .dietaryRestrictions(new ArrayList<>())
                        .build());
    }

    // Returns up to 10 recommended open restaurants scored by cuisine match (×2) + rating; falls back to top-rated if no preferences saved
    @Override
    public List<RestaurantResponse> getRecommendations(UUID userId) {
        User user = entityFetcher.getUser(userId);

        // Only open restaurants
        List<Restaurant> allOpen = restaurantRepository.findByStatus(RestaurantStatus.OPEN);

        UserPreference pref = userPreferenceRepository.findByUser(user).orElse(null);

        if (pref == null ||
                (pref.getFavouriteCuisines().isEmpty() && pref.getDietaryRestrictions().isEmpty())) {
            // No preferences saved — return top-rated open restaurants
            return allOpen.stream()
                    .filter(r -> r.getRating() != null && r.getRating() > 0)
                    .sorted(Comparator.comparingDouble(Restaurant::getRating).reversed())
                    .limit(10)
                    .map(RestaurantMapper::toResponse)
                    .collect(Collectors.toList());
        }

        List<CuisineType> cuisines = pref.getFavouriteCuisines();

        // Score each restaurant: cuisine match + rating boost
        return allOpen.stream()
                .map(r -> {
                    double score = 0;
                    if (!cuisines.isEmpty()) {
                        long matches = r.getCuisineTypes().stream()
                                .filter(cuisines::contains)
                                .count();
                        score += matches * 2.0;
                    }
                    if (r.getRating() != null && r.getRating() > 0) {
                        score += r.getRating();
                    }
                    return new Object[]{r, score};
                })
                .filter(pair -> (double) pair[1] > 0)
                .sorted((a, b) -> Double.compare((double) b[1], (double) a[1]))
                .limit(10)
                .map(pair -> RestaurantMapper.toResponse((Restaurant) pair[0]))
                .collect(Collectors.toList());
    }

    // Converts a UserPreference entity into the response DTO, defaulting to empty lists for nulls
    private UserPreferenceResponse toPreferenceResponse(UserPreference pref) {
        return UserPreferenceResponse.builder()
                .favouriteCuisines(pref.getFavouriteCuisines() != null
                        ? pref.getFavouriteCuisines() : new ArrayList<>())
                .dietaryRestrictions(pref.getDietaryRestrictions() != null
                        ? pref.getDietaryRestrictions() : new ArrayList<>())
                .build();
    }
}

