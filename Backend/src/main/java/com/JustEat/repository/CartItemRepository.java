package com.JustEat.repository;

import com.JustEat.entity.Cart;
import com.JustEat.entity.CartItem;
import com.JustEat.entity.MenuItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {

    List<CartItem> findByCart(Cart cart);

    Optional<CartItem> findByCartAndMenuItem(Cart cart, MenuItem menuItem);

    void deleteByCart(Cart cart);
}
