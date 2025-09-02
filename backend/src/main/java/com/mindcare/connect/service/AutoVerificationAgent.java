package com.mindcare.connect.service;

import com.mindcare.connect.entity.ProfessionalVerification;
import com.mindcare.connect.entity.PreApprovedProfessional;
import com.mindcare.connect.entity.ProfessionalType;
import com.mindcare.connect.entity.User;
import com.mindcare.connect.repository.PreApprovedProfessionalRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;

@Service
public class AutoVerificationAgent {
    
    private static final Logger logger = LoggerFactory.getLogger(AutoVerificationAgent.class);
    
    @Autowired
    private PreApprovedProfessionalRepository preApprovedRepository;
    
    /**
     * Calculate confidence score for a professional verification application
     * Returns confidence result with match details for admin review
     */
    public ConfidenceResult calculateConfidence(ProfessionalVerification application) {
        logger.info("Calculating confidence for application: {}", application.getId());
        
        if (application.getProfessionalType() == ProfessionalType.PSYCHIATRIST) {
            return calculatePsychiatristConfidence(application);
        } else if (application.getProfessionalType() == ProfessionalType.PSYCHOLOGIST) {
            return calculatePsychologistConfidence(application);
        }
        
        return new ConfidenceResult(0.0, "⚫ UNKNOWN - Unsupported professional type", null, 
            "Professional type not recognized: " + application.getProfessionalType());
    }
    
    /**
     * Calculate confidence for psychiatrist based on BMDC number matching
     */
    private ConfidenceResult calculatePsychiatristConfidence(ProfessionalVerification application) {
        String bmdcNumber = application.getBmdcNumber();
        if (bmdcNumber == null || bmdcNumber.trim().isEmpty()) {
            return new ConfidenceResult(0.0, "⚫ MANUAL REVIEW - Missing BMDC number", null,
                "BMDC number is required for psychiatrists but was not provided");
        }
        
        // Clean and normalize BMDC number
        String cleanBmdc = bmdcNumber.replaceAll("[^0-9]", "");
        
        // Try exact match first
        List<PreApprovedProfessional> exactMatches = preApprovedRepository.findByBmdcNumberContainingAndProfessionalType(cleanBmdc, ProfessionalType.PSYCHIATRIST);
        
        if (!exactMatches.isEmpty()) {
            PreApprovedProfessional bestMatch = exactMatches.get(0);
            
            // Check if name also matches (bonus confidence)
            double confidence = 0.8; // Base confidence for BMDC match
            String nameMatchDetails = "";
            
            if (namesMatch(getUserFullName(application), bestMatch.getFullName())) {
                confidence += 0.2; // Boost for name match
                nameMatchDetails = " + Name match bonus";
            }
            
            String recommendation = confidence >= 0.95 ? "🟢 HIGH CONFIDENCE - Recommend approval" :
                                  confidence >= 0.8 ? "🟡 MEDIUM CONFIDENCE - Verify manually" :
                                  "🔴 LOW CONFIDENCE - Requires careful review";
            
            String details = String.format("BMDC match found: %s%s. Professional: %s", 
                cleanBmdc, nameMatchDetails, bestMatch.getFullName());
            
            return new ConfidenceResult(confidence, recommendation, bestMatch, details);
        }
        
        // No exact match found
        return new ConfidenceResult(0.0, "⚫ MANUAL REVIEW - No BMDC match found", null,
            "No matching BMDC number found in pre-approved list: " + cleanBmdc);
    }
    
    /**
     * Calculate confidence for psychologist based on degree and institution matching
     */
    private ConfidenceResult calculatePsychologistConfidence(ProfessionalVerification application) {
        String degree = application.getDegreeTitle();
        String institution = application.getDegreeInstitution();
        
        if (degree == null || degree.trim().isEmpty() || institution == null || institution.trim().isEmpty()) {
            return new ConfidenceResult(0.0, "⚫ MANUAL REVIEW - Missing degree/institution", null,
                "Both degree and institution are required for psychologists");
        }
        
        // Find potential matches based on degree and institution
        List<PreApprovedProfessional> degreeMatches = preApprovedRepository.findByDegreeAndInstitutionAndProfessionalType(degree.trim(), institution.trim(), ProfessionalType.PSYCHOLOGIST);
        
        // If no exact matches, try fuzzy matching
        if (degreeMatches.isEmpty()) {
            degreeMatches = preApprovedRepository.findByDegreeContainingAndProfessionalType(degree.trim(), ProfessionalType.PSYCHOLOGIST);
        }
        
        double bestConfidence = 0.0;
        PreApprovedProfessional bestMatch = null;
        String bestDetails = "";
        
        for (PreApprovedProfessional professional : degreeMatches) {
            double confidence = 0.0;
            StringBuilder details = new StringBuilder();
            
            // Degree match
            if (degreesMatch(degree, professional.getDegreeTitle())) {
                confidence += 0.4;
                details.append("Degree match: ").append(professional.getDegreeTitle());
            }
            
            // Institution match
            if (institutionsMatch(institution, professional.getDegreeInstitution())) {
                confidence += 0.4;
                details.append(details.length() > 0 ? " + " : "").append("Institution match: ").append(professional.getDegreeInstitution());
            }
            
            // Name match bonus
            if (namesMatch(getUserFullName(application), professional.getFullName())) {
                confidence += 0.2;
                details.append(details.length() > 0 ? " + " : "").append("Name match bonus");
            }
            
            if (confidence > bestConfidence) {
                bestConfidence = confidence;
                bestMatch = professional;
                bestDetails = details.toString();
            }
        }
        
        String recommendation;
        if (bestConfidence >= 0.9) {
            recommendation = "🟢 HIGH CONFIDENCE - Recommend approval";
        } else if (bestConfidence >= 0.6) {
            recommendation = "🟡 MEDIUM CONFIDENCE - Verify manually";
        } else if (bestConfidence > 0.0) {
            recommendation = "🔴 LOW CONFIDENCE - Requires careful review";
        } else {
            recommendation = "⚫ MANUAL REVIEW - No matches found";
        }
        
        if (bestMatch == null) {
            return new ConfidenceResult(0.0, recommendation, null,
                "No matching degree/institution found for: " + degree + " from " + institution);
        }
        
        return new ConfidenceResult(bestConfidence, recommendation, bestMatch, bestDetails);
    }
    
    /**
     * Helper method to check if names match (fuzzy matching)
     */
    private boolean namesMatch(String name1, String name2) {
        if (name1 == null || name2 == null) return false;
        
        name1 = normalizeName(name1);
        name2 = normalizeName(name2);
        
        // Exact match
        if (name1.equals(name2)) return true;
        
        // Check if one name contains the other
        if (name1.contains(name2) || name2.contains(name1)) return true;
        
        // Check word similarity (at least 2 words match)
        String[] words1 = name1.split("\\s+");
        String[] words2 = name2.split("\\s+");
        
        int matches = 0;
        for (String word1 : words1) {
            for (String word2 : words2) {
                if (word1.equals(word2) && word1.length() > 2) {
                    matches++;
                    break;
                }
            }
        }
        
        return matches >= 2;
    }
    
    /**
     * Helper method to check if degrees match (fuzzy matching)
     */
    private boolean degreesMatch(String degree1, String degree2) {
        if (degree1 == null || degree2 == null) return false;
        
        degree1 = normalizeDegree(degree1);
        degree2 = normalizeDegree(degree2);
        
        // Exact match
        if (degree1.equals(degree2)) return true;
        
        // Check if one contains the other
        if (degree1.contains(degree2) || degree2.contains(degree1)) return true;
        
        // Check for common degree abbreviations
        return checkDegreeAbbreviations(degree1, degree2);
    }
    
    /**
     * Helper method to check if institutions match (fuzzy matching)
     */
    private boolean institutionsMatch(String inst1, String inst2) {
        if (inst1 == null || inst2 == null) return false;
        
        inst1 = normalizeInstitution(inst1);
        inst2 = normalizeInstitution(inst2);
        
        // Exact match
        if (inst1.equals(inst2)) return true;
        
        // Check if one contains the other
        if (inst1.contains(inst2) || inst2.contains(inst1)) return true;
        
        // Check word similarity (at least 2 significant words match)
        String[] words1 = inst1.split("\\s+");
        String[] words2 = inst2.split("\\s+");
        
        int matches = 0;
        for (String word1 : words1) {
            for (String word2 : words2) {
                if (word1.equals(word2) && word1.length() > 3) {
                    matches++;
                    break;
                }
            }
        }
        
        return matches >= 2;
    }
    
    /**
     * Normalize name for comparison
     */
    private String normalizeName(String name) {
        if (name == null) return "";
        
        return name.toLowerCase()
                  .replaceAll("^(dr\\.?|prof\\.?|professor)\\s+", "") // Remove titles
                  .replaceAll("[^a-z\\s]", "") // Remove special characters
                  .trim();
    }
    
    /**
     * Normalize degree for comparison
     */
    private String normalizeDegree(String degree) {
        if (degree == null) return "";
        
        return degree.toLowerCase()
                    .replaceAll("[^a-z\\s]", "") // Remove special characters
                    .trim();
    }
    
    /**
     * Normalize institution for comparison
     */
    private String normalizeInstitution(String institution) {
        if (institution == null) return "";
        
        return institution.toLowerCase()
                         .replaceAll("\\b(university|college|institute|school)\\b", "") // Remove common words
                         .replaceAll("[^a-z\\s]", "") // Remove special characters
                         .trim();
    }
    
    /**
     * Check for common degree abbreviations
     */
    private boolean checkDegreeAbbreviations(String degree1, String degree2) {
        // Common psychology degree patterns
        String[][] patterns = {
            {"bachelor of psychology", "b psyc", "ba psychology", "bs psychology"},
            {"master of psychology", "m psyc", "ma psychology", "ms psychology"},
            {"doctor of psychology", "psyd", "phd psychology"},
            {"bachelor of science", "bsc", "bs"},
            {"master of science", "msc", "ms"},
            {"doctor of philosophy", "phd"}
        };
        
        for (String[] pattern : patterns) {
            boolean found1 = false, found2 = false;
            for (String variant : pattern) {
                if (degree1.contains(variant)) found1 = true;
                if (degree2.contains(variant)) found2 = true;
            }
            if (found1 && found2) return true;
        }
        
        return false;
    }
    
    /**
     * Get full name from application user
     */
    private String getUserFullName(ProfessionalVerification application) {
        if (application.getUser() != null) {
            User user = application.getUser();
            String firstName = user.getFirstName() != null ? user.getFirstName() : "";
            String lastName = user.getLastName() != null ? user.getLastName() : "";
            return (firstName + " " + lastName).trim();
        }
        return "";
    }
}
