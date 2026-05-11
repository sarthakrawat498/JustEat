package com.JustEat.repository;

import com.JustEat.entity.Order;
import com.JustEat.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByUserOrderByCreatedAtDesc(User user);
    Optional<Order> findByPublicId(UUID publicId);
    List<Order> findByRestaurant_OwnerOrderByCreatedAtDesc(User owner) ;
    List<Order> findByUser_PublicIdAndRestaurant_NameContainingIgnoreCase(
            UUID userId,
            String keyword
    );
}