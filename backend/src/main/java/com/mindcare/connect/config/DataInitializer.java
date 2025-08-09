package com.mindcare.connect.config;

import com.mindcare.connect.service.UserService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {
    
    private final UserService userService;
    
    @Value("${admin.default.email}")
    private String adminEmail;
    
    @Value("${admin.default.password}")
    private String adminPassword;
    
    public DataInitializer(UserService userService) {
        this.userService = userService;
    }
    
    @Override
    public void run(String... args) throws Exception {
        // Create default admin user if it doesn't exist
        if (!userService.existsByEmail(adminEmail)) {
            userService.createAdminUser(adminEmail, adminPassword, "Admin", "User");
            System.out.println("Default admin user created:");
            System.out.println("Email: " + adminEmail);
            System.out.println("Password: " + adminPassword);
            System.out.println("Please change the default password after first login!");
        } else {
            System.out.println("Admin user already exists: " + adminEmail);
        }
        
        // Unlock any expired account locks
        userService.unlockExpiredAccounts();
    }
}
