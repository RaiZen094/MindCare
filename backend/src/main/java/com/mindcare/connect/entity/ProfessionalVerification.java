package com.mindcare.connect.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "professional_verifications")
@EntityListeners(AuditingEntityListener.class)
public class ProfessionalVerification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "User is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @NotNull(message = "Professional type is required")
    @Enumerated(EnumType.STRING)
    @Column(name = "professional_type", nullable = false)
    private ProfessionalType professionalType;

    // For Psychiatrists
    @Column(name = "bmdc_number")
    private String bmdcNumber;

    // For Psychologists
    @Column(name = "degree_institution")
    private String degreeInstitution;

    @Column(name = "degree_title")
    private String degreeTitle;

    @Column(name = "affiliation")
    private String affiliation;

    @Column(name = "experience_years")
    private Integer experienceYears;

    @Column(name = "specialization")
    private String specialization;

    // New fields as per workflow
    @Column(name = "languages_spoken", columnDefinition = "TEXT")
    private String languagesSpoken; // JSON array of languages

    @Column(name = "clinic_address", columnDefinition = "TEXT")
    private String clinicAddress;

    @Column(name = "contact_email")
    private String contactEmail;

    @Column(name = "contact_phone")
    private String contactPhone;

    @NotBlank(message = "License document URL is required")
    @Column(name = "license_document_url", nullable = false)
    private String licenseDocumentUrl;

    @Column(name = "degree_document_url")
    private String degreeDocumentUrl;

    @Column(name = "additional_documents_urls", columnDefinition = "TEXT")
    private String additionalDocumentsUrls; // JSON array of URLs

    @NotNull(message = "Status is required")
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private VerificationStatus status = VerificationStatus.PENDING;

    @Column(name = "admin_notes", columnDefinition = "TEXT")
    private String adminNotes;

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    @Column(name = "verified_by_admin_id")
    private Long verifiedByAdminId;

    @Column(name = "verified_at")
    private LocalDateTime verifiedAt;

    @Column(name = "correlation_id", unique = true)
    private String correlationId;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Constructors
    public ProfessionalVerification() {}

    public ProfessionalVerification(User user, ProfessionalType professionalType, String licenseDocumentUrl) {
        this.user = user;
        this.professionalType = professionalType;
        this.licenseDocumentUrl = licenseDocumentUrl;
        this.correlationId = "PROF_" + System.currentTimeMillis() + "_" + user.getId();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

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

    public LocalDateTime getVerifiedAt() { return verifiedAt; }
    public void setVerifiedAt(LocalDateTime verifiedAt) { this.verifiedAt = verifiedAt; }

    public String getCorrelationId() { return correlationId; }
    public void setCorrelationId(String correlationId) { this.correlationId = correlationId; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    // Utility methods
    public boolean isPending() { return status == VerificationStatus.PENDING; }
    public boolean isApproved() { return status == VerificationStatus.APPROVED; }
    public boolean isRejected() { return status == VerificationStatus.REJECTED; }
    
    public boolean canBeModified() {
        return status == VerificationStatus.PENDING || status == VerificationStatus.UNDER_REVIEW;
    }

    public void approve(Long adminId, String notes) {
        this.status = VerificationStatus.APPROVED;
        this.verifiedByAdminId = adminId;
        this.verifiedAt = LocalDateTime.now();
        this.adminNotes = notes;
        this.rejectionReason = null;
    }

    public void reject(Long adminId, String reason, String notes) {
        this.status = VerificationStatus.REJECTED;
        this.verifiedByAdminId = adminId;
        this.verifiedAt = LocalDateTime.now();
        this.rejectionReason = reason;
        this.adminNotes = notes;
    }

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (updatedAt == null) {
            updatedAt = LocalDateTime.now();
        }
        if (correlationId == null && user != null) {
            correlationId = "PROF_" + System.currentTimeMillis() + "_" + user.getId();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
