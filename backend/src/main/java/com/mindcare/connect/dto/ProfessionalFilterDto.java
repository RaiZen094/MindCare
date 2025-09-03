package com.mindcare.connect.dto;

import com.mindcare.connect.entity.ProfessionalType;

public class ProfessionalFilterDto {
    
    private String search;
    private ProfessionalType professionalType;
    private String specialization;
    private String location;
    private String language;
    private Integer minExperience;
    private Integer maxExperience;
    private Double maxConsultationFee;
    private Boolean availableForBooking;
    
    // Constructors
    public ProfessionalFilterDto() {}
    
    public ProfessionalFilterDto(String search, ProfessionalType professionalType, String specialization, 
                                String location, String language) {
        this.search = search;
        this.professionalType = professionalType;
        this.specialization = specialization;
        this.location = location;
        this.language = language;
    }
    
    // Getters and Setters
    public String getSearch() { return search; }
    public void setSearch(String search) { this.search = search; }
    
    public ProfessionalType getProfessionalType() { return professionalType; }
    public void setProfessionalType(ProfessionalType professionalType) { this.professionalType = professionalType; }
    
    public String getSpecialization() { return specialization; }
    public void setSpecialization(String specialization) { this.specialization = specialization; }
    
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    
    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }
    
    public Integer getMinExperience() { return minExperience; }
    public void setMinExperience(Integer minExperience) { this.minExperience = minExperience; }
    
    public Integer getMaxExperience() { return maxExperience; }
    public void setMaxExperience(Integer maxExperience) { this.maxExperience = maxExperience; }
    
    public Double getMaxConsultationFee() { return maxConsultationFee; }
    public void setMaxConsultationFee(Double maxConsultationFee) { this.maxConsultationFee = maxConsultationFee; }
    
    public Boolean getAvailableForBooking() { return availableForBooking; }
    public void setAvailableForBooking(Boolean availableForBooking) { this.availableForBooking = availableForBooking; }
    
    // Utility methods
    public boolean hasSearch() { return search != null && !search.trim().isEmpty(); }
    public boolean hasSpecialization() { return specialization != null && !specialization.trim().isEmpty(); }
    public boolean hasLocation() { return location != null && !location.trim().isEmpty(); }
    public boolean hasLanguage() { return language != null && !language.trim().isEmpty(); }
    public boolean hasExperienceRange() { return minExperience != null || maxExperience != null; }
}
