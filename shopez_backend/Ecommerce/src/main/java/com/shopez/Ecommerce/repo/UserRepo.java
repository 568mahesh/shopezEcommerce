package com.shopez.Ecommerce.repo;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.shopez.Ecommerce.entity.User;

public interface UserRepo extends JpaRepository<User, Long> {
    User findByUsername(String username);
    //Optional<User> findByUsernameAndPassword(String username, String password);
    boolean existsByUsername(String username);
    User findByEmail(String email);
}
