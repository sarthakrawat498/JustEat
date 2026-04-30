package com.JustEat.service.Impl;

import com.JustEat.dto.request.UpdateUserRequest;
import com.JustEat.dto.response.UserResponse;
import com.JustEat.entity.User;
import com.JustEat.exception.NotFoundException;
import com.JustEat.mapper.UserMapper;
import com.JustEat.repository.UserRepository;
import com.JustEat.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;
    @Override
    public UserResponse getCurrentUser(UUID publicId) {
        User user = userRepository.findByPublicId(publicId).orElseThrow(()->new NotFoundException("User not found"));
        return UserMapper.ToResponse(user);
    }

    @Override
    public UserResponse updateUser(UUID publicId, UpdateUserRequest request) {
        User user = userRepository.findByPublicId(publicId).orElseThrow(()->new NotFoundException("User not found"));
        if(request.getFirstName()!=null)user.setFirstName(request.getFirstName());
        if(request.getLastName()!=null)user.setLastName(request.getLastName());
        if(request.getPhoneNumber()!=null)user.setPhoneNumber(request.getPhoneNumber());
        if(request.getLocation()!=null)user.setLocation(request.getLocation());
        if(request.getGender()!=null)user.setGender(request.getGender());
        if(request.getProfileImageUrl()!=null)user.setProfileImageUrl(request.getProfileImageUrl());
        User updated = userRepository.save(user);
        return UserMapper.ToResponse(updated);
    }

}
