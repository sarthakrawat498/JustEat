package com.JustEat.repository;

import com.JustEat.entity.Cart;
import com.JustEat.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CartRepository extends JpaRepository<Cart, Long> {

    Optional<Cart> findByUser(User user);

    void deleteByUser(User user);

    long deleteByRestaurant_PublicId(UUID restaurantPublicId);
}