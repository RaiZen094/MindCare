package com.mindcare.connect;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.transaction.annotation.EnableTransactionManagement;

@SpringBootApplication
@EnableJpaAuditing
@EnableJpaRepositories
@EnableTransactionManagement
public class MindCareConnectApplication {
    
    public static void main(String[] args) {
        // Set system properties for better Docker compatibility
        System.setProperty("spring.jpa.open-in-view", "false");
        System.setProperty("server.address", "0.0.0.0");
        
        SpringApplication.run(MindCareConnectApplication.class, args);
    }
}
