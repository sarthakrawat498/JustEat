package com.JustEat.dto.request;

import com.JustEat.enums.CuisineType;
import com.JustEat.enums.DietaryRestriction;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class UserPreferenceRequest {
    private List<CuisineType> favouriteCuisines;
    private List<DietaryRestriction> dietaryRestrictions;
}
