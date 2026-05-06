package com.JustEat.service.Impl;

import com.JustEat.dto.request.CreateMenuItemRequest;
import com.JustEat.dto.request.UpdateMenuItemRequest;
import com.JustEat.dto.response.MenuItemResponse;
import com.JustEat.entity.MenuItem;
import com.JustEat.entity.Restaurant;
import com.JustEat.entity.User;
import com.JustEat.exception.BadRequestException;
import com.JustEat.exception.ForbiddenException;
import com.JustEat.mapper.MenuItemMapper;
import com.JustEat.repository.MenuItemRepository;
import com.JustEat.repository.OrderItemRepository;
import com.JustEat.service.MenuItemService;
import com.JustEat.service.helper.EntityFetcher;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MenuItemServiceImpl implements MenuItemService {
    private final MenuItemRepository menuItemRepository;
    private final OrderItemRepository orderItemRepository;
    private final EntityFetcher entityFetcher;

    // Adds a new menu item to the restaurant after verifying the caller is the owner
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

    // Updates only the non-null fields of an existing menu item after verifying ownership
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

    // Deletes a menu item after verifying it belongs to the owner's restaurant
    @Override
    public void deleteMenuItem(UUID restaurantId, Long menuItemId, UUID userId) {
        Restaurant restaurant = entityFetcher.getRestaurant(restaurantId);
        MenuItem menuItem = entityFetcher.getMenuItem(menuItemId);
        if(!restaurant.getOwner().getPublicId().equals(userId))throw new ForbiddenException("Not authorized");
        if(!menuItem.getRestaurant().getId().equals(restaurant.getId()))throw new BadRequestException("Menu item does not belong to this restaurant");
        menuItemRepository.delete(menuItem);
    }

    // Returns all available items for a restaurant, with live order counts and mostlyOrdered flags based on historical data
    @Override
    public List<MenuItemResponse> getMenu(UUID restaurantId) {
        // Build a live frequency map from all historical OrderItems
        Map<Long, Long> freqMap = new HashMap<>();
        for (Object[] row : orderItemRepository.sumQuantityByMenuItemForRestaurant(restaurantId)) {
            freqMap.put((Long) row[0], (Long) row[1]);
        }

        List<MenuItemResponse> items = menuItemRepository
                .findByRestaurant_PublicIdAndIsAvailableTrue(restaurantId)
                .stream()
                .map(MenuItemMapper::toResponse)
                .collect(java.util.stream.Collectors.toList());

        if (!items.isEmpty() && !freqMap.isEmpty()) {
            // Overlay live order counts
            items.forEach(item -> item.setOrderCount(freqMap.getOrDefault(item.getId(), 0L).intValue()));

            // Flag top 30% most ordered items (or anything above average if fewer than 3 items)
            double avg = items.stream().mapToInt(MenuItemResponse::getOrderCount).average().orElse(0);
            int threshold = (int) Math.max(1, avg);
            items.forEach(item -> item.setMostlyOrdered(item.getOrderCount() >= threshold));
        }
        return items;
    }
    @Transactional
    @Override
    public void updateMenuItemAvailability(Long menuItemId, boolean available, UUID ownerId) {
        User owner = entityFetcher.getUser(ownerId);
        MenuItem item = entityFetcher.getMenuItem(menuItemId);

        if(!item.getRestaurant().getOwner().getPublicId().equals(ownerId))throw new BadRequestException("Not your menu item");

        item.setAvailable(available);
    }
}
