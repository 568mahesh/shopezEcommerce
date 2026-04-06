package com.shopez.Ecommerce.controller;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.shopez.Ecommerce.entity.Cart;
import com.shopez.Ecommerce.entity.OrderHistory;
import com.shopez.Ecommerce.entity.Product;
import com.shopez.Ecommerce.entity.User;
import com.shopez.Ecommerce.repo.CartRepo;
import com.shopez.Ecommerce.repo.OrderHistoryRepo;
import com.shopez.Ecommerce.repo.ProductRepo;
import com.shopez.Ecommerce.repo.UserRepo;
import com.shopez.Ecommerce.service.CartService;
import com.shopez.Ecommerce.service.ProductService;

@RestController
@RequestMapping("/user")
@CrossOrigin(origins = "http://localhost:4200")
public class UserController {

    @Autowired
    ProductRepo productRepo;

    @Autowired
    CartRepo cartRepo;

    @Autowired
    UserRepo userRepo;

    @Autowired
    OrderHistoryRepo orderHistoryRepo;

    @Autowired
    ProductService productService;

    @Autowired
    CartService cartService;
    
    @Autowired
    private com.shopez.Ecommerce.service.EmailService emailService;

    @GetMapping("/products")
    public List<Product> products() {
        return productService.getAllProducts();
    }

    @GetMapping("/products/category/{category}")
    public List<Product> getByCategory(@PathVariable String category) {
        return productRepo.findByCategory(category);
    }

    @PostMapping("/cart")
    public Cart addCart(@RequestBody Cart cart) {
        Product product = productRepo.findById(cart.getProduct().getId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (product.getQuantity() <= 0) {
            throw new RuntimeException("Product out of stock");
        }

        if (cart.getQuantity() <= 0) {
            cart.setQuantity(1);
        }

        if (cart.getQuantity() > product.getQuantity()) {
            throw new RuntimeException("Requested quantity exceeds available stock");
        }

        cart.setProduct(product);
        return cartService.addToCart(cart);
    }

    @GetMapping("/cart/{id}")
    public Page<Cart> view(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        return cartRepo.findByUserId(id, pageable);
    }

    @DeleteMapping("/cart/{id}")
    public Map<String, String> removeCart(@PathVariable Long id) {
        Cart cartItem = cartRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));

        cartRepo.delete(cartItem);

        Map<String, String> res = new HashMap<>();
        res.put("message", "Removed");
        return res;
    }

   
    @PostMapping("/order/{userId}")
    public Map<String, String> order(@PathVariable Long userId) {

        List<Cart> cartItems = cartRepo.findByUserId(userId);
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (cartItems.isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }

        StringBuilder orderDetails = new StringBuilder();

        for (Cart cart : cartItems) {
            Product product = cart.getProduct();

            if (product != null) {
                int currentQty = product.getQuantity();
                int orderedQty = cart.getQuantity();

                if (orderedQty > currentQty) {
                    throw new RuntimeException("Insufficient stock for product: " + product.getName());
                }

                product.setQuantity(currentQty - orderedQty);
                productRepo.save(product);

                OrderHistory order = new OrderHistory();
                order.setUserId(userId);
                order.setUsername(user.getUsername());
                order.setProductName(product.getName());
                order.setPrice(product.getPrice());
                order.setQuantity(orderedQty);
                order.setImage(product.getImage());
                order.setStatus("PENDING");
                order.setOrderedAt(LocalDateTime.now());

                orderHistoryRepo.save(order);

                // ✅ collect details for email
                orderDetails.append("Product: ").append(product.getName())
                        .append(" | Qty: ").append(orderedQty)
                        .append(" | Price: ").append(product.getPrice())
                        .append("\n");
            }
        }

        cartRepo.deleteAll(cartItems);

        // ✅ SEND EMAIL HERE
        try {
            String emailBody = "Hello " + user.getUsername() + ",\n\n"
                    + "Your order has been placed successfully.\n\n"
                    + "Order Details:\n"
                    + orderDetails.toString()
                    + "\nStatus: PENDING\n\n"
                    + "Thank you for shopping with Shopez!";

            emailService.sendEmail(
                    user.getEmail(),
                    "Order Confirmation - Shopez",
                    emailBody
            );

        } catch (Exception e) {
            System.out.println("Email sending failed");
        }

        Map<String, String> res = new HashMap<>();
        res.put("message", "Order placed successfully");
        return res;
    }

    @GetMapping("/orders/{userId}")
    public List<OrderHistory> getUserOrders(@PathVariable Long userId) {
        return orderHistoryRepo.findByUserIdOrderByOrderedAtDesc(userId);
    }
  
    @DeleteMapping("/orders/delete/{id}")
    public ResponseEntity<?> deleteOrder(@PathVariable Long id) {

        if (!orderHistoryRepo.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        orderHistoryRepo.deleteById(id);

        return ResponseEntity.ok("Order deleted");
    }
    @GetMapping("/cart/total/{userId}")
    public double getTotal(@PathVariable Long userId) {
        List<Cart> cartItems = cartRepo.findByUserId(userId);

        return cartItems.stream()
                .mapToDouble(c -> c.getProduct().getPrice() * c.getQuantity())
                .sum();
    }
}
