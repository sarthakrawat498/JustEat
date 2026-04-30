package com.JustEat.repository;

import com.JustEat.entity.Restaurant;
import com.JustEat.enums.Location;
import com.JustEat.enums.RestaurantStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RestaurantRepository extends JpaRepository<Restaurant,Long> {
    List<Restaurant> findByLocationAndStatus(Location location, RestaurantStatus status);
    List<Restaurant> findByStatus(RestaurantStatus status);
    Optional<Restaurant> findByPublicId(UUID publicId);
    List<Restaurant> findByOwnerPublicId(UUID ownerPublicId);
}
