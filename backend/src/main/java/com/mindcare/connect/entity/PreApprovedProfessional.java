package com.mindcare.connect.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "pre_approved_professionals")
public class PreApprovedProfessional {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String fullName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProfessionalType professionalType;

    @Column(nullable = false)
    private String specialization;

    private String licenseNumber;
    private String bmdcNumber;
    
    // Updated to match CSV structure
    private String degreeInstitution;
    private String degreeTitle;
    private String affiliation;
    private String experienceYears;
    private String languagesSpoken;
    private String clinicAddress;
    private String contactPhone;
    private String licenseDocumentUrl;
    private String degreeDocumentUrl;
    private String statusNote;
    
    @Column(name = "uploaded_at")
    private LocalDateTime uploadedAt;

    @Column(name = "uploaded_by")
    private String uploadedBy; // Admin who uploaded

    // Constructors
    public PreApprovedProfessional() {
        this.uploadedAt = LocalDateTime.now();
    }

    public PreApprovedProfessional(String email, String fullName, ProfessionalType professionalType, 
                                 String specialization, String licenseNumber, String bmdcNumber, 
                                 String degreeInstitution, String degreeTitle, String affiliation,
                                 String experienceYears, String languagesSpoken, String clinicAddress,
                                 String contactPhone, String licenseDocumentUrl, String degreeDocumentUrl,
                                 String statusNote, String uploadedBy) {
        this();
        this.email = email;
        this.fullName = fullName;
        this.professionalType = professionalType;
        this.specialization = specialization;
        this.licenseNumber = licenseNumber;
        this.bmdcNumber = bmdcNumber;
        this.degreeInstitution = degreeInstitution;
        this.degreeTitle = degreeTitle;
        this.affiliation = affiliation;
        this.experienceYears = experienceYears;
        this.languagesSpoken = languagesSpoken;
        this.clinicAddress = clinicAddress;
        this.contactPhone = contactPhone;
        this.licenseDocumentUrl = licenseDocumentUrl;
        this.degreeDocumentUrl = degreeDocumentUrl;
        this.statusNote = statusNote;
        this.uploadedBy = uploadedBy;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public ProfessionalType getProfessionalType() { return professionalType; }
    public void setProfessionalType(ProfessionalType professionalType) { this.professionalType = professionalType; }

    public String getSpecialization() { return specialization; }
    public void setSpecialization(String specialization) { this.specialization = specialization; }

    public String getLicenseNumber() { return licenseNumber; }
    public void setLicenseNumber(String licenseNumber) { this.licenseNumber = licenseNumber; }

    public String getBmdcNumber() { return bmdcNumber; }
    public void setBmdcNumber(String bmdcNumber) { this.bmdcNumber = bmdcNumber; }

    public String getDegreeInstitution() { return degreeInstitution; }
    public void setDegreeInstitution(String degreeInstitution) { this.degreeInstitution = degreeInstitution; }

    public String getDegreeTitle() { return degreeTitle; }
    public void setDegreeTitle(String degreeTitle) { this.degreeTitle = degreeTitle; }

    public String getAffiliation() { return affiliation; }
    public void setAffiliation(String affiliation) { this.affiliation = affiliation; }

    public String getExperienceYears() { return experienceYears; }
    public void setExperienceYears(String experienceYears) { this.experienceYears = experienceYears; }

    public String getLanguagesSpoken() { return languagesSpoken; }
    public void setLanguagesSpoken(String languagesSpoken) { this.languagesSpoken = languagesSpoken; }

    public String getClinicAddress() { return clinicAddress; }
    public void setClinicAddress(String clinicAddress) { this.clinicAddress = clinicAddress; }

    public String getContactPhone() { return contactPhone; }
    public void setContactPhone(String contactPhone) { this.contactPhone = contactPhone; }

    public String getLicenseDocumentUrl() { return licenseDocumentUrl; }
    public void setLicenseDocumentUrl(String licenseDocumentUrl) { this.licenseDocumentUrl = licenseDocumentUrl; }

    public String getDegreeDocumentUrl() { return degreeDocumentUrl; }
    public void setDegreeDocumentUrl(String degreeDocumentUrl) { this.degreeDocumentUrl = degreeDocumentUrl; }

    public String getStatusNote() { return statusNote; }
    public void setStatusNote(String statusNote) { this.statusNote = statusNote; }

    public LocalDateTime getUploadedAt() { return uploadedAt; }
    public void setUploadedAt(LocalDateTime uploadedAt) { this.uploadedAt = uploadedAt; }

    public String getUploadedBy() { return uploadedBy; }
    public void setUploadedBy(String uploadedBy) { this.uploadedBy = uploadedBy; }
}
