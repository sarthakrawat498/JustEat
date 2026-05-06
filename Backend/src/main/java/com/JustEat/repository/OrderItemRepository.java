package com.JustEat.repository;

import com.JustEat.entity.Order;
import com.JustEat.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    List<OrderItem> findByOrder(Order order);

    // Returns [menuItemId, totalQuantityOrdered] for each item in a restaurant
    @Query("SELECT oi.menuItem.id, SUM(oi.quantity) FROM OrderItem oi " +
           "WHERE oi.menuItem.restaurant.publicId = :restaurantId " +
           "GROUP BY oi.menuItem.id")
    List<Object[]> sumQuantityByMenuItemForRestaurant(@Param("restaurantId") UUID restaurantId);
}
