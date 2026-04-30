package com.JustEat.service;

import com.JustEat.dto.request.UpdateUserRequest;
import com.JustEat.dto.response.UserResponse;

import java.util.UUID;

public interface UserService {
    UserResponse getCurrentUser(UUID publicId);
    UserResponse updateUser(UUID publicId , UpdateUserRequest request);
}
