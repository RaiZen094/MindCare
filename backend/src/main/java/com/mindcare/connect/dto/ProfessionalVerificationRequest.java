package com.mindcare.connect.dto;

import com.mindcare.connect.entity.ProfessionalType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class ProfessionalVerificationRequest {

    @NotNull(message = "Professional type is required")
    private ProfessionalType professionalType;

    // For Psychiatrists - validation will be handled in the isValid() method
    // Updated to allow hyphens and proper BMDC format like BMDC-12345
    private String bmdcNumber;

    // For Psychologists
    private String degreeInstitution;
    private String degreeTitle;
    private String affiliation;

    @Min(value = 0, message = "Experience years cannot be negative")
    private Integer experienceYears;

    private String specialization;
    
    // New fields as per workflow
    private String languagesSpoken; // JSON array as string
    private String clinicAddress;
    private String contactEmail;
    private String contactPhone;

    @NotBlank(message = "License document is required")
    private String licenseDocumentUrl;

    private String degreeDocumentUrl;
    private String additionalDocumentsUrls; // JSON array as string

    // Constructors
    public ProfessionalVerificationRequest() {}

    public ProfessionalVerificationRequest(ProfessionalType professionalType, String licenseDocumentUrl) {
        this.professionalType = professionalType;
        this.licenseDocumentUrl = licenseDocumentUrl;
    }

    // Getters and Setters
    public ProfessionalType getProfessionalType() { return professionalType; }
    public void setProfessionalType(ProfessionalType professionalType) { this.professionalType = professionalType; }

    public String getBmdcNumber() { return bmdcNumber; }
    public void setBmdcNumber(String bmdcNumber) { this.bmdcNumber = bmdcNumber; }

    public String getDegreeInstitution() { return degreeInstitution; }
    public void setDegreeInstitution(String degreeInstitution) { this.degreeInstitution = degreeInstitution; }

    public String getDegreeTitle() { return degreeTitle; }
    public void setDegreeTitle(String degreeTitle) { this.degreeTitle = degreeTitle; }

    public String getAffiliation() { return affiliation; }
    public void setAffiliation(String affiliation) { this.affiliation = affiliation; }

    public Integer getExperienceYears() { return experienceYears; }
    public void setExperienceYears(Integer experienceYears) { this.experienceYears = experienceYears; }

    public String getSpecialization() { return specialization; }
    public void setSpecialization(String specialization) { this.specialization = specialization; }

    public String getLanguagesSpoken() { return languagesSpoken; }
    public void setLanguagesSpoken(String languagesSpoken) { this.languagesSpoken = languagesSpoken; }

    public String getClinicAddress() { return clinicAddress; }
    public void setClinicAddress(String clinicAddress) { this.clinicAddress = clinicAddress; }

    public String getContactEmail() { return contactEmail; }
    public void setContactEmail(String contactEmail) { this.contactEmail = contactEmail; }

    public String getContactPhone() { return contactPhone; }
    public void setContactPhone(String contactPhone) { this.contactPhone = contactPhone; }

    public String getLicenseDocumentUrl() { return licenseDocumentUrl; }
    public void setLicenseDocumentUrl(String licenseDocumentUrl) { this.licenseDocumentUrl = licenseDocumentUrl; }

    public String getDegreeDocumentUrl() { return degreeDocumentUrl; }
    public void setDegreeDocumentUrl(String degreeDocumentUrl) { this.degreeDocumentUrl = degreeDocumentUrl; }

    public String getAdditionalDocumentsUrls() { return additionalDocumentsUrls; }
    public void setAdditionalDocumentsUrls(String additionalDocumentsUrls) { this.additionalDocumentsUrls = additionalDocumentsUrls; }

    // Validation methods
    public boolean isValidForPsychiatrist() {
        if (professionalType != ProfessionalType.PSYCHIATRIST) {
            return false;
        }
        
        // BMDC number is required for psychiatrists and must match pattern
        if (bmdcNumber == null || bmdcNumber.trim().isEmpty()) {
            return false;
        }
        
        // Updated BMDC format validation to allow hyphens (e.g., BMDC-12345)
        return bmdcNumber.matches("^[A-Za-z0-9-]{6,20}$");
    }

    public boolean isValidForPsychologist() {
        if (professionalType != ProfessionalType.PSYCHOLOGIST) {
            return false;
        }
        
        // For psychologists, degree institution and title are required
        return degreeInstitution != null && !degreeInstitution.trim().isEmpty() &&
               degreeTitle != null && !degreeTitle.trim().isEmpty();
    }

    public boolean isValid() {
        if (professionalType == null || licenseDocumentUrl == null || licenseDocumentUrl.trim().isEmpty()) {
            return false;
        }
        
        switch (professionalType) {
            case PSYCHIATRIST:
                return isValidForPsychiatrist();
            case PSYCHOLOGIST:
                return isValidForPsychologist();
            default:
                return false;
        }
    }
    
    /**
     * Validates the request and returns error message if validation fails
     * @return null if valid, error message if invalid
     */
    public String getValidationError() {
        if (professionalType == null) {
            return "Professional type is required";
        }
        
        if (licenseDocumentUrl == null || licenseDocumentUrl.trim().isEmpty()) {
            return "License document is required";
        }
        
        switch (professionalType) {
            case PSYCHIATRIST:
                if (bmdcNumber == null || bmdcNumber.trim().isEmpty()) {
                    return "BMDC registration number is required for psychiatrists";
                }
                if (!bmdcNumber.matches("^[A-Za-z0-9-]{6,20}$")) {
                    return "BMDC number must be 6-20 characters (letters, numbers, and hyphens allowed). Example: BMDC-12345";
                }
                break;
                
            case PSYCHOLOGIST:
                if (degreeInstitution == null || degreeInstitution.trim().isEmpty()) {
                    return "Degree institution is required for psychologists";
                }
                if (degreeTitle == null || degreeTitle.trim().isEmpty()) {
                    return "Degree title is required for psychologists";
                }
                break;
                
            default:
                return "Invalid professional type";
        }
        
        return null; // Valid
    }
}
