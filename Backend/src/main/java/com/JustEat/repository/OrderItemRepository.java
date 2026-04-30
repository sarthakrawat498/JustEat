package com.JustEat.repository;

import com.JustEat.entity.Order;
import com.JustEat.entity.OrderItem;
import com.example.JustEat.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    List<OrderItem> findByOrder(Order order);
}
