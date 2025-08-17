package com.mindcare.connect.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.transaction.annotation.EnableTransactionManagement;

@Configuration
@EnableJpaRepositories(basePackages = "com.mindcare.connect.repository")
@EnableTransactionManagement
public class DatabaseConfiguration {
    // This configuration ensures proper JPA initialization
}
