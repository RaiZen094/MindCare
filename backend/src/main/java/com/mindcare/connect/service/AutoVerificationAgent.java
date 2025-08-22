package com.mindcare.connect.service;

import com.mindcare.connect.entity.ProfessionalVerification;
import com.mindcare.connect.entity.PreApprovedProfessional;
import com.mindcare.connect.entity.VerificationStatus;
import com.mindcare.connect.entity.ProfessionalType;
import com.mindcare.connect.entity.User;
import com.mindcare.connect.repository.PreApprovedProfessionalRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class AutoVerificationAgent {
    
    private static final Logger logger = LoggerFactory.getLogger(AutoVerificationAgent.class);
    
    @Autowired
    private PreApprovedProfessionalRepository preApprovedRepository;
    
    public AutoVerificationResult processApplication(ProfessionalVerification application) {
        logger.info("Processing auto-verification for application: {}", application.getId());
        
        if (application.getProfessionalType() == ProfessionalType.PSYCHIATRIST) {
            return processPsychiatristApplication(application);
        } else if (application.getProfessionalType() == ProfessionalType.PSYCHOLOGIST) {
            return processPsychologistApplication(application);
        }
        
        return new AutoVerificationResult(false, 0.0, "Unknown professional type", null);
    }
    
    private AutoVerificationResult processPsychiatristApplication(ProfessionalVerification application) {
        String bmdcNumber = application.getBmdcNumber();
        String applicantName = getFullNameFromApplication(application);
        String applicantEmail = application.getContactEmail();
        
        if (bmdcNumber == null || bmdcNumber.trim().isEmpty()) {
            return new AutoVerificationResult(false, 0.0, "BMDC number required for psychiatrists", null);
        }
        
        // Normalize BMDC number for comparison (handle different formats)
        String normalizedBmdc = normalizeBmdcNumber(bmdcNumber);
        logger.info("Looking for BMDC match: original={}, normalized={}", bmdcNumber, normalizedBmdc);
        
        // Find by exact BMDC number first
        List<PreApprovedProfessional> exactMatches = preApprovedRepository.findByBmdcNumberAndProfessionalType(
            bmdcNumber, ProfessionalType.PSYCHIATRIST
        );
        
        // If no exact match, try normalized version
        if (exactMatches.isEmpty() && !normalizedBmdc.equals(bmdcNumber)) {
            exactMatches = preApprovedRepository.findByBmdcNumberAndProfessionalType(
                normalizedBmdc, ProfessionalType.PSYCHIATRIST
            );
        }
        
        // Also try flexible BMDC matching
        if (exactMatches.isEmpty()) {
            exactMatches = findFlexibleBmdcMatches(bmdcNumber, normalizedBmdc);
        }
        
        for (PreApprovedProfessional match : exactMatches) {
            double confidence = calculatePsychiatristConfidence(application, match);
            
            if (confidence >= 0.85) {
                logger.info("High confidence BMDC match found for psychiatrist: {} ({}%) - BMDC: {}", 
                           applicantName, confidence * 100, bmdcNumber);
                return new AutoVerificationResult(true, confidence, 
                    "Auto-approved: BMDC number and credentials verified against pre-approved list", match);
            } else if (confidence >= 0.70) {
                logger.info("Medium confidence BMDC match for psychiatrist: {} ({}%) - BMDC: {}", 
                           applicantName, confidence * 100, bmdcNumber);
                return new AutoVerificationResult(false, confidence, 
                    "Flagged for review: BMDC matches but other details differ", match);
            }
        }
        
        return new AutoVerificationResult(false, 0.0, 
            "No matching BMDC number found in pre-approved list. Submitted: " + bmdcNumber, null);
    }
    
    private AutoVerificationResult processPsychologistApplication(ProfessionalVerification application) {
        String degreeTitle = application.getDegreeTitle();
        String degreeInstitution = application.getDegreeInstitution();
        String applicantName = getFullNameFromApplication(application);
        String applicantEmail = application.getContactEmail();
        
        if (degreeTitle == null || degreeInstitution == null) {
            return new AutoVerificationResult(false, 0.0, 
                "Degree and institution required for psychologists", null);
        }
        
        // Find by degree and institution (primary criteria)
        List<PreApprovedProfessional> matches = preApprovedRepository.findByDegreeAndInstitutionAndProfessionalType(
            degreeTitle, degreeInstitution, ProfessionalType.PSYCHOLOGIST
        );
        
        for (PreApprovedProfessional match : matches) {
            double confidence = calculatePsychologistConfidence(application, match);
            
            if (confidence >= 0.85) {
                logger.info("High confidence match found for psychologist: {} ({}%)", 
                           applicantName, confidence * 100);
                return new AutoVerificationResult(true, confidence, 
                    "Auto-approved: Degree, institution and credentials verified", match);
            } else if (confidence >= 0.70) {
                logger.info("Medium confidence match for psychologist: {} ({}%)", 
                           applicantName, confidence * 100);
                return new AutoVerificationResult(false, confidence, 
                    "Flagged for review: Degree/institution matches but other details differ", match);
            }
        }
        
        return new AutoVerificationResult(false, 0.0, 
            "No matching degree/institution combination found in pre-approved list", null);
    }
    
    private double calculatePsychiatristConfidence(ProfessionalVerification application, 
                                                 PreApprovedProfessional preApproved) {
        double confidence = 0.0;
        
        // BMDC number match (40% weight) - already matched to get here
        confidence += 0.40;
        
        // Name similarity (25% weight)
        double nameSimilarity = calculateNameSimilarity(getFullNameFromApplication(application), preApproved.getFullName());
        confidence += nameSimilarity * 0.25;
        
        // Email similarity (20% weight)
        double emailSimilarity = calculateEmailSimilarity(application.getContactEmail(), preApproved.getEmail());
        confidence += emailSimilarity * 0.20;
        
        // Specialization similarity (15% weight)
        double specializationSimilarity = calculateSpecializationSimilarity(
            application.getSpecialization(), preApproved.getSpecialization());
        confidence += specializationSimilarity * 0.15;
        
        logger.debug("Psychiatrist confidence calculation: Name={}, Email={}, Specialization={}, Total={}", 
                    nameSimilarity, emailSimilarity, specializationSimilarity, confidence);
        
        return confidence;
    }
    
    private double calculatePsychologistConfidence(ProfessionalVerification application, 
                                                 PreApprovedProfessional preApproved) {
        double confidence = 0.0;
        
        // Degree + Institution match (40% weight) - already matched to get here
        confidence += 0.40;
        
        // Name similarity (25% weight)
        double nameSimilarity = calculateNameSimilarity(getFullNameFromApplication(application), preApproved.getFullName());
        confidence += nameSimilarity * 0.25;
        
        // Email similarity (20% weight)
        double emailSimilarity = calculateEmailSimilarity(application.getContactEmail(), preApproved.getEmail());
        confidence += emailSimilarity * 0.20;
        
        // Specialization similarity (15% weight)
        double specializationSimilarity = calculateSpecializationSimilarity(
            application.getSpecialization(), preApproved.getSpecialization());
        confidence += specializationSimilarity * 0.15;
        
        logger.debug("Psychologist confidence calculation: Name={}, Email={}, Specialization={}, Total={}", 
                    nameSimilarity, emailSimilarity, specializationSimilarity, confidence);
        
        return confidence;
    }
    
    private double calculateNameSimilarity(String name1, String name2) {
        if (name1 == null || name2 == null) return 0.0;
        
        name1 = normalizeName(name1);
        name2 = normalizeName(name2);
        
        if (name1.equals(name2)) return 1.0;
        
        // Use Levenshtein distance for similarity
        int distance = levenshteinDistance(name1, name2);
        int maxLength = Math.max(name1.length(), name2.length());
        
        return maxLength == 0 ? 0.0 : 1.0 - ((double) distance / maxLength);
    }
    
    private double calculateEmailSimilarity(String email1, String email2) {
        if (email1 == null || email2 == null) return 0.0;
        
        email1 = email1.toLowerCase().trim();
        email2 = email2.toLowerCase().trim();
        
        if (email1.equals(email2)) return 1.0;
        
        // Check domain similarity
        String[] parts1 = email1.split("@");
        String[] parts2 = email2.split("@");
        
        if (parts1.length == 2 && parts2.length == 2) {
            if (parts1[1].equals(parts2[1])) {
                // Same domain, check username similarity
                double usernameSimilarity = calculateNameSimilarity(parts1[0], parts2[0]);
                return usernameSimilarity * 0.7; // Reduced weight for username-only match
            }
        }
        
        return 0.0;
    }
    
    private double calculateSpecializationSimilarity(String spec1, String spec2) {
        if (spec1 == null || spec2 == null) return 0.0;
        
        spec1 = spec1.toLowerCase().trim();
        spec2 = spec2.toLowerCase().trim();
        
        if (spec1.equals(spec2)) return 1.0;
        
        // Check for keyword matches
        String[] words1 = spec1.split("\\s+");
        String[] words2 = spec2.split("\\s+");
        
        int matches = 0;
        for (String word1 : words1) {
            for (String word2 : words2) {
                if (word1.equals(word2)) {
                    matches++;
                    break;
                }
            }
        }
        
        int totalWords = Math.max(words1.length, words2.length);
        return totalWords == 0 ? 0.0 : (double) matches / totalWords;
    }
    
    private String normalizeName(String name) {
        if (name == null) return "";
        
        // Remove titles and normalize
        return name.toLowerCase()
                  .replaceAll("^(dr\\.?|prof\\.?|professor)\\s+", "")
                  .trim();
    }
    
    // Helper method to normalize BMDC numbers for flexible matching
    private String normalizeBmdcNumber(String bmdcNumber) {
        if (bmdcNumber == null) return "";
        
        // Remove spaces, convert to uppercase
        String normalized = bmdcNumber.trim().toUpperCase();
        
        // Ensure it has the BMDC- prefix if it's just numbers
        if (normalized.matches("^\\d+$")) {
            normalized = "BMDC-" + normalized;
        }
        
        return normalized;
    }
    
    // Helper method for flexible BMDC matching
    private List<PreApprovedProfessional> findFlexibleBmdcMatches(String originalBmdc, String normalizedBmdc) {
        // Extract just the number part for flexible matching
        String numberPart = originalBmdc.replaceAll("[^0-9]", "");
        
        if (numberPart.length() >= 4) {
            // Try to find matches where the number part matches
            return preApprovedRepository.findByBmdcNumberContainingAndProfessionalType(
                numberPart, ProfessionalType.PSYCHIATRIST
            );
        }
        
        return List.of();
    }
    
    private String getFullNameFromApplication(ProfessionalVerification application) {
        if (application.getUser() != null) {
            User user = application.getUser();
            String firstName = user.getFirstName() != null ? user.getFirstName() : "";
            String lastName = user.getLastName() != null ? user.getLastName() : "";
            return (firstName + " " + lastName).trim();
        }
        return "";
    }
    
    private int levenshteinDistance(String s1, String s2) {
        int[][] dp = new int[s1.length() + 1][s2.length() + 1];
        
        for (int i = 0; i <= s1.length(); i++) {
            for (int j = 0; j <= s2.length(); j++) {
                if (i == 0) {
                    dp[i][j] = j;
                } else if (j == 0) {
                    dp[i][j] = i;
                } else {
                    dp[i][j] = Math.min(
                        dp[i - 1][j - 1] + (s1.charAt(i - 1) == s2.charAt(j - 1) ? 0 : 1),
                        Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1)
                    );
                }
            }
        }
        
        return dp[s1.length()][s2.length()];
    }
}
