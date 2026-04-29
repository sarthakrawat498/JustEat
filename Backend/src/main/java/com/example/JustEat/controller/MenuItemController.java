package com.example.JustEat.controller;

import com.example.JustEat.dto.request.CreateMenuItemRequest;
import com.example.JustEat.dto.response.MenuItemResponse;
import com.example.JustEat.service.MenuItemService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
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
        UUID userId = UUID.fromString(
                SecurityContextHolder.getContext().getAuthentication().getName()
        );
        return menuItemService.addMenuItem(restaurantId, request, userId);
    }

    @GetMapping
    public List<MenuItemResponse> getMenu(@PathVariable UUID restaurantId){
        return menuItemService.getMenu(restaurantId);
    }
}
