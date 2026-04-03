package com.shopez.Ecommerce.repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.shopez.Ecommerce.entity.Cart;

public interface CartRepo extends JpaRepository<Cart, Long> {
    List<Cart> findByUserId(Long userId);
}
