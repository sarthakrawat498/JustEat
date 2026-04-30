package com.JustEat.controller;

import com.JustEat.dto.request.UpdateUserRequest;
import com.JustEat.dto.response.UserResponse;
import com.JustEat.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @GetMapping("/me")
    public UserResponse getMyProfile(){
        UUID userId = UUID.fromString(SecurityContextHolder.getContext().getAuthentication().getName());
        return userService.getCurrentUser(userId);
    }

    @PatchMapping("/me")
    public UserResponse updateMyProfile(@RequestBody UpdateUserRequest request){
        UUID userId = UUID.fromString(SecurityContextHolder.getContext().getAuthentication().getName());
        return userService.updateUser(userId,request);
    }
}
