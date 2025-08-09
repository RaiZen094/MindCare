package com.mindcare.connect;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class MindCareConnectApplication {
    
    public static void main(String[] args) {
        SpringApplication.run(MindCareConnectApplication.class, args);
    }
}
