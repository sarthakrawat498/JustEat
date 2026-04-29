package com.example.JustEat.service.Impl;

import com.example.JustEat.dto.request.CreateMenuItemRequest;
import com.example.JustEat.dto.response.MenuItemResponse;
import com.example.JustEat.entity.MenuItem;
import com.example.JustEat.entity.Restaurant;
import com.example.JustEat.exception.ForbiddenException;
import com.example.JustEat.exception.NotFoundException;
import com.example.JustEat.mapper.MenuItemMapper;
import com.example.JustEat.repository.MenuItemRepository;
import com.example.JustEat.repository.RestaurantRepository;
import com.example.JustEat.service.MenuItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MenuItemServiceImpl implements MenuItemService {
    private final RestaurantRepository restaurantRepository;
    private final MenuItemRepository menuItemRepository;

    @Override
    public MenuItemResponse addMenuItem(UUID restaurantId, CreateMenuItemRequest request, UUID userID) {
        Restaurant restaurant = restaurantRepository.findByPublicId(restaurantId)
                .orElseThrow(() -> new NotFoundException("Restaurant not found"));

        if (!restaurant.getOwner().getPublicId().equals(userID)) {
            throw new ForbiddenException("Not authorized");
        }

        MenuItem item = new MenuItem();
        item.setName(request.getName());
        item.setPrice(request.getPrice());
        item.setDescription(request.getDescription());
        item.setImageUrl(request.getImageUrl());
        item.setCuisineType(request.getCuisineType());
        item.setDietaryRestriction(request.getDietaryRestriction());
        item.setRestaurant(restaurant);

        item.setSpecial(Boolean.TRUE.equals(request.getIsSpecial()));
        item.setAvailable(true);
        item.setOrderCount(0);

        return MenuItemMapper.toResponse(menuItemRepository.save(item));
    }

    @Override
    public List<MenuItemResponse> getMenu(UUID restaurantId) {
        Restaurant restaurant = restaurantRepository.findByPublicId(restaurantId)
                .orElseThrow(() -> new NotFoundException("Restaurant not found"));
        return menuItemRepository.findByRestaurant_Id(restaurant.getId())
                .stream()
                .map(r -> MenuItemMapper.toResponse(r))
                .toList();
    }
}
