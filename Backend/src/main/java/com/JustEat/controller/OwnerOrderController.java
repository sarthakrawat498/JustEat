package com.JustEat.controller;

import com.JustEat.dto.response.OrderResponse;
import com.JustEat.enums.OrderStatus;
import com.JustEat.service.MenuItemService;
import com.JustEat.service.OrderService;
import com.JustEat.util.SecurityUtils;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/owner")
@RequiredArgsConstructor
@PreAuthorize("hasRole('OWNER')")
public class OwnerOrderController {
    private final OrderService orderService;
    private final MenuItemService menuItemService;
    // GET /owner/orders — returns all orders for the owner's restaurants
    @GetMapping("/orders")
    public List<OrderResponse> getOrders(){
        UUID ownerId = SecurityUtils.getCurrentUserId();
        return orderService.getOwnerOrders(ownerId);
    }

    // PATCH /owner/orders/{id}/status — advances an order to the next status step
    @PatchMapping("/orders/{id}/status")
    public void updateStatus(@PathVariable Long id, @RequestBody Map<String,String> body){
        UUID ownerId = SecurityUtils.getCurrentUserId();
        OrderStatus status = OrderStatus.valueOf(body.get("status"));
        orderService.updateOrderStatus(id,status,ownerId);
    }

    // PATCH /owner/menu/{id}/availability — toggles a menu item's available flag
    @PatchMapping("/menu/{id}/availability")
    public void updateAvailability(@PathVariable Long id , @RequestBody Map<String,Boolean> body){
        UUID ownerID = SecurityUtils.getCurrentUserId();
        boolean available = body.get("available");
        menuItemService.updateMenuItemAvailability(id,available,ownerID);
    }
}
