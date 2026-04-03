package com.shopez.Ecommerce.repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.shopez.Ecommerce.entity.OrderHistory;

public interface OrderHistoryRepo extends JpaRepository<OrderHistory, Long> {
    List<OrderHistory> findByUserIdOrderByOrderedAtDesc(Long userId);
}
