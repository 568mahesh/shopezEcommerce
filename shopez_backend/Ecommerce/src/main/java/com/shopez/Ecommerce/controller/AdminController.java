package com.shopez.Ecommerce.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.shopez.Ecommerce.entity.OrderHistory;
import com.shopez.Ecommerce.entity.Product;
import com.shopez.Ecommerce.entity.User;
import com.shopez.Ecommerce.repo.OrderHistoryRepo;
import com.shopez.Ecommerce.repo.ProductRepo;
import com.shopez.Ecommerce.repo.UserRepo;

@RestController
@RequestMapping("/admin")
@CrossOrigin(origins = "http://localhost:4200")
public class AdminController {

    @Autowired
    private ProductRepo productRepo;

    @Autowired
    private UserRepo userRepo;
    
    @Autowired
    private com.shopez.Ecommerce.service.EmailService emailService;

   

    @Autowired
    private OrderHistoryRepo orderHistoryRepo;

    @Autowired
    private PasswordEncoder encoder;

    @PostMapping("/add")
    public Product addProduct(@RequestBody Product product) {
        return productRepo.save(product);
    }

    @PutMapping("/edit/{id}")
    public Product editProduct(@PathVariable Long id, @RequestBody Product updated) {
        Product product = productRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        product.setName(updated.getName());
        product.setCategory(updated.getCategory());
        product.setDescription(updated.getDescription());
        product.setPrice(updated.getPrice());
        product.setImage(updated.getImage());
        product.setQuantity(updated.getQuantity());

        return productRepo.save(product);
    }

    @DeleteMapping("/delete/{id}")
    public Map<String, String> deleteProduct(@PathVariable Long id) {
        productRepo.deleteById(id);

        Map<String, String> res = new HashMap<>();
        res.put("message", "Product deleted successfully");
        return res;
    }

    @GetMapping("/users")
    public Page<User> getUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size,
            @RequestParam(required = false) String role
    ) {
        Pageable pageable = PageRequest.of(page, size);

        if (role != null && !role.equalsIgnoreCase("all")) {
            return userRepo.findByRole(role.toUpperCase(), pageable);
        }
        return userRepo.findAll(pageable);
    }

    @PutMapping("/users/{id}")
    public User updateUser(@PathVariable Long id, @RequestBody User updatedUser) {
        User user = userRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setFullname(updatedUser.getFullname());
        user.setUsername(updatedUser.getUsername());
        user.setEmail(updatedUser.getEmail());
        user.setPhone(updatedUser.getPhone());
        user.setRole(updatedUser.getRole());

        if (updatedUser.getPassword() != null && !updatedUser.getPassword().isBlank()) {
            user.setPassword(encoder.encode(updatedUser.getPassword()));
        }

        return userRepo.save(user);
    }

    @DeleteMapping("/users/{id}")
    public Map<String, String> deleteUser(@PathVariable Long id) {
        userRepo.deleteById(id);

        Map<String, String> res = new HashMap<>();
        res.put("message", "User deleted successfully");
        return res;
    }

    @GetMapping("/orders")
    public List<OrderHistory> getOrders() {
        return orderHistoryRepo.findAll();
    }

//    @PutMapping("/orders/{id}/status")
//    public OrderHistory updateOrderStatus(@PathVariable Long id, @RequestParam String status) {
//        OrderHistory order = orderHistoryRepo.findById(id)
//                .orElseThrow(() -> new RuntimeException("Order not found"));
//
//        order.setStatus(status);
//        return orderHistoryRepo.save(order);
//    }
   
    @PutMapping("/orders/{id}")
    public Map<String, Object> updateOrderStatus(@PathVariable Long id, @RequestParam String status) {

        Map<String, Object> res = new HashMap<>();

        OrderHistory order = orderHistoryRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        // ✅ update status
        order.setStatus(status);
        orderHistoryRepo.save(order);

        // ✅ get user email
        User user = userRepo.findById(order.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // ✅ SEND EMAIL
        try {
            String emailBody = "Hello " + user.getUsername() + ",\n\n"
                    + "Your order status has been updated.\n\n"
                    + "Order Details:\n"
                    + "Product: " + order.getProductName() + "\n"
                    + "Quantity: " + order.getQuantity() + "\n"
                    + "Price: " + order.getPrice() + "\n\n"
                    + "New Status: " + status + "\n\n"
                    + "Thank you for shopping with Shopez!";

            emailService.sendEmail(
                    user.getEmail(),
                    "Order Status Update - Shopez",
                    emailBody
            );

        } catch (Exception e) {
            System.out.println("Email sending failed");
        }

        // ✅ RETURN JSON (VERY IMPORTANT)
        res.put("message", "Order status updated successfully");
        res.put("success", true);

        return res;
    }
}
