package com.mindcare.connect.dto;

import com.mindcare.connect.entity.Role;
import com.mindcare.connect.entity.UserStatus;

import java.time.LocalDateTime;
import java.util.Set;

public class AuthResponse {
    
    private String token;
    private String tokenType = "Bearer";
    private Long expiresIn;
    private UserInfo user;
    private String message;
    private boolean success;
    
    // Default constructor
    public AuthResponse() {}
    
    // Success constructor
    public AuthResponse(String token, Long expiresIn, UserInfo user) {
        this.token = token;
        this.expiresIn = expiresIn;
        this.user = user;
        this.success = true;
        this.message = "Authentication successful";
    }
    
    // Error constructor
    public AuthResponse(String message, boolean success) {
        this.message = message;
        this.success = success;
    }
    
    // Getters and Setters
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    
    public String getTokenType() { return tokenType; }
    public void setTokenType(String tokenType) { this.tokenType = tokenType; }
    
    public Long getExpiresIn() { return expiresIn; }
    public void setExpiresIn(Long expiresIn) { this.expiresIn = expiresIn; }
    
    public UserInfo getUser() { return user; }
    public void setUser(UserInfo user) { this.user = user; }
    
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    
    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }
    
    // Static factory methods
    public static AuthResponse success(String token, Long expiresIn, UserInfo user) {
        return new AuthResponse(token, expiresIn, user);
    }
    
    public static AuthResponse error(String message) {
        return new AuthResponse(message, false);
    }
    
    // Inner class for user information
    public static class UserInfo {
        private Long id;
        private String firstName;
        private String lastName;
        private String email;
        private String phone;
        private Set<Role> roles;
        private UserStatus status;
        private Boolean emailVerified;
        private Boolean phoneVerified;
        private LocalDateTime lastLogin;
        private LocalDateTime createdAt;
        
        // Default constructor
        public UserInfo() {}
        
        // Constructor
        public UserInfo(Long id, String firstName, String lastName, String email, String phone,
                       Set<Role> roles, UserStatus status, Boolean emailVerified, Boolean phoneVerified,
                       LocalDateTime lastLogin, LocalDateTime createdAt) {
            this.id = id;
            this.firstName = firstName;
            this.lastName = lastName;
            this.email = email;
            this.phone = phone;
            this.roles = roles;
            this.status = status;
            this.emailVerified = emailVerified;
            this.phoneVerified = phoneVerified;
            this.lastLogin = lastLogin;
            this.createdAt = createdAt;
        }
        
        // Getters and Setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        
        public String getFirstName() { return firstName; }
        public void setFirstName(String firstName) { this.firstName = firstName; }
        
        public String getLastName() { return lastName; }
        public void setLastName(String lastName) { this.lastName = lastName; }
        
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        
        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
        
        public Set<Role> getRoles() { return roles; }
        public void setRoles(Set<Role> roles) { this.roles = roles; }
        
        public UserStatus getStatus() { return status; }
        public void setStatus(UserStatus status) { this.status = status; }
        
        public Boolean getEmailVerified() { return emailVerified; }
        public void setEmailVerified(Boolean emailVerified) { this.emailVerified = emailVerified; }
        
        public Boolean getPhoneVerified() { return phoneVerified; }
        public void setPhoneVerified(Boolean phoneVerified) { this.phoneVerified = phoneVerified; }
        
        public LocalDateTime getLastLogin() { return lastLogin; }
        public void setLastLogin(LocalDateTime lastLogin) { this.lastLogin = lastLogin; }
        
        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
        
        public String getFullName() {
            return firstName + " " + lastName;
        }
    }
}
