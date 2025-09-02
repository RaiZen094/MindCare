package com.mindcare.connect.repository;

import com.mindcare.connect.entity.PreApprovedProfessional;
import com.mindcare.connect.entity.ProfessionalType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PreApprovedProfessionalRepository extends JpaRepository<PreApprovedProfessional, Long> {
    
    // Find by email
    Optional<PreApprovedProfessional> findByEmailIgnoreCase(String email);
    
    // Find by email and professional type
    Optional<PreApprovedProfessional> findByEmailIgnoreCaseAndProfessionalType(String email, ProfessionalType professionalType);
    
    // Find by email, type and specialization for exact matching
    Optional<PreApprovedProfessional> findByEmailIgnoreCaseAndProfessionalTypeAndSpecializationIgnoreCase(
        String email, ProfessionalType professionalType, String specialization);
    
    // Search functionality for admin
    @Query("SELECT p FROM PreApprovedProfessional p WHERE " +
           "(:email IS NULL OR LOWER(p.email) LIKE LOWER(CONCAT('%', :email, '%'))) AND " +
           "(:name IS NULL OR LOWER(p.fullName) LIKE LOWER(CONCAT('%', :name, '%'))) AND " +
           "(:type IS NULL OR p.professionalType = :type) AND " +
           "(:specialization IS NULL OR LOWER(p.specialization) LIKE LOWER(CONCAT('%', :specialization, '%')))")
    List<PreApprovedProfessional> searchPreApproved(
        @Param("email") String email,
        @Param("name") String name, 
        @Param("type") ProfessionalType type,
        @Param("specialization") String specialization);
    
    // Auto-verification queries for BMDC matching
    @Query("SELECT p FROM PreApprovedProfessional p WHERE p.bmdcNumber = :bmdcNumber AND p.professionalType = :type")
    List<PreApprovedProfessional> findByBmdcNumberAndProfessionalType(@Param("bmdcNumber") String bmdcNumber, 
                                                                      @Param("type") ProfessionalType type);

    @Query("SELECT p FROM PreApprovedProfessional p WHERE p.bmdcNumber LIKE %:bmdcNumber% AND p.professionalType = :type")
    List<PreApprovedProfessional> findByBmdcNumberContainingAndProfessionalType(@Param("bmdcNumber") String bmdcNumber,
                                                                               @Param("type") ProfessionalType type);

    // Auto-verification queries for degree/institution matching
    @Query("SELECT p FROM PreApprovedProfessional p WHERE p.degreeTitle = :degreeTitle AND p.degreeInstitution = :institution AND p.professionalType = :type")
    List<PreApprovedProfessional> findByDegreeAndInstitutionAndProfessionalType(@Param("degreeTitle") String degreeTitle,
                                                                               @Param("institution") String institution,
                                                                               @Param("type") ProfessionalType type);

    // Fuzzy matching for degrees (for confidence calculation)
    @Query("SELECT p FROM PreApprovedProfessional p WHERE LOWER(p.degreeTitle) LIKE LOWER(CONCAT('%', :degree, '%')) AND p.professionalType = :type")
    List<PreApprovedProfessional> findByDegreeContainingAndProfessionalType(@Param("degree") String degree, @Param("type") ProfessionalType type);

    // Fuzzy matching for BMDC (broader search)
    @Query("SELECT p FROM PreApprovedProfessional p WHERE p.bmdcNumber LIKE %:bmdcNumber% AND p.professionalType = 'PSYCHIATRIST'")
    List<PreApprovedProfessional> findByBmdcNumberContaining(@Param("bmdcNumber") String bmdcNumber);
    
    // Get all ordered by upload date
    List<PreApprovedProfessional> findAllByOrderByUploadedAtDesc();
    
    // Count total records
    long count();
}
