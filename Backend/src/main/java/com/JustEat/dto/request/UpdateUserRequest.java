package com.JustEat.dto.request;

import com.JustEat.enums.Gender;
import com.JustEat.enums.Location;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateUserRequest {
    private String firstName;
    private String lastName;
    private String phoneNumber;
    private Location location;
    private Gender gender;
    private String profileImageUrl;
}
