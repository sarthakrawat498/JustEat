package com.example.JustEat.service;

import com.example.JustEat.dto.request.CreateMenuItemRequest;
import com.example.JustEat.dto.response.MenuItemResponse;

import java.util.List;
import java.util.UUID;

public interface MenuItemService {
    MenuItemResponse addMenuItem(UUID restaurantId, CreateMenuItemRequest request, UUID userID);
    List<MenuItemResponse> getMenu(UUID restaurantId);
}
