package com.mindcare.connect.dto;

import com.mindcare.connect.entity.ProfessionalType;
import com.mindcare.connect.entity.VerificationStatus;

import java.time.LocalDateTime;

public class ProfessionalVerificationResponse {

    private Long id;
    private Long userId;
    private String userFullName;
    private String userEmail;
    private ProfessionalType professionalType;
    private String bmdcNumber;
    private String degreeInstitution;
    private String degreeTitle;
    private String affiliation;
    private Integer experienceYears;
    private String specialization;
    private String languagesSpoken;
    private String clinicAddress;
    private String contactEmail;
    private String contactPhone;
    private String licenseDocumentUrl;
    private String degreeDocumentUrl;
    private String additionalDocumentsUrls;
    private VerificationStatus status;
    private String adminNotes;
    private String rejectionReason;
    private Long verifiedByAdminId;
    private String verifiedByAdminName;
    private LocalDateTime verifiedAt;
    private String correlationId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // AI Confidence fields
    private Double aiConfidenceScore;
    private String aiRecommendation;
    private String aiMatchDetails;
    private LocalDateTime aiProcessedAt;

    // Constructors
    public ProfessionalVerificationResponse() {}

    // Static factory methods
    public static ProfessionalVerificationResponse success(String message, ProfessionalVerificationResponse data) {
        return data; // Simple approach for now
    }

    public static ProfessionalVerificationResponse error(String message) {
        return new ProfessionalVerificationResponse(); // Simple approach for now
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getUserFullName() { return userFullName; }
    public void setUserFullName(String userFullName) { this.userFullName = userFullName; }

    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }

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

    public VerificationStatus getStatus() { return status; }
    public void setStatus(VerificationStatus status) { this.status = status; }

    public String getAdminNotes() { return adminNotes; }
    public void setAdminNotes(String adminNotes) { this.adminNotes = adminNotes; }

    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }

    public Long getVerifiedByAdminId() { return verifiedByAdminId; }
    public void setVerifiedByAdminId(Long verifiedByAdminId) { this.verifiedByAdminId = verifiedByAdminId; }

    public String getVerifiedByAdminName() { return verifiedByAdminName; }
    public void setVerifiedByAdminName(String verifiedByAdminName) { this.verifiedByAdminName = verifiedByAdminName; }

    public LocalDateTime getVerifiedAt() { return verifiedAt; }
    public void setVerifiedAt(LocalDateTime verifiedAt) { this.verifiedAt = verifiedAt; }

    public String getCorrelationId() { return correlationId; }
    public void setCorrelationId(String correlationId) { this.correlationId = correlationId; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    // AI Confidence getters and setters
    public Double getAiConfidenceScore() { return aiConfidenceScore; }
    public void setAiConfidenceScore(Double aiConfidenceScore) { this.aiConfidenceScore = aiConfidenceScore; }

    public String getAiRecommendation() { return aiRecommendation; }
    public void setAiRecommendation(String aiRecommendation) { this.aiRecommendation = aiRecommendation; }

    public String getAiMatchDetails() { return aiMatchDetails; }
    public void setAiMatchDetails(String aiMatchDetails) { this.aiMatchDetails = aiMatchDetails; }

    public LocalDateTime getAiProcessedAt() { return aiProcessedAt; }
    public void setAiProcessedAt(LocalDateTime aiProcessedAt) { this.aiProcessedAt = aiProcessedAt; }

    // Utility methods
    public String getStatusDisplayName() {
        return status != null ? status.getDisplayName() : "Unknown";
    }

    public String getProfessionalTypeDisplayName() {
        return professionalType != null ? professionalType.getDisplayName() : "Unknown";
    }

    public boolean isPending() {
        return status == VerificationStatus.PENDING;
    }

    public boolean isApproved() {
        return status == VerificationStatus.APPROVED;
    }

    public boolean isRejected() {
        return status == VerificationStatus.REJECTED;
    }

    public Integer getAiConfidencePercentage() {
        return aiConfidenceScore != null ? (int) Math.round(aiConfidenceScore * 100) : null;
    }

    public boolean hasAiProcessing() {
        return aiProcessedAt != null;
    }
}
