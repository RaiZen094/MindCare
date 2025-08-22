package com.mindcare.connect.entity;

public enum ProfessionalType {
    PSYCHIATRIST("Psychiatrist - BMDC registered medical doctor specializing in mental health"),
    PSYCHOLOGIST("Psychologist - Licensed mental health professional with psychology degree");

    private final String description;

    ProfessionalType(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }

    public String getDisplayName() {
        switch (this) {
            case PSYCHIATRIST:
                return "Psychiatrist";
            case PSYCHOLOGIST:
                return "Psychologist";
            default:
                return name();
        }
    }
}
