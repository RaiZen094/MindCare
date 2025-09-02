package com.mindcare.connect.service;

import com.mindcare.connect.dto.ProfessionalVerificationRequest;
import com.mindcare.connect.dto.ProfessionalVerificationResponse;
import com.mindcare.connect.entity.*;
import com.mindcare.connect.repository.ProfessionalVerificationRepository;
import com.mindcare.connect.repository.PreApprovedProfessionalRepository;
import com.mindcare.connect.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class ProfessionalVerificationService {
    private static final Logger log = LoggerFactory.getLogger(ProfessionalVerificationService.class);

    private final ProfessionalVerificationRepository verificationRepository;
    private final PreApprovedProfessionalRepository preApprovedRepository;
    private final UserRepository userRepository;
    private final AutoVerificationAgent autoVerificationAgent;

    @Autowired
    public ProfessionalVerificationService(
            ProfessionalVerificationRepository verificationRepository,
            PreApprovedProfessionalRepository preApprovedRepository,
            UserRepository userRepository,
            AutoVerificationAgent autoVerificationAgent) {
        this.verificationRepository = verificationRepository;
        this.preApprovedRepository = preApprovedRepository;
        this.userRepository = userRepository;
        this.autoVerificationAgent = autoVerificationAgent;
    }

    /**
     * Submit a professional verification application
     * Following Integrity Pact: Users start as PATIENT, then apply for PROFESSIONAL role
     */
    public ProfessionalVerificationResponse submitApplication(Long userId, ProfessionalVerificationRequest request) {
        try {
            // Find the user
            Optional<User> userOpt = userRepository.findById(userId);
            if (userOpt.isEmpty()) {
                throw new RuntimeException("User not found");
            }

            User user = userOpt.get();

            // Check if user already has a pending or approved application
            Optional<ProfessionalVerification> existingApplication = verificationRepository.findByUserId(userId);
            if (existingApplication.isPresent()) {
                ProfessionalVerification existing = existingApplication.get();
                if (existing.getStatus() == VerificationStatus.PENDING || 
                    existing.getStatus() == VerificationStatus.UNDER_REVIEW) {
                    throw new RuntimeException("You already have a pending verification application");
                }
                if (existing.getStatus() == VerificationStatus.APPROVED) {
                    throw new RuntimeException("You are already a verified professional");
                }
                // If status is REJECTED or REVOKED, allow reapplication by deleting the old one
                if (existing.getStatus() == VerificationStatus.REJECTED || 
                    existing.getStatus() == VerificationStatus.REVOKED) {
                    log.info("Deleting previous {} application for user {} to allow reapplication", 
                             existing.getStatus(), userId);
                    verificationRepository.delete(existing);
                }
            }

            // Validate request based on professional type
            if (!request.isValid()) {
                throw new RuntimeException("Invalid application data for " + request.getProfessionalType().getDisplayName());
            }

            // Check for duplicate BMDC number if psychiatrist
            if (request.getProfessionalType() == ProfessionalType.PSYCHIATRIST && 
                request.getBmdcNumber() != null) {
                List<ProfessionalVerification> duplicates = verificationRepository.findApprovedByBmdcNumber(request.getBmdcNumber());
                if (!duplicates.isEmpty()) {
                    throw new RuntimeException("BMDC number already registered by another professional");
                }
            }

            // Create new verification application
            ProfessionalVerification verification = new ProfessionalVerification(user, request.getProfessionalType(), request.getLicenseDocumentUrl());
            
            // Set fields based on professional type
            if (request.getProfessionalType() == ProfessionalType.PSYCHIATRIST) {
                verification.setBmdcNumber(request.getBmdcNumber());
            } else if (request.getProfessionalType() == ProfessionalType.PSYCHOLOGIST) {
                verification.setDegreeInstitution(request.getDegreeInstitution());
                verification.setDegreeTitle(request.getDegreeTitle());
                verification.setAffiliation(request.getAffiliation());
            }

            verification.setExperienceYears(request.getExperienceYears());
            verification.setSpecialization(request.getSpecialization());
            verification.setDegreeDocumentUrl(request.getDegreeDocumentUrl());
            verification.setAdditionalDocumentsUrls(request.getAdditionalDocumentsUrls());
            verification.setLanguagesSpoken(request.getLanguagesSpoken());
            verification.setClinicAddress(request.getClinicAddress());
            verification.setContactEmail(request.getContactEmail());
            verification.setContactPhone(request.getContactPhone());

            // Save the application first
            verification = verificationRepository.save(verification);
            log.info("Verification application saved with ID: {}", verification.getId());

            // Calculate AI confidence for admin assistance
            try {
                ConfidenceResult confidenceResult = autoVerificationAgent.calculateConfidence(verification);
                
                // Update verification with AI confidence data
                verification.updateAiConfidence(
                    confidenceResult.getConfidence(),
                    confidenceResult.getRecommendation(),
                    confidenceResult.getMatchDetails()
                );
                
                log.info("AI confidence calculated for application {}: {:.1f}% - {}", 
                        verification.getId(), 
                        confidenceResult.getConfidence() * 100,
                        confidenceResult.getRecommendation());
                
                // Save with confidence data
                verification = verificationRepository.save(verification);
                
            } catch (Exception e) {
                log.error("AI confidence calculation failed for application {}: {}", verification.getId(), e.getMessage());
                // Continue without confidence - application will be manually reviewed
                verification.updateAiConfidence(0.0, "⚫ AI PROCESSING FAILED - Manual review required", 
                    "Error during AI processing: " + e.getMessage());
                verification = verificationRepository.save(verification);
            }

            return mapToResponse(verification);

        } catch (Exception e) {
            throw new RuntimeException("Failed to submit verification application: " + e.getMessage());
        }
    }

    /**
     * Get application status for a user
     */
    public Optional<ProfessionalVerificationResponse> getApplicationStatus(Long userId) {
        Optional<ProfessionalVerification> verification = verificationRepository.findByUserId(userId);
        return verification.map(this::mapToResponse);
    }

    /**
     * Get all pending applications for admin review
     */
    public List<ProfessionalVerificationResponse> getPendingApplications() {
        List<ProfessionalVerification> pending = verificationRepository.findPendingApplications();
        return pending.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    /**
     * Get paginated pending applications for admin review
     */
    public Page<ProfessionalVerificationResponse> getPendingApplications(Pageable pageable) {
        Page<ProfessionalVerification> pending = verificationRepository.findPendingApplications(pageable);
        return pending.map(this::mapToResponse);
    }

    /**
     * Admin approves a verification application
     * Following Integrity Pact: Add PROFESSIONAL role to user (don't replace PATIENT)
     */
    public ProfessionalVerificationResponse approveApplication(Long verificationId, Long adminId, String notes) {
        try {
            Optional<ProfessionalVerification> verificationOpt = verificationRepository.findById(verificationId);
            if (verificationOpt.isEmpty()) {
                throw new RuntimeException("Verification application not found");
            }

            ProfessionalVerification verification = verificationOpt.get();
            
            if (!verification.canBeModified()) {
                throw new RuntimeException("Application cannot be modified in current status: " + verification.getStatus());
            }

            // Approve the verification
            verification.approve(adminId, notes);
            verification = verificationRepository.save(verification);

            // Add PROFESSIONAL role to user (keeping existing roles - Integrity Pact)
            User user = verification.getUser();
            user.getRoles().add(Role.PROFESSIONAL);
            userRepository.save(user);

            return mapToResponse(verification);

        } catch (Exception e) {
            throw new RuntimeException("Failed to approve verification: " + e.getMessage());
        }
    }

    /**
     * Admin rejects a verification application
     */
    public ProfessionalVerificationResponse rejectApplication(Long verificationId, Long adminId, String reason, String notes) {
        try {
            Optional<ProfessionalVerification> verificationOpt = verificationRepository.findById(verificationId);
            if (verificationOpt.isEmpty()) {
                throw new RuntimeException("Verification application not found");
            }

            ProfessionalVerification verification = verificationOpt.get();
            
            if (!verification.canBeModified()) {
                throw new RuntimeException("Application cannot be modified in current status: " + verification.getStatus());
            }

            // Reject the verification
            verification.reject(adminId, reason, notes);
            verification = verificationRepository.save(verification);

            return mapToResponse(verification);

        } catch (Exception e) {
            throw new RuntimeException("Failed to reject verification: " + e.getMessage());
        }
    }

    /**
     * Get all applications with optional status filter
     */
    public Page<ProfessionalVerificationResponse> getAllApplications(VerificationStatus status, Pageable pageable) {
        Page<ProfessionalVerification> applications;
        if (status != null) {
            applications = verificationRepository.findByStatus(status, pageable);
        } else {
            applications = verificationRepository.findAll(pageable);
        }
        return applications.map(this::mapToResponse);
    }

    /**
     * Get verification statistics for admin dashboard
     */
    public List<Object[]> getVerificationStatistics() {
        return verificationRepository.getVerificationStatistics();
    }

    /**
     * Get all verified professionals for directory
     */
    public Page<ProfessionalVerificationResponse> getAllProfessionals(String professionalType, String search, Pageable pageable) {
        Page<ProfessionalVerification> professionals;
        
        if (professionalType != null && search != null && !search.trim().isEmpty()) {
            // Filter by both type and search
            ProfessionalType type = ProfessionalType.valueOf(professionalType.toUpperCase());
            professionals = verificationRepository.findApprovedByTypeAndSearch(type, search.toLowerCase(), pageable);
        } else if (professionalType != null) {
            // Filter by type only
            ProfessionalType type = ProfessionalType.valueOf(professionalType.toUpperCase());
            professionals = verificationRepository.findApprovedByType(type, pageable);
        } else if (search != null && !search.trim().isEmpty()) {
            // Filter by search only
            professionals = verificationRepository.findApprovedBySearch(search.toLowerCase(), pageable);
        } else {
            // Get all approved professionals
            professionals = verificationRepository.findApprovedProfessionals(pageable);
        }
        
        return professionals.map(this::mapToResponse);
    }

    /**
     * Upload CSV of pre-approved professionals as reference list for admin verification
     */
    public String uploadPreVerifiedProfessionals(String csvContent) {
        try {
            log.info("Starting CSV upload processing for reference list");
            
            // Parse CSV content
            String[] lines = csvContent.split("\n");
            
            if (lines.length <= 1) {
                throw new RuntimeException("CSV file is empty or has no data rows");
            }
            
            // Parse header row to map column indices
            String[] headers = parseCSVLine(lines[0]);
            log.info("Headers found: {}", String.join(", ", headers));
            
            Map<String, Integer> columnMap = new HashMap<>();
            for (int i = 0; i < headers.length; i++) {
                columnMap.put(headers[i].trim().toLowerCase(), i);
            }
            
            // Validate required columns exist
            String[] requiredColumns = {"email", "full_name", "professional_type", "specialization"};
            for (String required : requiredColumns) {
                if (!columnMap.containsKey(required)) {
                    throw new RuntimeException("Missing required column: " + required);
                }
            }
            
            // Process data rows and create reference list entries
            int processedCount = 0;
            int skippedCount = 0;
            
            for (int i = 1; i < lines.length; i++) {
                try {
                    String line = lines[i].trim();
                    if (line.isEmpty()) continue;
                    
                    String[] fields = parseCSVLine(line);
                    
                    // Extract required fields
                    String email = getFieldValue(fields, columnMap, "email");
                    String fullName = getFieldValue(fields, columnMap, "full_name");
                    String typeStr = getFieldValue(fields, columnMap, "professional_type");
                    String specialization = getFieldValue(fields, columnMap, "specialization");
                    
                    // Validate required fields
                    if (email == null || email.trim().isEmpty() || 
                        fullName == null || fullName.trim().isEmpty() ||
                        typeStr == null || typeStr.trim().isEmpty() ||
                        specialization == null || specialization.trim().isEmpty()) {
                        log.warn("Skipping row {} - missing required fields", i + 1);
                        skippedCount++;
                        continue;
                    }
                    
                    // Parse professional type
                    ProfessionalType professionalType;
                    try {
                        professionalType = ProfessionalType.valueOf(typeStr.trim().toUpperCase());
                    } catch (IllegalArgumentException e) {
                        log.warn("Skipping row {} - invalid professional type: {}", i + 1, typeStr);
                        skippedCount++;
                        continue;
                    }
                    
                    // Extract optional fields
                    String licenseNumber = getFieldValue(fields, columnMap, "license_number");
                    String bmdcNumber = getFieldValue(fields, columnMap, "bmdc_number");
                    String degreeInstitution = getFieldValue(fields, columnMap, "degree_institution");
                    String degreeTitle = getFieldValue(fields, columnMap, "degree_title");
                    String affiliation = getFieldValue(fields, columnMap, "affiliation");
                    String experienceYears = getFieldValue(fields, columnMap, "experience_years");
                    String languagesSpoken = getFieldValue(fields, columnMap, "languages_spoken");
                    String clinicAddress = getFieldValue(fields, columnMap, "clinic_address");
                    String contactPhone = getFieldValue(fields, columnMap, "contact_phone");
                    String licenseDocumentUrl = getFieldValue(fields, columnMap, "license_document_url");
                    String degreeDocumentUrl = getFieldValue(fields, columnMap, "degree_document_url");
                    String statusNote = getFieldValue(fields, columnMap, "status_note");
                    
                    // Check if this professional already exists in reference list
                    Optional<PreApprovedProfessional> existing = preApprovedRepository
                        .findByEmailIgnoreCaseAndProfessionalTypeAndSpecializationIgnoreCase(
                            email.trim(), professionalType, specialization.trim());
                    
                    if (existing.isPresent()) {
                        log.info("Professional already in reference list: {}", email);
                        skippedCount++;
                        continue;
                    }
                    
                    // Create reference list entry
                    PreApprovedProfessional preApproved = new PreApprovedProfessional(
                        email.trim(),
                        fullName.trim(),
                        professionalType,
                        specialization.trim(),
                        licenseNumber != null ? licenseNumber.trim() : null,
                        bmdcNumber != null ? bmdcNumber.trim() : null,
                        degreeInstitution != null ? degreeInstitution.trim() : null,
                        degreeTitle != null ? degreeTitle.trim() : null,
                        affiliation != null ? affiliation.trim() : null,
                        experienceYears != null ? experienceYears.trim() : null,
                        languagesSpoken != null ? languagesSpoken.trim() : null,
                        clinicAddress != null ? clinicAddress.trim() : null,
                        contactPhone != null ? contactPhone.trim() : null,
                        licenseDocumentUrl != null ? licenseDocumentUrl.trim() : null,
                        degreeDocumentUrl != null ? degreeDocumentUrl.trim() : null,
                        statusNote != null ? statusNote.trim() : null,
                        "admin" // TODO: Get actual admin username from security context
                    );
                    
                    preApprovedRepository.save(preApproved);
                    processedCount++;
                    
                    log.info("Added to reference list: {} - {} ({})", 
                            email, fullName, professionalType);
                    
                } catch (Exception e) {
                    log.error("Error processing row {}: {}", i + 1, e.getMessage());
                    skippedCount++;
                }
            }
            
            String result = String.format("Successfully added %d professionals to reference list. %d rows skipped.", 
                                        processedCount, skippedCount);
            log.info(result);
            return result;
            
        } catch (Exception e) {
            log.error("Error processing CSV file: {}", e.getMessage());
            throw new RuntimeException("Error processing CSV file: " + e.getMessage());
        }
    }
    
    private String[] parseCSVLine(String line) {
        // Simple CSV parser - handles quoted fields
        java.util.List<String> fields = new java.util.ArrayList<>();
        StringBuilder current = new StringBuilder();
        boolean inQuotes = false;
        
        for (int i = 0; i < line.length(); i++) {
            char c = line.charAt(i);
            if (c == '"') {
                inQuotes = !inQuotes;
            } else if (c == ',' && !inQuotes) {
                fields.add(current.toString().trim());
                current = new StringBuilder();
            } else {
                current.append(c);
            }
        }
        fields.add(current.toString().trim());
        
        return fields.toArray(new String[0]);
    }
    
    private String getFieldValue(String[] fields, Map<String, Integer> columnMap, String columnName) {
        Integer index = columnMap.get(columnName);
        if (index == null || index >= fields.length) {
            return null;
        }
        String value = fields[index].trim();
        // Remove surrounding quotes if present
        if (value.startsWith("\"") && value.endsWith("\"") && value.length() > 1) {
            value = value.substring(1, value.length() - 1);
        }
        return value.isEmpty() ? null : value;
    }

    /**
     * Map entity to response DTO
     */
    private ProfessionalVerificationResponse mapToResponse(ProfessionalVerification verification) {
        ProfessionalVerificationResponse response = new ProfessionalVerificationResponse();
        
        response.setId(verification.getId());
        response.setUserId(verification.getUser().getId());
        response.setUserFullName(verification.getUser().getFullName());
        response.setUserEmail(verification.getUser().getEmail());
        response.setProfessionalType(verification.getProfessionalType());
        response.setBmdcNumber(verification.getBmdcNumber());
        response.setDegreeInstitution(verification.getDegreeInstitution());
        response.setDegreeTitle(verification.getDegreeTitle());
        response.setAffiliation(verification.getAffiliation());
        response.setExperienceYears(verification.getExperienceYears());
        response.setSpecialization(verification.getSpecialization());
        response.setLicenseDocumentUrl(verification.getLicenseDocumentUrl());
        response.setDegreeDocumentUrl(verification.getDegreeDocumentUrl());
        response.setAdditionalDocumentsUrls(verification.getAdditionalDocumentsUrls());
        response.setLanguagesSpoken(verification.getLanguagesSpoken());
        response.setClinicAddress(verification.getClinicAddress());
        response.setContactEmail(verification.getContactEmail());
        response.setContactPhone(verification.getContactPhone());
        response.setStatus(verification.getStatus());
        response.setAdminNotes(verification.getAdminNotes());
        response.setRejectionReason(verification.getRejectionReason());
        response.setVerifiedByAdminId(verification.getVerifiedByAdminId());
        response.setVerifiedAt(verification.getVerifiedAt());
        response.setCorrelationId(verification.getCorrelationId());
        response.setCreatedAt(verification.getCreatedAt());
        response.setUpdatedAt(verification.getUpdatedAt());

        // Add AI confidence fields
        response.setAiConfidenceScore(verification.getAiConfidenceScore());
        response.setAiRecommendation(verification.getAiRecommendation());
        response.setAiMatchDetails(verification.getAiMatchDetails());
        response.setAiProcessedAt(verification.getAiProcessedAt());

        // Get admin name if available
        if (verification.getVerifiedByAdminId() != null) {
            userRepository.findById(verification.getVerifiedByAdminId())
                .ifPresent(admin -> response.setVerifiedByAdminName(admin.getFullName()));
        }

        return response;
    }

    /**
     * Get all pre-approved professionals from reference list
     */
    public List<PreApprovedProfessional> getAllPreApprovedProfessionals() {
        return preApprovedRepository.findAllByOrderByUploadedAtDesc();
    }

    /**
     * Search pre-approved professionals by criteria
     */
    public List<PreApprovedProfessional> searchPreApprovedProfessionals(
            String email, String name, ProfessionalType type, String specialization) {
        return preApprovedRepository.searchPreApproved(email, name, type, specialization);
    }

    /**
     * Check if a professional is in the pre-approved reference list
     */
    public boolean isInPreApprovedList(String email, ProfessionalType type, String specialization) {
        return preApprovedRepository.findByEmailIgnoreCaseAndProfessionalTypeAndSpecializationIgnoreCase(
            email, type, specialization).isPresent();
    }

    /**
     * Get pre-approved professional details for verification assistance
     */
    public Optional<PreApprovedProfessional> getPreApprovedProfessional(String email, ProfessionalType type, String specialization) {
        return preApprovedRepository.findByEmailIgnoreCaseAndProfessionalTypeAndSpecializationIgnoreCase(
            email, type, specialization);
    }

    /**
     * Remove a professional from pre-approved list
     */
    public boolean removeFromPreApprovedList(Long id) {
        try {
            preApprovedRepository.deleteById(id);
            return true;
        } catch (Exception e) {
            log.error("Error removing pre-approved professional with ID {}: {}", id, e.getMessage());
            return false;
        }
    }

    /**
     * Get count of pre-approved professionals
     */
    public long getPreApprovedCount() {
        return preApprovedRepository.count();
    }
}
