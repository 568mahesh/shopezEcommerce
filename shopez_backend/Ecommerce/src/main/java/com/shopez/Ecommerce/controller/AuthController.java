package com.shopez.Ecommerce.controller;

import java.util.HashMap;
import java.util.Map;
import java.util.Random;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
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
    
    
    // 1. FORGOT PASSWORD - Send OTP
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(
            @RequestBody Map<String, String> request) {

        String email = request.get("email");

        if (email == null || email.isBlank()) {

            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "success", false,
                            "message", "Email is required"
                    ));
        }

        User user = repo.findByEmail(email.trim());

        if (user == null) {

            return ResponseEntity.status(404)
                    .body(Map.of(
                            "success", false,
                            "message", "Email not registered"
                    ));
        }

        // Generate OTP
        String otp =
            String.valueOf(new Random().nextInt(8999) + 1000);

        user.setOtp(otp);

        repo.save(user);

        emailService.sendEmail(
                user.getEmail(),
                "Password Reset OTP",
                "Your OTP is: " + otp
        );

        return ResponseEntity.ok(
                Map.of(
                        "success", true,
                        "message", "OTP sent successfully"
                )
        );
    }
    
    //2.Reset Password
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(
            @RequestBody Map<String, String> data) {

        String email = data.get("email");
        String otp = data.get("otp");
        String newPassword = data.get("newPassword");

        User user = repo.findByEmail(email);

        if (user == null) {

            return ResponseEntity.status(404)
                    .body(Map.of(
                            "success", false,
                            "message", "User not found"
                    ));
        }

        // Validate OTP
        if (user.getOtp() == null ||
            !user.getOtp().equals(otp)) {

            return ResponseEntity.status(400)
                    .body(Map.of(
                            "success", false,
                            "message", "Invalid OTP"
                    ));
        }

        // Encode password
        user.setPassword(
                encoder.encode(newPassword)
        );

        // Clear OTP
        user.setOtp(null);

        repo.save(user);

        return ResponseEntity.ok(
                Map.of(
                        "success", true,
                        "message", "Password reset successful"
                )
        );
    }    
}