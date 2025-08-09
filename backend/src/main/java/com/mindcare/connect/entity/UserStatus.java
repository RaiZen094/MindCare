package com.mindcare.connect.entity;

public enum UserStatus {
    ACTIVE("Active user account"),
    SUSPENDED("Temporarily suspended account"),
    BANNED("Permanently banned account"),
    PENDING_VERIFICATION("Account pending email/phone verification");
    
    private final String description;
    
    UserStatus(String description) {
        this.description = description;
    }
    
    public String getDescription() {
        return description;
    }
}
