package com.JustEat.service.Impl;

import com.JustEat.dto.response.RestaurantResponse;
import com.JustEat.entity.Order;
import com.JustEat.entity.Restaurant;
import com.JustEat.entity.User;
import com.JustEat.enums.CuisineType;
import com.JustEat.enums.Location;
import com.JustEat.enums.OrderStatus;
import com.JustEat.enums.RestaurantStatus;
import com.JustEat.repository.OrderRepository;
import com.JustEat.repository.RestaurantRepository;
import com.JustEat.repository.UserPreferenceRepository;
import com.JustEat.repository.UserRepository;
import com.JustEat.service.helper.EntityFetcher;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceImplTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private EntityFetcher entityFetcher;
    @Mock
    private UserPreferenceRepository userPreferenceRepository;
    @Mock
    private RestaurantRepository restaurantRepository;
    @Mock
    private OrderRepository orderRepository;

    @InjectMocks
    private UserServiceImpl userService;

    @Test
    void getRecommendationsReturnsTopRatedWhenNoPreferenceAndNoHistory() {
        UUID userId = UUID.randomUUID();
        User user = new User();

        Restaurant lowRated = buildRestaurant(1L, "Low Rated", List.of(CuisineType.INDIAN), 3.0);
        Restaurant highRated = buildRestaurant(2L, "High Rated", List.of(CuisineType.ITALIAN), 4.8);

        when(entityFetcher.getUser(userId)).thenReturn(user);
        when(restaurantRepository.findByStatus(RestaurantStatus.OPEN)).thenReturn(List.of(lowRated, highRated));
        when(userPreferenceRepository.findByUser(user)).thenReturn(Optional.empty());
        when(orderRepository.findByUserAndStatusOrderByCreatedAtDesc(user, OrderStatus.COMPLETED)).thenReturn(List.of());

        List<RestaurantResponse> responses = userService.getRecommendations(userId);

        assertEquals(2, responses.size());
        assertEquals("High Rated", responses.get(0).getName());
        assertEquals("Low Rated", responses.get(1).getName());
    }

    @Test
    void getRecommendationsUsesOrderHistoryToBoostRanking() {
        UUID userId = UUID.randomUUID();
        User user = new User();

        Restaurant historyFav = buildRestaurant(10L, "History Fav", List.of(CuisineType.INDIAN), 3.0);
        Restaurant betterRated = buildRestaurant(20L, "Better Rated", List.of(CuisineType.ITALIAN), 4.5);

        Order order1 = buildCompletedOrder(historyFav);
        Order order2 = buildCompletedOrder(historyFav);
        Order order3 = buildCompletedOrder(historyFav);

        when(entityFetcher.getUser(userId)).thenReturn(user);
        when(restaurantRepository.findByStatus(RestaurantStatus.OPEN)).thenReturn(List.of(betterRated, historyFav));
        when(userPreferenceRepository.findByUser(user)).thenReturn(Optional.empty());
        when(orderRepository.findByUserAndStatusOrderByCreatedAtDesc(user, OrderStatus.COMPLETED))
                .thenReturn(List.of(order1, order2, order3));

        List<RestaurantResponse> responses = userService.getRecommendations(userId);

        assertEquals(2, responses.size());
        assertEquals("History Fav", responses.get(0).getName());
        verify(orderRepository).findByUserAndStatusOrderByCreatedAtDesc(user, OrderStatus.COMPLETED);
    }

    @Test
    void getRecommendationsReturnsEmptyWhenNoOpenRestaurants() {
        UUID userId = UUID.randomUUID();
        User user = new User();

        when(entityFetcher.getUser(userId)).thenReturn(user);
        when(restaurantRepository.findByStatus(RestaurantStatus.OPEN)).thenReturn(List.of());

        List<RestaurantResponse> responses = userService.getRecommendations(userId);

        assertTrue(responses.isEmpty());
    }

    private Order buildCompletedOrder(Restaurant restaurant) {
        Order order = new Order();
        order.setRestaurant(restaurant);
        order.setStatus(OrderStatus.COMPLETED);
        return order;
    }

    private Restaurant buildRestaurant(Long id, String name, List<CuisineType> cuisines, double rating) {
        Restaurant restaurant = new Restaurant();
        restaurant.setId(id);
        restaurant.setPublicId(UUID.randomUUID());
        restaurant.setName(name);
        restaurant.setDescription("desc");
        restaurant.setImageUrl("img");
        restaurant.setLocation(Location.DELHI);
        restaurant.setCuisineTypes(cuisines);
        restaurant.setStatus(RestaurantStatus.OPEN);
        restaurant.setRating(rating);
        restaurant.setRatingCount(10);
        return restaurant;
    }
}

