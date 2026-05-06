package com.JustEat.service.Impl;

import com.JustEat.dto.response.RestaurantResponse;
import com.JustEat.entity.Restaurant;
import com.JustEat.entity.User;
import com.JustEat.enums.CuisineType;
import com.JustEat.enums.Location;
import com.JustEat.enums.RestaurantStatus;
import com.JustEat.exception.BadRequestException;
import com.JustEat.repository.RestaurantRepository;
import com.JustEat.service.helper.EntityFetcher;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RestaurantServiceImplTest {

    @Mock
    private RestaurantRepository restaurantRepository;
    @Mock
    private EntityFetcher entityFetcher;

    @InjectMocks
    private RestaurantServiceImpl restaurantService;

    @Test
    void getRestaurantThrowsWhenRestaurantClosed() {
        Restaurant restaurant = buildRestaurant("Closed Kitchen", RestaurantStatus.CLOSED);
        when(entityFetcher.getRestaurant(restaurant.getPublicId())).thenReturn(restaurant);

        assertThrows(BadRequestException.class,
                () -> restaurantService.getRestaurant(restaurant.getPublicId()));
    }

    @Test
    void searchRestaurantsConvertsBlankKeywordToNull() {
        Restaurant restaurant = buildRestaurant("Pizza Hub", RestaurantStatus.OPEN);
        when(restaurantRepository.searchRestaurants(isNull(), eq(CuisineType.ITALIAN), eq(Location.DELHI)))
                .thenReturn(List.of(restaurant));

        List<RestaurantResponse> response =
                restaurantService.searchRestaurants("   ", Location.DELHI, CuisineType.ITALIAN);

        assertEquals(1, response.size());
        assertEquals("Pizza Hub", response.get(0).getName());
        verify(restaurantRepository).searchRestaurants(null, CuisineType.ITALIAN, Location.DELHI);
    }

    @Test
    void updateRestaurantStatusThrowsWhenOwnerMismatch() {
        UUID ownerId = UUID.randomUUID();

        User actualOwner = new User();
        actualOwner.setPublicId(UUID.randomUUID());

        Restaurant restaurant = buildRestaurant("Noodle Point", RestaurantStatus.OPEN);
        restaurant.setOwner(actualOwner);

        when(entityFetcher.getUser(ownerId)).thenReturn(new User());
        when(entityFetcher.getRestaurant(restaurant.getPublicId())).thenReturn(restaurant);

        assertThrows(BadRequestException.class,
                () -> restaurantService.updateRestaurantStatus(restaurant.getPublicId(), RestaurantStatus.CLOSED, ownerId));
    }

    private Restaurant buildRestaurant(String name, RestaurantStatus status) {
        Restaurant restaurant = new Restaurant();
        restaurant.setPublicId(UUID.randomUUID());
        restaurant.setName(name);
        restaurant.setDescription("desc");
        restaurant.setImageUrl("img");
        restaurant.setLocation(Location.DELHI);
        restaurant.setCuisineTypes(List.of(CuisineType.ITALIAN));
        restaurant.setStatus(status);
        restaurant.setRating(4.2);
        restaurant.setRatingCount(10);
        return restaurant;
    }
}

