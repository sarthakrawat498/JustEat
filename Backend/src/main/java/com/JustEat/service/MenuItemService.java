package com.JustEat.service;

import com.JustEat.dto.request.CreateMenuItemRequest;
import com.JustEat.dto.request.UpdateMenuItemRequest;
import com.JustEat.dto.response.MenuItemResponse;

import java.util.List;
import java.util.UUID;

public interface MenuItemService {
    MenuItemResponse addMenuItem(UUID restaurantId, CreateMenuItemRequest request, UUID userID);
    MenuItemResponse updateMenuItem(UUID restaurantId,Long menuItemId,  UpdateMenuItemRequest request, UUID userId);
    void deleteMenuItem(UUID restaurantId, Long menuItemId, UUID userId);
    List<MenuItemResponse> getMenu(UUID restaurantId);
}
