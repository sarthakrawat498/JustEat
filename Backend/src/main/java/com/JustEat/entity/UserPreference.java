package com.JustEat.entity;

import com.JustEat.enums.CuisineType;
import com.JustEat.enums.DietaryRestriction;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Entity
@Getter
@Setter
public class UserPreference extends BaseEntity {
    @NotNull(message = "Preferences must be linked to a user")
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(nullable = false)
    private User user;

    @ElementCollection
    @Enumerated(EnumType.STRING)
    private List<CuisineType> favouriteCuisines;

    @ElementCollection
    @Enumerated(EnumType.STRING)
    private List<DietaryRestriction> dietaryRestrictions;
}
