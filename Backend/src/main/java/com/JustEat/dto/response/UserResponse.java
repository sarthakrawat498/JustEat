package com.JustEat.dto.response;

import com.JustEat.enums.Gender;
import com.JustEat.enums.Location;
import com.JustEat.enums.Role;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@Builder
public class UserResponse {
    private UUID pubicId;
    private String email;
    private String firstName;
    private String lastName;
    private String phoneNumber;
    private Gender gender;
    private Role role;
    private Location location;
    private String profileImageUrl;
}
