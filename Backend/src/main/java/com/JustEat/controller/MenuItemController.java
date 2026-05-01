package com.JustEat.controller;

import com.JustEat.dto.request.CreateMenuItemRequest;
import com.JustEat.dto.request.UpdateMenuItemRequest;
import com.JustEat.dto.response.MenuItemResponse;
import com.JustEat.service.MenuItemService;
import com.JustEat.util.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/restaurants/{restaurantId}/menu")
@RequiredArgsConstructor
public class MenuItemController {
    private final MenuItemService menuItemService;

    @PostMapping
    public MenuItemResponse addMenuItem(@PathVariable UUID restaurantId,
                                        @RequestBody @Valid CreateMenuItemRequest request){
        UUID userId = SecurityUtils.getCurrentUserId();
        return menuItemService.addMenuItem(restaurantId, request, userId);
    }

    @GetMapping
    public List<MenuItemResponse> getMenu(@PathVariable UUID restaurantId){
        return menuItemService.getMenu(restaurantId);
    }

    @PatchMapping("/{menuItemId}")
    @PreAuthorize("hasRole('OWNER')")
    public MenuItemResponse updateMenuItem(@PathVariable UUID restaurantId, @PathVariable Long menuItemId, @RequestBody UpdateMenuItemRequest request){
        UUID userId = SecurityUtils.getCurrentUserId();
        return menuItemService.updateMenuItem(restaurantId, menuItemId, request, userId);
    }

    @DeleteMapping("/{menuItemId}")
    @PreAuthorize("hasRole('OWNER')")
    public void deleteMenuItem(@PathVariable UUID restaurantId, @PathVariable Long menuItemId ){
        UUID userId = SecurityUtils.getCurrentUserId();
        menuItemService.deleteMenuItem(restaurantId,menuItemId,userId);
    }
}
