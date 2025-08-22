package com.mindcare.connect.controller;

import com.mindcare.connect.dto.ProfessionalVerificationRequest;
import com.mindcare.connect.dto.ProfessionalVerificationResponse;
import com.mindcare.connect.service.ProfessionalVerificationService;
import com.mindcare.connect.service.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.Optional;

/**
 * Professional endpoints following Integrity Pact routing: /api/pro/*
 * These endpoints are for users who want to apply for or manage professional verification
 */
@RestController
@RequestMapping("/pro")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"}, allowCredentials = "true")
public class ProfessionalController {

    private final ProfessionalVerificationService verificationService;
    private final JwtService jwtService;

    @Autowired
    public ProfessionalController(ProfessionalVerificationService verificationService, JwtService jwtService) {
        this.verificationService = verificationService;
        this.jwtService = jwtService;
    }

    /**
     * Submit professional verification application
     * Any authenticated user (PATIENT) can apply to become a professional
     */
    @PostMapping("/verification/apply")
    @PreAuthorize("hasRole('PATIENT') or hasRole('PROFESSIONAL')")
    public ResponseEntity<?> applyForVerification(@RequestBody ProfessionalVerificationRequest request,
                                                  HttpServletRequest httpRequest) {
        try {
            // Extract user ID from JWT token
            Long userId = extractUserIdFromRequest(httpRequest);
            if (userId == null) {
                return ResponseEntity.status(401).body("Unauthorized: Invalid token");
            }

            // Custom validation based on professional type
            String validationError = request.getValidationError();
            if (validationError != null) {
                return ResponseEntity.badRequest().body("Validation failed: " + validationError);
            }

            ProfessionalVerificationResponse response = verificationService.submitApplication(userId, request);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Application failed: " + e.getMessage());
        }
    }

    /**
     * Get current verification application status
     */
    @GetMapping("/verification/status")
    @PreAuthorize("hasRole('PATIENT') or hasRole('PROFESSIONAL')")
    public ResponseEntity<?> getVerificationStatus(HttpServletRequest httpRequest) {
        try {
            Long userId = extractUserIdFromRequest(httpRequest);
            if (userId == null) {
                return ResponseEntity.status(401).body("Unauthorized: Invalid token");
            }

            Optional<ProfessionalVerificationResponse> status = verificationService.getApplicationStatus(userId);
            if (status.isPresent()) {
                return ResponseEntity.ok(status.get());
            } else {
                return ResponseEntity.ok("No verification application found");
            }

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to get status: " + e.getMessage());
        }
    }

    /**
     * Get application by correlation ID for tracking
     */
    @GetMapping("/verification/track/{correlationId}")
    @PreAuthorize("hasRole('PATIENT') or hasRole('PROFESSIONAL')")
    public ResponseEntity<?> trackApplication(@PathVariable String correlationId,
                                              HttpServletRequest httpRequest) {
        try {
            Long userId = extractUserIdFromRequest(httpRequest);
            if (userId == null) {
                return ResponseEntity.status(401).body("Unauthorized: Invalid token");
            }

            // Get user's application and verify correlation ID matches
            Optional<ProfessionalVerificationResponse> application = verificationService.getApplicationStatus(userId);
            if (application.isPresent() && correlationId.equals(application.get().getCorrelationId())) {
                return ResponseEntity.ok(application.get());
            } else {
                return ResponseEntity.notFound().build();
            }

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to track application: " + e.getMessage());
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
                String email = jwtService.extractUsername(token);
                
                // Extract userId from token claims
                return jwtService.extractClaim(token, claims -> claims.get("userId", Long.class));
            }
            return null;
        } catch (Exception e) {
            return null;
        }
    }
}
