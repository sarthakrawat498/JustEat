package com.JustEat.repository;

import com.JustEat.entity.Restaurant;
import com.JustEat.enums.CuisineType;
import com.JustEat.enums.Location;
import com.JustEat.enums.RestaurantStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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

    @Query("""
SELECT r FROM Restaurant r
WHERE 
    (:keyword IS NULL OR r.name ILIKE CONCAT('%', CAST(:keyword AS string), '%'))
    AND (:cuisine IS NULL OR :cuisine MEMBER OF r.cuisineTypes)
    AND (:location IS NULL OR r.location = :location)
""")
    List<Restaurant> searchRestaurants(
            @Param("keyword") String keyword,
            @Param("cuisine") CuisineType cuisine,
            @Param("location") Location location
    );
}
