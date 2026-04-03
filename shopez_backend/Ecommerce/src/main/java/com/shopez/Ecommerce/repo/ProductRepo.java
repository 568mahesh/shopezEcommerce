package com.shopez.Ecommerce.repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.shopez.Ecommerce.entity.Product;

public interface ProductRepo extends JpaRepository<Product, Long> {
	List<Product> findByCategory(String category);
	
} 