package com.mindcare.connect.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class RegisterRequest {
    
    @NotBlank(message = "First name is required")
    @Size(min = 2, max = 50, message = "First name must be between 2 and 50 characters")
    private String firstName;
    
    @NotBlank(message = "Last name is required")
    @Size(min = 2, max = 50, message = "Last name must be between 2 and 50 characters")
    private String lastName;
    
    @NotBlank(message = "Email is required")
    @Email(message = "Please provide a valid email address")
    private String email;
    
    @Pattern(regexp = "^\\+8801[3-9]\\d{8}$", message = "Please provide a valid Bangladeshi phone number (+8801XXXXXXXXX)")
    private String phone;
    
    @NotBlank(message = "Password is required")
    @Size(min = 8, max = 128, message = "Password must be between 8 and 128 characters")
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$", 
             message = "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character")
    private String password;
    
    @NotBlank(message = "Password confirmation is required")
    private String confirmPassword;
    
    private Boolean agreeToTerms = false;
    
    private Boolean subscribeToNewsletter = false;
    
    // Default constructor
    public RegisterRequest() {}
    
    // Constructor
    public RegisterRequest(String firstName, String lastName, String email, String phone, 
                          String password, String confirmPassword, Boolean agreeToTerms) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.phone = phone;
        this.password = password;
        this.confirmPassword = confirmPassword;
        this.agreeToTerms = agreeToTerms;
    }
    
    // Getters and Setters
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    
    public String getConfirmPassword() { return confirmPassword; }
    public void setConfirmPassword(String confirmPassword) { this.confirmPassword = confirmPassword; }
    
    public Boolean getAgreeToTerms() { return agreeToTerms; }
    public void setAgreeToTerms(Boolean agreeToTerms) { this.agreeToTerms = agreeToTerms; }
    
    public Boolean getSubscribeToNewsletter() { return subscribeToNewsletter; }
    public void setSubscribeToNewsletter(Boolean subscribeToNewsletter) { this.subscribeToNewsletter = subscribeToNewsletter; }
    
    // Validation methods
    public boolean isPasswordsMatch() {
        return password != null && password.equals(confirmPassword);
    }
    
    public boolean isTermsAgreed() {
        return Boolean.TRUE.equals(agreeToTerms);
    }
}
