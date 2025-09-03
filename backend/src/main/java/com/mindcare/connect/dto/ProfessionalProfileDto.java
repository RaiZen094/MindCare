package com.mindcare.connect.dto;

import com.mindcare.connect.entity.ProfessionalType;
import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.LocalDateTime;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class ProfessionalProfileDto extends ProfessionalDirectoryDto {
    
    private String bio;
    private String education;
    private String degreeInstitution;
    private String degreeTitle;
    private String affiliation;
    private List<String> certifications;
    private String workingHours;
    private Double consultationFee;
    private String bmdcNumber; // For psychiatrists
    private String clinicAddress;
    private boolean availableForBooking;
    
    // Constructors
    public ProfessionalProfileDto() {
        super();
    }
    
    public ProfessionalProfileDto(Long id, String name, String email, String phone, 
                                 ProfessionalType professionalType, String specialization, 
                                 Integer experienceYears, String location, List<String> languages,
                                 String contactEmail, String contactPhone, LocalDateTime verifiedAt,
                                 String degreeInstitution, String degreeTitle, String affiliation,
                                 String bmdcNumber, String clinicAddress) {
        super(id, name, email, phone, professionalType, specialization, experienceYears, 
              location, languages, contactEmail, contactPhone, verifiedAt);
        this.degreeInstitution = degreeInstitution;
        this.degreeTitle = degreeTitle;
        this.affiliation = affiliation;
        this.bmdcNumber = bmdcNumber;
        this.clinicAddress = clinicAddress;
        this.availableForBooking = true; // Default to available
    }
    
    // Getters and Setters
    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }
    
    public String getEducation() { return education; }
    public void setEducation(String education) { this.education = education; }
    
    public String getDegreeInstitution() { return degreeInstitution; }
    public void setDegreeInstitution(String degreeInstitution) { this.degreeInstitution = degreeInstitution; }
    
    public String getDegreeTitle() { return degreeTitle; }
    public void setDegreeTitle(String degreeTitle) { this.degreeTitle = degreeTitle; }
    
    public String getAffiliation() { return affiliation; }
    public void setAffiliation(String affiliation) { this.affiliation = affiliation; }
    
    public List<String> getCertifications() { return certifications; }
    public void setCertifications(List<String> certifications) { this.certifications = certifications; }
    
    public String getWorkingHours() { return workingHours; }
    public void setWorkingHours(String workingHours) { this.workingHours = workingHours; }
    
    public Double getConsultationFee() { return consultationFee; }
    public void setConsultationFee(Double consultationFee) { this.consultationFee = consultationFee; }
    
    public String getBmdcNumber() { return bmdcNumber; }
    public void setBmdcNumber(String bmdcNumber) { this.bmdcNumber = bmdcNumber; }
    
    public String getClinicAddress() { return clinicAddress; }
    public void setClinicAddress(String clinicAddress) { this.clinicAddress = clinicAddress; }
    
    public boolean isAvailableForBooking() { return availableForBooking; }
    public void setAvailableForBooking(boolean availableForBooking) { this.availableForBooking = availableForBooking; }
}
