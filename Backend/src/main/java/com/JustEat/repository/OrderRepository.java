package com.JustEat.repository;

import com.JustEat.entity.Order;
import com.JustEat.entity.User;
import com.example.JustEat.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByUserOrderByCreatedAtDesc(User user);

    Optional<Order> findByPublicId(UUID publicId);
}