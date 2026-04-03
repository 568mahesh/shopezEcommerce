package com.shopez.Ecommerce.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.shopez.Ecommerce.entity.Cart;
import com.shopez.Ecommerce.repo.CartRepo;

@Service
public class CartService {

    @Autowired
    CartRepo repo;

    public Cart addToCart(Cart cart) {
        return repo.save(cart);
    }

    public List<Cart> getCart(Long userId) {
        return repo.findByUserId(userId);
    }
}