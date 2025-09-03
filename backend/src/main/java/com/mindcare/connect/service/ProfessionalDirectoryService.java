package com.mindcare.connect.service;

import com.mindcare.connect.dto.PageResponse;
import com.mindcare.connect.dto.ProfessionalDirectoryDto;
import com.mindcare.connect.dto.ProfessionalFilterDto;
import com.mindcare.connect.dto.ProfessionalProfileDto;
import com.mindcare.connect.entity.ProfessionalType;
import com.mindcare.connect.entity.ProfessionalVerification;
import com.mindcare.connect.entity.VerificationStatus;
import com.mindcare.connect.repository.ProfessionalVerificationRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class ProfessionalDirectoryService {
    
    private static final Logger logger = LoggerFactory.getLogger(ProfessionalDirectoryService.class);
    
    @Autowired
    private ProfessionalVerificationRepository professionalVerificationRepository;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    /**
     * Get paginated list of verified professionals with optional filtering
     */
    public PageResponse<ProfessionalDirectoryDto> getVerifiedProfessionals(
            Pageable pageable, ProfessionalFilterDto filters) {
        
        logger.info("Getting verified professionals with filters: {}", filters);
        
        Specification<ProfessionalVerification> spec = createSpecification(filters);
        Page<ProfessionalVerification> page = professionalVerificationRepository.findAll(spec, pageable);
        
        List<ProfessionalDirectoryDto> dtos = page.getContent().stream()
            .map(this::convertToDirectoryDto)
            .toList();
        
        return new PageResponse<>(
            dtos,
            page.getNumber(),
            page.getSize(),
            page.getTotalPages(),
            page.getTotalElements()
        );
    }
    
    /**
     * Get detailed profile of a verified professional
     */
    public Optional<ProfessionalProfileDto> getVerifiedProfessionalProfile(Long id) {
        logger.info("Getting professional profile for ID: {}", id);
        
        return professionalVerificationRepository.findById(id)
            .filter(pv -> pv.getStatus() == VerificationStatus.APPROVED)
            .map(this::convertToProfileDto);
    }
    
    /**
     * Get list of unique specializations from verified professionals
     */
    public List<String> getAvailableSpecializations() {
        logger.info("Getting available specializations");
        
        return professionalVerificationRepository.findAll().stream()
            .filter(pv -> pv.getStatus() == VerificationStatus.APPROVED)
            .map(ProfessionalVerification::getSpecialization)
            .filter(spec -> spec != null && !spec.trim().isEmpty())
            .distinct()
            .sorted()
            .toList();
    }
    
    /**
     * Get list of unique locations from verified professionals
     */
    public List<String> getAvailableLocations() {
        logger.info("Getting available locations");
        
        return professionalVerificationRepository.findAll().stream()
            .filter(pv -> pv.getStatus() == VerificationStatus.APPROVED)
            .map(ProfessionalVerification::getClinicAddress)
            .filter(addr -> addr != null && !addr.trim().isEmpty())
            .map(this::extractCityFromAddress)
            .distinct()
            .sorted()
            .toList();
    }
    
    /**
     * Get list of unique languages from verified professionals
     */
    public List<String> getAvailableLanguages() {
        logger.info("Getting available languages");
        
        return professionalVerificationRepository.findAll().stream()
            .filter(pv -> pv.getStatus() == VerificationStatus.APPROVED)
            .map(pv -> parseLanguages(pv.getLanguagesSpoken()))
            .flatMap(List::stream)
            .distinct()
            .sorted()
            .toList();
    }
    
    /**
     * Create JPA Specification for filtering
     */
    private Specification<ProfessionalVerification> createSpecification(ProfessionalFilterDto filters) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();
            
            // Always filter for approved/verified professionals
            predicates.add(criteriaBuilder.equal(root.get("status"), VerificationStatus.APPROVED));
            
            // Search filter (name, specialization, institution)
            if (filters.hasSearch()) {
                String searchTerm = "%" + filters.getSearch().toLowerCase() + "%";
                Predicate searchPredicate = criteriaBuilder.or(
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("user").get("firstName")), searchTerm),
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("user").get("lastName")), searchTerm),
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("specialization")), searchTerm),
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("degreeInstitution")), searchTerm)
                );
                predicates.add(searchPredicate);
            }
            
            // Professional type filter
            if (filters.getProfessionalType() != null) {
                predicates.add(criteriaBuilder.equal(root.get("professionalType"), filters.getProfessionalType()));
            }
            
            // Specialization filter
            if (filters.hasSpecialization()) {
                predicates.add(criteriaBuilder.like(
                    criteriaBuilder.lower(root.get("specialization")), 
                    "%" + filters.getSpecialization().toLowerCase() + "%"
                ));
            }
            
            // Location filter
            if (filters.hasLocation()) {
                predicates.add(criteriaBuilder.like(
                    criteriaBuilder.lower(root.get("clinicAddress")), 
                    "%" + filters.getLocation().toLowerCase() + "%"
                ));
            }
            
            // Language filter
            if (filters.hasLanguage()) {
                predicates.add(criteriaBuilder.like(
                    criteriaBuilder.lower(root.get("languagesSpoken")), 
                    "%" + filters.getLanguage().toLowerCase() + "%"
                ));
            }
            
            // Experience filter
            if (filters.getMinExperience() != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(
                    root.get("experienceYears"), filters.getMinExperience()
                ));
            }
            
            if (filters.getMaxExperience() != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(
                    root.get("experienceYears"), filters.getMaxExperience()
                ));
            }
            
            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
    
    /**
     * Convert ProfessionalVerification to ProfessionalDirectoryDto
     */
    private ProfessionalDirectoryDto convertToDirectoryDto(ProfessionalVerification pv) {
        ProfessionalDirectoryDto dto = new ProfessionalDirectoryDto();
        
        dto.setId(pv.getId());
        dto.setName(pv.getUser().getFullName());
        dto.setEmail(pv.getUser().getEmail());
        dto.setPhone(pv.getUser().getPhone());
        dto.setProfessionalType(pv.getProfessionalType());
        dto.setSpecialization(pv.getSpecialization());
        dto.setExperienceYears(pv.getExperienceYears());
        dto.setLocation(extractCityFromAddress(pv.getClinicAddress()));
        dto.setLanguages(parseLanguages(pv.getLanguagesSpoken()));
        dto.setContactEmail(pv.getContactEmail());
        dto.setContactPhone(pv.getContactPhone());
        dto.setVerified(true);
        dto.setVerifiedAt(pv.getVerifiedAt());
        
        return dto;
    }
    
    /**
     * Convert ProfessionalVerification to ProfessionalProfileDto
     */
    private ProfessionalProfileDto convertToProfileDto(ProfessionalVerification pv) {
        ProfessionalProfileDto dto = new ProfessionalProfileDto();
        
        // Copy basic directory info
        dto.setId(pv.getId());
        dto.setName(pv.getUser().getFullName());
        dto.setEmail(pv.getUser().getEmail());
        dto.setPhone(pv.getUser().getPhone());
        dto.setProfessionalType(pv.getProfessionalType());
        dto.setSpecialization(pv.getSpecialization());
        dto.setExperienceYears(pv.getExperienceYears());
        dto.setLocation(extractCityFromAddress(pv.getClinicAddress()));
        dto.setLanguages(parseLanguages(pv.getLanguagesSpoken()));
        dto.setContactEmail(pv.getContactEmail());
        dto.setContactPhone(pv.getContactPhone());
        dto.setVerified(true);
        dto.setVerifiedAt(pv.getVerifiedAt());
        
        // Add detailed profile info
        dto.setDegreeInstitution(pv.getDegreeInstitution());
        dto.setDegreeTitle(pv.getDegreeTitle());
        dto.setAffiliation(pv.getAffiliation());
        dto.setBmdcNumber(pv.getBmdcNumber());
        dto.setClinicAddress(pv.getClinicAddress());
        dto.setAvailableForBooking(true); // Default for now, can be made dynamic later
        
        // Build education summary
        StringBuilder education = new StringBuilder();
        if (pv.getDegreeTitle() != null) {
            education.append(pv.getDegreeTitle());
            if (pv.getDegreeInstitution() != null) {
                education.append(" from ").append(pv.getDegreeInstitution());
            }
        }
        dto.setEducation(education.toString());
        
        return dto;
    }
    
    /**
     * Parse languages JSON string to List
     */
    private List<String> parseLanguages(String languagesJson) {
        if (languagesJson == null || languagesJson.trim().isEmpty()) {
            return List.of("Bengali"); // Default language
        }
        
        try {
            return objectMapper.readValue(languagesJson, new TypeReference<List<String>>() {});
        } catch (Exception e) {
            logger.warn("Failed to parse languages JSON: {}", languagesJson, e);
            // Fallback: split by comma
            return List.of(languagesJson.split(","))
                .stream()
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();
        }
    }
    
    /**
     * Extract city from full address
     */
    private String extractCityFromAddress(String address) {
        if (address == null || address.trim().isEmpty()) {
            return "Bangladesh";
        }
        
        // Simple logic to extract city - could be enhanced
        String[] parts = address.split(",");
        if (parts.length >= 2) {
            return parts[parts.length - 2].trim(); // Second to last part is usually city
        }
        
        return parts[0].trim();
    }
}
