package com.mindcare.connect.entity;

public enum Role {
    ADMIN("Administrator - Full system access"),
    PROFESSIONAL("Mental Health Professional - Can manage appointments and patients"),
    PATIENT("Patient/User - Can book appointments and access wellness resources"),
    MODERATOR("Community Moderator - Can moderate peer support community");
    
    private final String description;
    
    Role(String description) {
        this.description = description;
    }
    
    public String getDescription() {
        return description;
    }
}
