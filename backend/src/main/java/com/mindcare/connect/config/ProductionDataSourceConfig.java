package com.mindcare.connect.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Profile;

import javax.sql.DataSource;
import java.net.URI;

@Configuration
@Profile("production")
public class ProductionDataSourceConfig {

    @Value("${DATABASE_URL}")
    private String databaseUrl;

    @Bean
    @Primary
    public DataSource dataSource() {
        if (databaseUrl == null || databaseUrl.trim().isEmpty()) {
            throw new RuntimeException("DATABASE_URL environment variable is not set");
        }
        
        try {
            // Parse the Render DATABASE_URL format
            URI dbUri = new URI(databaseUrl);
            
            String jdbcUrl = "jdbc:postgresql://" + dbUri.getHost() + ":" + dbUri.getPort() + dbUri.getPath();
            String username = dbUri.getUserInfo().split(":")[0];
            String password = dbUri.getUserInfo().split(":")[1];
            
            System.out.println("✅ Connecting to database: " + jdbcUrl);
            System.out.println("✅ Username: " + username);
            
            return DataSourceBuilder.create()
                    .url(jdbcUrl)
                    .username(username)
                    .password(password)
                    .driverClassName("org.postgresql.Driver")
                    .build();
                    
        } catch (Exception e) {
            System.err.println("❌ Error configuring database: " + e.getMessage());
            System.err.println("❌ DATABASE_URL: " + databaseUrl);
            e.printStackTrace();
            throw new RuntimeException("Failed to configure database", e);
        }
    }
}
