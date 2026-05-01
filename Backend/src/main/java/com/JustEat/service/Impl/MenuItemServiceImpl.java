package com.JustEat.service.Impl;

import com.JustEat.dto.request.CreateMenuItemRequest;
import com.JustEat.dto.request.UpdateMenuItemRequest;
import com.JustEat.dto.response.MenuItemResponse;
import com.JustEat.entity.MenuItem;
import com.JustEat.entity.Restaurant;
import com.JustEat.exception.BadRequestException;
import com.JustEat.exception.ForbiddenException;
import com.JustEat.mapper.MenuItemMapper;
import com.JustEat.repository.MenuItemRepository;
import com.JustEat.service.MenuItemService;
import com.JustEat.service.helper.EntityFetcher;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MenuItemServiceImpl implements MenuItemService {
    private final MenuItemRepository menuItemRepository;
    private final EntityFetcher entityFetcher;

    @Override
    public MenuItemResponse addMenuItem(UUID restaurantId, CreateMenuItemRequest request, UUID userID) {
        Restaurant restaurant = entityFetcher.getRestaurant(restaurantId);

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
    public MenuItemResponse updateMenuItem(UUID restaurantId, Long menuItemId, UpdateMenuItemRequest request, UUID userId) {
        Restaurant restaurant = entityFetcher.getRestaurant(restaurantId);

        MenuItem menuItem = entityFetcher.getMenuItem(menuItemId);
//        System.out.println("Item Restaurant PublicId: " + menuItem.getRestaurant().getPublicId());
//        System.out.println("Request Restaurant PublicId: " + restaurant.getPublicId());
        if (!restaurant.getOwner().getPublicId().equals(userId)) {
            throw new ForbiddenException("Not authorized");
        }

        if(!menuItem.getRestaurant().getId().equals(restaurant.getId()))throw new BadRequestException("Menu item does not belong to this restaurant ");
        if(request.getName()!=null){
            menuItem.setName(request.getName());
        }
        if(request.getPrice()!=null){
            menuItem.setPrice(request.getPrice());
        }
        if(request.getDescription()!=null){
            menuItem.setDescription(request.getDescription());
        }
        if (request.getImageUrl() != null) {
            menuItem.setImageUrl(request.getImageUrl());
        }

        if (request.getCuisineType() != null) {
            menuItem.setCuisineType(request.getCuisineType());
        }

        if (request.getDietaryRestriction() != null) {
            menuItem.setDietaryRestriction(request.getDietaryRestriction());
        }

        if (request.getIsSpecial() != null) {
            menuItem.setSpecial(request.getIsSpecial());
        }

        if(request.getIsAvailable()!=null){
            menuItem.setAvailable(request.getIsAvailable());
        }
        return MenuItemMapper.toResponse(menuItemRepository.save(menuItem));
    }

    @Override
    public void deleteMenuItem(UUID restaurantId, Long menuItemId, UUID userId) {
        Restaurant restaurant = entityFetcher.getRestaurant(restaurantId);
        MenuItem menuItem = entityFetcher.getMenuItem(menuItemId);
        if(!restaurant.getOwner().getPublicId().equals(userId))throw new ForbiddenException("Not authorized");
        if(!menuItem.getRestaurant().getId().equals(restaurant.getId()))throw new BadRequestException("Menu item does not belong to this restaurant");
        menuItemRepository.delete(menuItem);
    }

    @Override
    public List<MenuItemResponse> getMenu(UUID restaurantId) {
        Restaurant restaurant = entityFetcher.getRestaurant(restaurantId);
        return menuItemRepository
                .findByRestaurant_PublicIdAndIsAvailableTrue(restaurantId)
                .stream()
                .map(r -> MenuItemMapper.toResponse(r))
                .toList();
    }
}
