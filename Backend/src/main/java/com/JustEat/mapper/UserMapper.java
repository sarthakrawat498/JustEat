package com.JustEat.mapper;

import com.JustEat.dto.response.UserResponse;
import com.JustEat.entity.User;
import com.JustEat.enums.Gender;
import com.JustEat.enums.Location;
import com.JustEat.enums.Role;

public class UserMapper {
    public static UserResponse ToResponse(User user){
        return UserResponse.builder()
                .pubicId(user.getPublicId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .phoneNumber(user.getPhoneNumber())
                .role(Role.valueOf(user.getRole().name()))
                .gender(Gender.valueOf(user.getGender().name()))
                .location(Location.valueOf(user.getLocation().name()))
                .profileUrl(user.getProfileUrl())
                .build();
    }
}
