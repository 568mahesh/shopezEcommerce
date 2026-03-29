package com.shopez.Ecommerce.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.shopez.Ecommerce.entity.Cart;
import com.shopez.Ecommerce.entity.Product;
import com.shopez.Ecommerce.repo.CartRepo;
import com.shopez.Ecommerce.repo.ProductRepo;
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
    ProductService productService;

    @Autowired
    CartService cartService;

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
    public List<Cart> view(@PathVariable Long id) {
        return cartRepo.findByUserId(id);
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
            }
        }

        cartRepo.deleteAll(cartItems);

        Map<String, String> res = new HashMap<>();
        res.put("message", "Order placed successfully");
        return res;
    }
}