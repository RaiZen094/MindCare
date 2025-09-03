package com.mindcare.connect.controller;

import com.mindcare.connect.dto.AuthResponse;
import com.mindcare.connect.dto.LoginRequest;
import com.mindcare.connect.dto.RegisterRequest;
import com.mindcare.connect.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = {"http://localhost:3000", "https://mind-care-zeta.vercel.app"})
public class AuthController {
    
    private final UserService userService;
    
    public AuthController(UserService userService) {
        this.userService = userService;
    }
    
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> registerUser(@Valid @RequestBody RegisterRequest registerRequest) {
        try {
            AuthResponse response = userService.registerUser(registerRequest);
            
            if (response.isSuccess()) {
                return ResponseEntity.status(HttpStatus.CREATED).body(response);
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
            
        } catch (Exception e) {
            AuthResponse errorResponse = AuthResponse.error("Registration failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            AuthResponse response = userService.authenticateUser(loginRequest);
            
            if (response.isSuccess()) {
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }
            
        } catch (Exception e) {
            AuthResponse errorResponse = AuthResponse.error("Authentication failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    @PostMapping("/logout")
    public ResponseEntity<String> logoutUser() {
        // With JWT, logout is handled on the client side by removing the token
        // For additional security, you could implement a token blacklist
        return ResponseEntity.ok("Logged out successfully");
    }
    
    @GetMapping("/validate")
    public ResponseEntity<String> validateToken() {
        // This endpoint requires authentication, so if it's reached, the token is valid
        return ResponseEntity.ok("Token is valid");
    }
    
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "UP");
        health.put("service", "MindCare Connect Authentication Service");
        health.put("timestamp", java.time.Instant.now().toString());
        health.put("version", "1.0.0");
        
        return ResponseEntity.ok(health);
    }
    
    @GetMapping("/wake-up")
    public ResponseEntity<Map<String, Object>> wakeUp() {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Service is awake and ready");
        response.put("timestamp", java.time.Instant.now().toString());
        response.put("coldStart", "completed");
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/admin-check")
    public ResponseEntity<Map<String, Object>> adminCheck() {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Admin endpoint is accessible");
        response.put("timestamp", java.time.Instant.now().toString());
        
        return ResponseEntity.ok(response);
    }
}
