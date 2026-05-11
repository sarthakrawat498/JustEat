package com.JustEat.service.Impl;

import com.JustEat.dto.request.UpdateUserRequest;
import com.JustEat.dto.request.UserPreferenceRequest;
import com.JustEat.dto.response.RestaurantResponse;
import com.JustEat.dto.response.UserPreferenceResponse;
import com.JustEat.dto.response.UserResponse;
import com.JustEat.entity.MenuItem;
import com.JustEat.entity.Order;
import com.JustEat.entity.Restaurant;
import com.JustEat.entity.User;
import com.JustEat.entity.UserPreference;
import com.JustEat.enums.CuisineType;
import com.JustEat.enums.DietaryRestriction;
import com.JustEat.enums.OrderStatus;
import com.JustEat.enums.RestaurantStatus;
import com.JustEat.mapper.RestaurantMapper;
import com.JustEat.mapper.UserMapper;
import com.JustEat.repository.OrderRepository;
import com.JustEat.repository.RestaurantRepository;
import com.JustEat.repository.UserPreferenceRepository;
import com.JustEat.repository.UserRepository;
import com.JustEat.service.UserService;
import com.JustEat.service.helper.EntityFetcher;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;
    private final EntityFetcher entityFetcher;
    private final UserPreferenceRepository userPreferenceRepository;
    private final RestaurantRepository restaurantRepository;
    private final OrderRepository orderRepository;

    // Returns profile info for the currently logged-in user
    @Override
    public UserResponse getCurrentUser(UUID publicId) {
        User user = entityFetcher.getUser(publicId);
        return UserMapper.ToResponse(user);
    }

    // Updates only the non-null fields of the user's profile
    @Override
    @Transactional
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
        if (allOpen.isEmpty()) {
            return List.of();
        }

        UserPreference pref = userPreferenceRepository.findByUser(user).orElse(null);
        List<Order> completedOrders = orderRepository.findByUserAndStatusOrderByCreatedAtDesc(user, OrderStatus.COMPLETED);

        boolean hasPreference = pref != null &&
                ((pref.getFavouriteCuisines() != null && !pref.getFavouriteCuisines().isEmpty()) ||
                        (pref.getDietaryRestrictions() != null && !pref.getDietaryRestrictions().isEmpty()));
        boolean hasHistory = !completedOrders.isEmpty();

        if (!hasPreference && !hasHistory) {
            // No preferences saved — return top-rated open restaurants
            return allOpen.stream()
                    .filter(r -> r.getRating() != null && r.getRating() > 0)
                    .sorted(Comparator.comparingDouble(Restaurant::getRating).reversed())
                    .limit(10)
                    .map(RestaurantMapper::toResponse)
                    .collect(Collectors.toList());
        }

        List<CuisineType> cuisines = hasPreference && pref.getFavouriteCuisines() != null
                ? pref.getFavouriteCuisines()
                : Collections.emptyList();
        List<DietaryRestriction> dietaryRestrictions = hasPreference && pref.getDietaryRestrictions() != null
                ? pref.getDietaryRestrictions()
                : Collections.emptyList();
        Map<Long, Long> restaurantFrequency = buildRestaurantFrequency(completedOrders);
        Map<CuisineType, Long> cuisineFrequency = buildCuisineFrequency(completedOrders);

        long maxRestaurantFrequency = restaurantFrequency.values().stream()
                .mapToLong(Long::longValue)
                .max()
                .orElse(1L);
        long maxCuisineFrequency = cuisineFrequency.values().stream()
                .mapToLong(Long::longValue)
                .max()
                .orElse(1L);

        // Score each restaurant using preferences, order history, and rating.
        return allOpen.stream()
                .map(r -> new Object[]{r, scoreRestaurant(
                        r,
                        cuisines,
                        dietaryRestrictions,
                        restaurantFrequency,
                        cuisineFrequency,
                        maxRestaurantFrequency,
                        maxCuisineFrequency
                )})
                .filter(pair -> (double) pair[1] > 0)
                .sorted((a, b) -> Double.compare((double) b[1], (double) a[1]))
                .limit(10)
                .map(pair -> RestaurantMapper.toResponse((Restaurant) pair[0]))
                .collect(Collectors.toList());
    }

    private Map<Long, Long> buildRestaurantFrequency(List<Order> completedOrders) {
        Map<Long, Long> frequency = new HashMap<>();
        for (Order order : completedOrders) {
            if (order.getRestaurant() != null && order.getRestaurant().getId() != null) {
                frequency.merge(order.getRestaurant().getId(), 1L, Long::sum);
            }
        }
        return frequency;
    }

    private Map<CuisineType, Long> buildCuisineFrequency(List<Order> completedOrders) {
        Map<CuisineType, Long> frequency = new HashMap<>();
        for (Order order : completedOrders) {
            if (order.getRestaurant() == null || order.getRestaurant().getCuisineTypes() == null) {
                continue;
            }
            for (CuisineType cuisine : order.getRestaurant().getCuisineTypes()) {
                frequency.merge(cuisine, 1L, Long::sum);
            }
        }
        return frequency;
    }

    private double scoreRestaurant(Restaurant restaurant,
                                   List<CuisineType> favouriteCuisines,
                                   List<DietaryRestriction> dietaryRestrictions,
                                   Map<Long, Long> restaurantFrequency,
                                   Map<CuisineType, Long> cuisineFrequency,
                                   long maxRestaurantFrequency,
                                   long maxCuisineFrequency) {
        double score = 0.0;
        List<CuisineType> restaurantCuisines = restaurant.getCuisineTypes() != null
                ? restaurant.getCuisineTypes()
                : Collections.emptyList();

        if (!favouriteCuisines.isEmpty() && !restaurantCuisines.isEmpty()) {
            long matches = restaurantCuisines.stream()
                    .filter(favouriteCuisines::contains)
                    .count();
            score += matches * 3.0;
        }

        if (!cuisineFrequency.isEmpty() && !restaurantCuisines.isEmpty()) {
            long historicalCuisineWeight = restaurantCuisines.stream()
                    .mapToLong(c -> cuisineFrequency.getOrDefault(c, 0L))
                    .sum();
            score += ((double) historicalCuisineWeight / maxCuisineFrequency) * 2.5;
        }

        // Score based on dietary restrictions match
        if (!dietaryRestrictions.isEmpty()) {
            List<MenuItem> menuItems = restaurant.getMenuItems() != null
                    ? restaurant.getMenuItems()
                    : Collections.emptyList();
            long dietaryMatches = menuItems.stream()
                    .filter(item -> item.getDietaryRestriction() != null &&
                            dietaryRestrictions.contains(item.getDietaryRestriction()))
                    .count();
            if (!menuItems.isEmpty()) {
                score += ((double) dietaryMatches / menuItems.size()) * 2.0;
            }
        }

        Long repeatCount = restaurant.getId() == null ? null : restaurantFrequency.get(restaurant.getId());
        if (repeatCount != null && repeatCount > 0) {
            score += ((double) repeatCount / maxRestaurantFrequency) * 2.0;
        }

        if (restaurant.getRating() != null && restaurant.getRating() > 0) {
            score += restaurant.getRating() * 0.8;
        }

        return score;
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

