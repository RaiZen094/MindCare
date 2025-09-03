package com.mindcare.connect.controller;

import com.mindcare.connect.dto.ProfessionalVerificationResponse;
import com.mindcare.connect.entity.ProfessionalType;
import com.mindcare.connect.entity.VerificationStatus;
import com.mindcare.connect.service.ProfessionalVerificationService;
import com.mindcare.connect.service.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.constraints.NotBlank;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Admin endpoints following Integrity Pact routing: /api/admin/*
 * These endpoints are for admins to manage professional verification applications
 */
@RestController
@RequestMapping("/admin")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"}, allowCredentials = "true")
public class AdminController {

    private final ProfessionalVerificationService verificationService;
    private final JwtService jwtService;

    @Autowired
    public AdminController(ProfessionalVerificationService verificationService, JwtService jwtService) {
        this.verificationService = verificationService;
        this.jwtService = jwtService;
    }

    /**
     * Get all pending verification applications for review
     */
    @GetMapping("/verifications/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getPendingVerifications(@RequestParam(defaultValue = "0") int page,
                                                     @RequestParam(defaultValue = "10") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<ProfessionalVerificationResponse> applications = verificationService.getPendingApplications(pageable);
            return ResponseEntity.ok(applications);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to get pending applications: " + e.getMessage());
        }
    }

    /**
     * Get all verification applications with optional status filter
     */
    @GetMapping("/verifications")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllVerifications(@RequestParam(required = false) VerificationStatus status,
                                                 @RequestParam(defaultValue = "0") int page,
                                                 @RequestParam(defaultValue = "10") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<ProfessionalVerificationResponse> applications = verificationService.getAllApplications(status, pageable);
            return ResponseEntity.ok(applications);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to get applications: " + e.getMessage());
        }
    }

    /**
     * Approve a professional verification application
     */
    @PostMapping("/verifications/{verificationId}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> approveVerification(@PathVariable Long verificationId,
                                                 @RequestBody(required = false) AdminActionRequest request,
                                                 HttpServletRequest httpRequest) {
        try {
            Long adminId = extractUserIdFromRequest(httpRequest);
            if (adminId == null) {
                return ResponseEntity.status(401).body("Unauthorized: Invalid token");
            }

            String notes = request != null ? request.getNotes() : "Approved by admin";
            ProfessionalVerificationResponse response = verificationService.approveApplication(verificationId, adminId, notes);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to approve verification: " + e.getMessage());
        }
    }

    /**
     * Reject a professional verification application
     */
    @PostMapping("/verifications/{verificationId}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> rejectVerification(@PathVariable Long verificationId,
                                                @RequestBody AdminActionRequest request,
                                                HttpServletRequest httpRequest) {
        try {
            Long adminId = extractUserIdFromRequest(httpRequest);
            if (adminId == null) {
                return ResponseEntity.status(401).body("Unauthorized: Invalid token");
            }

            if (request == null || request.getReason() == null || request.getReason().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Rejection reason is required");
            }

            String notes = request.getNotes() != null ? request.getNotes() : "";
            ProfessionalVerificationResponse response = verificationService.rejectApplication(
                verificationId, adminId, request.getReason(), notes);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to reject verification: " + e.getMessage());
        }
    }

    /**
     * Get verification statistics for admin dashboard
     */
    @GetMapping("/verifications/statistics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getVerificationStatistics() {
        try {
            List<Object[]> stats = verificationService.getVerificationStatistics();
            return ResponseEntity.ok(stats);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to get statistics: " + e.getMessage());
        }
    }

    /**
     * Get all verified professionals directory
     */
    @GetMapping("/professionals")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllProfessionals(@RequestParam(defaultValue = "0") int page,
                                                  @RequestParam(defaultValue = "20") int size,
                                                  @RequestParam(required = false) String search,
                                                  @RequestParam(required = false) String professionalType) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<ProfessionalVerificationResponse> professionals = verificationService.getAllProfessionals(
                professionalType, search, pageable);
            return ResponseEntity.ok(professionals);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to get professionals: " + e.getMessage());
        }
    }

    /**
     * Upload CSV of pre-verified professionals for auto-matching
     * Following Integrity Pact: Secure document handling
     */
    @PostMapping("/verifications/upload-csv")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> uploadPreVerifiedProfessionals(@RequestParam("file") MultipartFile file,
                                                             HttpServletRequest httpRequest) {
        try {
            Long adminId = extractUserIdFromRequest(httpRequest);
            if (adminId == null) {
                return ResponseEntity.status(401).body(new CSVUploadResponse(false, "Unauthorized: Invalid token", 0));
            }

            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(new CSVUploadResponse(false, "File is required", 0));
            }

            if (!"text/csv".equals(file.getContentType()) && !file.getOriginalFilename().endsWith(".csv")) {
                return ResponseEntity.badRequest().body(new CSVUploadResponse(false, "Only CSV files are allowed", 0));
            }

            // Rate limiting check (Integrity Pact requirement)
            if (file.getSize() > 5 * 1024 * 1024) { // 5MB limit
                return ResponseEntity.badRequest().body(new CSVUploadResponse(false, "File size too large. Maximum 5MB allowed.", 0));
            }

            String csvContent = new String(file.getBytes());
            String result = verificationService.uploadPreVerifiedProfessionals(csvContent);
            
            // Extract processed count from result
            int processedCount = extractProcessedCount(result);
            
            return ResponseEntity.ok(new CSVUploadResponse(true, result, processedCount));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new CSVUploadResponse(false, "Failed to upload CSV: " + e.getMessage(), 0));
        }
    }
    
    private int extractProcessedCount(String result) {
        try {
            // Extract number from "Successfully added X professionals" pattern
            String[] parts = result.split("Successfully added ");
            if (parts.length > 1) {
                String[] numParts = parts[1].split(" ");
                if (numParts.length > 0) {
                    return Integer.parseInt(numParts[0]);
                }
            }
            return 0;
        } catch (Exception e) {
            return 0;
        }
    }

    /**
     * Helper method to extract user ID from JWT token
     */
    private Long extractUserIdFromRequest(HttpServletRequest request) {
        try {
            String authHeader = request.getHeader("Authorization");
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                return jwtService.extractClaim(token, claims -> claims.get("userId", Long.class));
            }
            return null;
        } catch (Exception e) {
            return null;
        }
    }

    /**
     * Inner class for admin action requests
     */
    public static class AdminActionRequest {
        private String reason;
        private String notes;

        public AdminActionRequest() {}

        public String getReason() { return reason; }
        public void setReason(String reason) { this.reason = reason; }

        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
    }
    
    /**
     * Response class for CSV upload
     */
    public static class CSVUploadResponse {
        private boolean success;
        private String message;
        private int processedCount;
        
        public CSVUploadResponse(boolean success, String message, int processedCount) {
            this.success = success;
            this.message = message;
            this.processedCount = processedCount;
        }
        
        public boolean isSuccess() { return success; }
        public void setSuccess(boolean success) { this.success = success; }
        
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
        
        public int getProcessedCount() { return processedCount; }
        public void setProcessedCount(int processedCount) { this.processedCount = processedCount; }
    }

    /**
     * Get pre-approved professionals reference list
     */
    @GetMapping("/pre-approved-professionals")
    public ResponseEntity<?> getPreApprovedProfessionals(
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String specialization) {
        try {
            ProfessionalType professionalType = null;
            if (type != null && !type.isEmpty()) {
                try {
                    professionalType = ProfessionalType.valueOf(type.toUpperCase());
                } catch (IllegalArgumentException e) {
                    return ResponseEntity.badRequest().body("Invalid professional type: " + type);
                }
            }

            List<?> professionals;
            if (email != null || name != null || professionalType != null || specialization != null) {
                professionals = verificationService.searchPreApprovedProfessionals(email, name, professionalType, specialization);
            } else {
                professionals = verificationService.getAllPreApprovedProfessionals();
            }

            return ResponseEntity.ok(professionals);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error retrieving pre-approved professionals: " + e.getMessage());
        }
    }

    /**
     * Check if a professional is in pre-approved list
     */
    @GetMapping("/check-pre-approved")
    public ResponseEntity<?> checkPreApproved(
            @RequestParam String email,
            @RequestParam String type,
            @RequestParam String specialization) {
        try {
            ProfessionalType professionalType = ProfessionalType.valueOf(type.toUpperCase());
            boolean isPreApproved = verificationService.isInPreApprovedList(email, professionalType, specialization);
            
            Map<String, Object> response = new HashMap<>();
            response.put("isPreApproved", isPreApproved);
            response.put("email", email);
            response.put("type", type);
            response.put("specialization", specialization);
            
            if (isPreApproved) {
                verificationService.getPreApprovedProfessional(email, professionalType, specialization)
                    .ifPresent(prof -> response.put("professionalDetails", prof));
            }
            
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Invalid professional type: " + type);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error checking pre-approved status: " + e.getMessage());
        }
    }

    /**
     * Remove professional from pre-approved list
     */
    @DeleteMapping("/pre-approved-professionals/{id}")
    public ResponseEntity<?> removePreApproved(@PathVariable Long id) {
        try {
            boolean removed = verificationService.removeFromPreApprovedList(id);
            if (removed) {
                return ResponseEntity.ok(Map.of("success", true, "message", "Professional removed from pre-approved list"));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("success", false, "message", "Professional not found"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "message", "Error removing professional: " + e.getMessage()));
        }
    }
}
