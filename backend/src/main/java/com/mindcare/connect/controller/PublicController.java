package com.mindcare.connect.controller;

import com.mindcare.connect.dto.PageResponse;
import com.mindcare.connect.dto.ProfessionalDirectoryDto;
import com.mindcare.connect.dto.ProfessionalFilterDto;
import com.mindcare.connect.dto.ProfessionalProfileDto;
import com.mindcare.connect.entity.ProfessionalType;
import com.mindcare.connect.service.ProfessionalDirectoryService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Public Controller for verified professional directory
 * Following Integrity Pact: Public access to verified professionals for:
 * - Public/unauthenticated users (can browse)
 * - Patients (can browse and potentially book)
 * - NOT accessible via frontend for professionals or admins (they have their own dashboards)
 */
@RestController
@RequestMapping("/public")
@CrossOrigin(origins = {"http://localhost:3000", "https://mindcare-connect.vercel.app"})
public class PublicController {
    
    private static final Logger logger = LoggerFactory.getLogger(PublicController.class);
    
    @Autowired
    private ProfessionalDirectoryService professionalDirectoryService;
    
    /**
     * General User (Anonymous) Features
     * These endpoints are accessible without authentication
     */
    
    @GetMapping("/wellness-hub")
    public ResponseEntity<Map<String, Object>> getWellnessHub() {
        Map<String, Object> response = new HashMap<>();
        
        // Mock wellness articles and resources
        response.put("articles", List.of(
            Map.of(
                "id", 1,
                "title", "Understanding Mental Health in Bangladesh",
                "content", "Mental health awareness is crucial for our society...",
                "author", "Dr. Rahman",
                "category", "Mental Health Awareness",
                "readTime", "5 mins"
            ),
            Map.of(
                "id", 2,
                "title", "5 Simple Mindfulness Techniques",
                "content", "Practice these daily mindfulness exercises...",
                "author", "Therapist Sarah",
                "category", "Mindfulness",
                "readTime", "3 mins"
            ),
            Map.of(
                "id", 3,
                "title", "Breaking Mental Health Stigma",
                "content", "How to support friends and family with mental health challenges...",
                "author", "Community Team",
                "category", "Support",
                "readTime", "7 mins"
            )
        ));
        
        response.put("resources", List.of(
            Map.of("type", "video", "title", "Breathing Exercises", "duration", "10 mins"),
            Map.of("type", "audio", "title", "Meditation Guide", "duration", "15 mins"),
            Map.of("type", "pdf", "title", "Mental Health Self-Assessment", "pages", 5)
        ));
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Verified Professional Directory - Get paginated list of verified professionals
     * Public access - no authentication required
     * 
     * @param page Page number (0-based)
     * @param size Number of items per page
     * @param search Search term for name, specialization, or institution
     * @param professionalType Filter by professional type
     * @param specialization Filter by specialization
     * @param location Filter by location/city
     * @param language Filter by spoken language
     * @param minExperience Minimum years of experience
     * @param maxExperience Maximum years of experience
     * @return Paginated list of verified professionals
     */
    @GetMapping("/professionals")
    public ResponseEntity<PageResponse<ProfessionalDirectoryDto>> getVerifiedProfessionals(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) ProfessionalType professionalType,
            @RequestParam(required = false) String specialization,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String language,
            @RequestParam(required = false) Integer minExperience,
            @RequestParam(required = false) Integer maxExperience) {
        
        logger.info("Getting verified professionals - page: {}, size: {}, search: '{}'", page, size, search);
        
        try {
            // Create filters object
            ProfessionalFilterDto filters = new ProfessionalFilterDto();
            filters.setSearch(search);
            filters.setProfessionalType(professionalType);
            filters.setSpecialization(specialization);
            filters.setLocation(location);
            filters.setLanguage(language);
            filters.setMinExperience(minExperience);
            filters.setMaxExperience(maxExperience);
            
            // Create pageable with sorting by verification date (most recent first)
            Pageable pageable = PageRequest.of(page, size, Sort.by("verifiedAt").descending());
            
            PageResponse<ProfessionalDirectoryDto> response = professionalDirectoryService
                .getVerifiedProfessionals(pageable, filters);
            
            logger.info("Successfully retrieved {} professionals on page {}", 
                response.getContent().size(), page);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Error retrieving verified professionals", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Professional Profile - Get detailed profile of a verified professional
     * Public access - no authentication required
     * 
     * @param id Professional verification ID
     * @return Detailed professional profile
     */
    @GetMapping("/professionals/{id}")
    public ResponseEntity<ProfessionalProfileDto> getProfessionalProfile(@PathVariable Long id) {
        logger.info("Getting professional profile for ID: {}", id);
        
        try {
            Optional<ProfessionalProfileDto> profile = professionalDirectoryService
                .getVerifiedProfessionalProfile(id);
            
            if (profile.isPresent()) {
                logger.info("Successfully retrieved profile for professional ID: {}", id);
                return ResponseEntity.ok(profile.get());
            } else {
                logger.warn("Professional profile not found or not verified for ID: {}", id);
                return ResponseEntity.notFound().build();
            }
            
        } catch (Exception e) {
            logger.error("Error retrieving professional profile for ID: {}", id, e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Directory Filters - Get available filter options for the directory
     * Public access - no authentication required
     * 
     * @return Available specializations, locations, and languages
     */
    @GetMapping("/professionals/filters")
    public ResponseEntity<Map<String, Object>> getDirectoryFilters() {
        logger.info("Getting directory filter options");
        
        try {
            Map<String, Object> filters = new HashMap<>();
            
            filters.put("specializations", professionalDirectoryService.getAvailableSpecializations());
            filters.put("locations", professionalDirectoryService.getAvailableLocations());
            filters.put("languages", professionalDirectoryService.getAvailableLanguages());
            filters.put("professionalTypes", List.of(ProfessionalType.values()));
            
            logger.info("Successfully retrieved directory filters");
            return ResponseEntity.ok(filters);
            
        } catch (Exception e) {
            logger.error("Error retrieving directory filters", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @PostMapping("/ai-assessment")
    public ResponseEntity<Map<String, Object>> getAIAssessment(@RequestBody Map<String, Object> request) {
        Map<String, Object> response = new HashMap<>();
        
        // Mock AI Assistant for initial assessment
        String mood = (String) request.getOrDefault("mood", "unknown");
        @SuppressWarnings("unchecked")
        List<String> symptoms = (List<String>) request.getOrDefault("symptoms", List.of());
        
        Map<String, Object> assessment = new HashMap<>();
        
        // Simple logic based on input
        String riskLevel = symptoms.size() > 3 ? "high" : symptoms.size() > 1 ? "moderate" : "low";
        assessment.put("riskLevel", riskLevel);
        assessment.put("mood", mood);
        assessment.put("symptomsCount", symptoms.size());
        
        assessment.put("recommendations", List.of(
            "Consider speaking with a mental health professional",
            "Practice daily mindfulness exercises",
            "Maintain a regular sleep schedule",
            "Connect with friends and family for support"
        ));
        
        assessment.put("suggestedProfessionals", List.of(
            Map.of("name", "Dr. Fatima Rahman", "specialization", "Clinical Psychologist"),
            Map.of("name", "Sarah Khan", "specialization", "Family Therapist")
        ));
        
        assessment.put("nextSteps", List.of(
            "Take our detailed mental health questionnaire",
            "Book a consultation with a professional",
            "Join our peer support community"
        ));
        
        response.put("assessment", assessment);
        response.put("disclaimer", "This is an AI-generated assessment and should not replace professional medical advice.");
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/faq")
    public ResponseEntity<Map<String, Object>> getFAQ() {
        Map<String, Object> response = new HashMap<>();
        
        response.put("faqs", List.of(
            Map.of(
                "question", "How does MindCare Connect work?",
                "answer", "MindCare Connect is a platform that connects you with verified mental health professionals in Bangladesh. You can browse profiles, book appointments, and access wellness resources."
            ),
            Map.of(
                "question", "Is my information secure?",
                "answer", "Yes, we use industry-standard encryption and follow strict privacy protocols to protect your personal information."
            ),
            Map.of(
                "question", "What types of professionals are available?",
                "answer", "We have clinical psychologists, psychiatrists, family therapists, and counselors specializing in various areas of mental health."
            ),
            Map.of(
                "question", "Can I get help in Bengali?",
                "answer", "Absolutely! Most of our professionals are fluent in Bengali and understand the cultural context of mental health in Bangladesh."
            )
        ));
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/platform-info")
    public ResponseEntity<Map<String, Object>> getPlatformInfo() {
        Map<String, Object> response = new HashMap<>();
        
        response.put("features", Map.of(
            "anonymousAccess", List.of(
                "Browse Wellness Hub articles and resources",
                "View professional profiles and specializations", 
                "Use AI Assistant for initial assessment",
                "Access FAQ and platform information"
            ),
            "registeredUserAccess", List.of(
                "All anonymous features",
                "Create secure, private profile",
                "Book and manage appointments (online/physical)",
                "Private mood journal and wellness tools",
                "AI Wellness Companion",
                "Peer support community participation",
                "Secure messaging with chosen professionals"
            ),
            "professionalAccess", List.of(
                "Verified profile with credentials",
                "Personal dashboard for appointment management",
                "Calendar management for availability",
                "Secure patient messaging",
                "Contribute articles to Wellness Hub (admin approved)"
            ),
            "adminAccess", List.of(
                "Professional verification and onboarding",
                "Wellness Hub content management",
                "Community moderation",
                "Platform analytics and user support",
                "Data privacy and security compliance"
            )
        ));
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("service", "MindCare Connect Backend");
        response.put("timestamp", System.currentTimeMillis());
        response.put("version", "1.0.0");
        return ResponseEntity.ok(response);
    }
}
