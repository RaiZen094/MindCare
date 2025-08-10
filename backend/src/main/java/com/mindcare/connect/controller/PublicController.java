package com.mindcare.connect.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/public")
@CrossOrigin(origins = {"http://localhost:3000", "https://mindcare-connect.vercel.app"})
public class PublicController {
    
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
    
    @GetMapping("/professionals")
    public ResponseEntity<Map<String, Object>> getProfessionalsList() {
        Map<String, Object> response = new HashMap<>();
        
        // Mock professionals list (public profiles only)
        response.put("professionals", List.of(
            Map.of(
                "id", 1,
                "name", "Dr. Fatima Rahman",
                "specialization", "Clinical Psychologist",
                "experience", "8 years",
                "location", "Dhaka, Bangladesh",
                "languages", List.of("Bengali", "English"),
                "rating", 4.8,
                "consultationFee", "1500 BDT",
                "available", true
            ),
            Map.of(
                "id", 2,
                "name", "Dr. Ahmed Hassan",
                "specialization", "Psychiatrist",
                "experience", "12 years",
                "location", "Chittagong, Bangladesh",
                "languages", List.of("Bengali", "English", "Arabic"),
                "rating", 4.9,
                "consultationFee", "2000 BDT",
                "available", true
            ),
            Map.of(
                "id", 3,
                "name", "Sarah Khan",
                "specialization", "Family Therapist",
                "experience", "6 years",
                "location", "Sylhet, Bangladesh",
                "languages", List.of("Bengali", "English"),
                "rating", 4.7,
                "consultationFee", "1200 BDT",
                "available", false
            )
        ));
        
        return ResponseEntity.ok(response);
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
