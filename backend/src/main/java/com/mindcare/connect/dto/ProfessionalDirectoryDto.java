package com.mindcare.connect.dto;

import com.mindcare.connect.entity.ProfessionalType;
import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.LocalDateTime;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class ProfessionalDirectoryDto {
    
    private Long id;
    private String name;
    private String email;
    private String phone;
    private ProfessionalType professionalType;
    private String specialization;
    private Integer experienceYears;
    private String location;
    private List<String> languages;
    private String profileImageUrl;
    private boolean verified;
    private LocalDateTime verifiedAt;
    private String contactEmail;
    private String contactPhone;
    
    // Constructors
    public ProfessionalDirectoryDto() {}
    
    public ProfessionalDirectoryDto(Long id, String name, String email, String phone, 
                                   ProfessionalType professionalType, String specialization, 
                                   Integer experienceYears, String location, List<String> languages,
                                   String contactEmail, String contactPhone, LocalDateTime verifiedAt) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.professionalType = professionalType;
        this.specialization = specialization;
        this.experienceYears = experienceYears;
        this.location = location;
        this.languages = languages;
        this.contactEmail = contactEmail;
        this.contactPhone = contactPhone;
        this.verified = true; // Always true in directory context
        this.verifiedAt = verifiedAt;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    
    public ProfessionalType getProfessionalType() { return professionalType; }
    public void setProfessionalType(ProfessionalType professionalType) { this.professionalType = professionalType; }
    
    public String getSpecialization() { return specialization; }
    public void setSpecialization(String specialization) { this.specialization = specialization; }
    
    public Integer getExperienceYears() { return experienceYears; }
    public void setExperienceYears(Integer experienceYears) { this.experienceYears = experienceYears; }
    
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    
    public List<String> getLanguages() { return languages; }
    public void setLanguages(List<String> languages) { this.languages = languages; }
    
    public String getProfileImageUrl() { return profileImageUrl; }
    public void setProfileImageUrl(String profileImageUrl) { this.profileImageUrl = profileImageUrl; }
    
    public boolean isVerified() { return verified; }
    public void setVerified(boolean verified) { this.verified = verified; }
    
    public LocalDateTime getVerifiedAt() { return verifiedAt; }
    public void setVerifiedAt(LocalDateTime verifiedAt) { this.verifiedAt = verifiedAt; }
    
    public String getContactEmail() { return contactEmail; }
    public void setContactEmail(String contactEmail) { this.contactEmail = contactEmail; }
    
    public String getContactPhone() { return contactPhone; }
    public void setContactPhone(String contactPhone) { this.contactPhone = contactPhone; }
}
