package com.shopez.Ecommerce.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.shopez.Ecommerce.entity.User;
import com.shopez.Ecommerce.repo.UserRepo;
import com.shopez.Ecommerce.security.JwtUtil;
import com.shopez.Ecommerce.service.EmailService;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "http://localhost:4200")
public class AuthController {

    @Autowired
    private UserRepo repo;

    @Autowired
    private PasswordEncoder encoder;

    @Autowired
    private JwtUtil jwtUtil;
    
    @Autowired
    private EmailService emailService;

   

    @PostMapping("/register")
    public Map<String, Object> register(@RequestBody User user) {
        Map<String, Object> res = new HashMap<>();

        if (user.getUsername() == null || user.getUsername().isBlank()) {
            res.put("message", "Username is required");
            res.put("success", false);
            return res;
        }

        if (repo.existsByUsername(user.getUsername())) {
            res.put("message", "Username already exists");
            res.put("success", false);
            return res;
        }

        if (user.getRole() == null || user.getRole().isBlank()) {
            user.setRole("USER");
        }

        user.setPassword(encoder.encode(user.getPassword()));

        // ✅ SAVE USER
        User savedUser = repo.save(user);

        // ✅ SEND EMAIL (AFTER SAVE)
        emailService.sendEmail(
            savedUser.getEmail(),
            "Welcome to Shopez 🎉",
            "Hello " + savedUser.getUsername() +
            ",\n\nYour account has been successfully created.\n\nThank you!"
        );

        res.put("message", "Registered successfully");
        res.put("success", true);
        return res;
    }

    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody User user) {
        Map<String, Object> res = new HashMap<>();

        User dbUser = repo.findByUsername(user.getUsername());

        if (dbUser == null || !encoder.matches(user.getPassword(), dbUser.getPassword())) {
            res.put("message", "Invalid username or password");
            res.put("success", false);
            return res;
        }

        String token = jwtUtil.generateToken(dbUser.getUsername(), dbUser.getRole());

        res.put("id", dbUser.getId());
        res.put("fullname", dbUser.getFullname());
        res.put("username", dbUser.getUsername());
        res.put("role", dbUser.getRole());
        res.put("email", dbUser.getEmail());
        res.put("phone", dbUser.getPhone());
        res.put("token", token);
        res.put("success", true);

        return res;
    }
}