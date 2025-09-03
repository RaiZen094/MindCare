package com.mindcare.connect.repository;

import com.mindcare.connect.entity.ProfessionalVerification;
import com.mindcare.connect.entity.User;
import com.mindcare.connect.entity.VerificationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProfessionalVerificationRepository extends JpaRepository<ProfessionalVerification, Long>, JpaSpecificationExecutor<ProfessionalVerification> {

    // Find by user
    Optional<ProfessionalVerification> findByUser(User user);
    
    Optional<ProfessionalVerification> findByUserId(Long userId);

    // Find by correlation ID for tracking
    Optional<ProfessionalVerification> findByCorrelationId(String correlationId);

    // Check if user has any verification application
    boolean existsByUser(User user);
    
    boolean existsByUserId(Long userId);

    // Find by status
    List<ProfessionalVerification> findByStatus(VerificationStatus status);
    
    Page<ProfessionalVerification> findByStatus(VerificationStatus status, Pageable pageable);

    // Find pending applications for admin review
    @Query("SELECT pv FROM ProfessionalVerification pv WHERE pv.status = 'PENDING' ORDER BY pv.createdAt ASC")
    List<ProfessionalVerification> findPendingApplications();

    @Query("SELECT pv FROM ProfessionalVerification pv WHERE pv.status = 'PENDING' ORDER BY pv.createdAt ASC")
    Page<ProfessionalVerification> findPendingApplications(Pageable pageable);

    // Find applications by admin who verified them
    List<ProfessionalVerification> findByVerifiedByAdminId(Long adminId);

    // Find applications within date range
    @Query("SELECT pv FROM ProfessionalVerification pv WHERE pv.createdAt BETWEEN :startDate AND :endDate ORDER BY pv.createdAt DESC")
    List<ProfessionalVerification> findByCreatedAtBetween(@Param("startDate") LocalDateTime startDate, 
                                                         @Param("endDate") LocalDateTime endDate);

    // Find by BMDC number for duplicate checking
    @Query("SELECT pv FROM ProfessionalVerification pv WHERE pv.bmdcNumber = :bmdcNumber AND pv.status = 'APPROVED'")
    List<ProfessionalVerification> findApprovedByBmdcNumber(@Param("bmdcNumber") String bmdcNumber);

    // Count applications by status
    @Query("SELECT COUNT(pv) FROM ProfessionalVerification pv WHERE pv.status = :status")
    Long countByStatus(@Param("status") VerificationStatus status);

    // Get statistics for admin dashboard
    @Query("SELECT pv.status, COUNT(pv) FROM ProfessionalVerification pv GROUP BY pv.status")
    List<Object[]> getVerificationStatistics();

    // Find recently approved professionals
    @Query("SELECT pv FROM ProfessionalVerification pv WHERE pv.status = 'APPROVED' AND pv.verifiedAt >= :since ORDER BY pv.verifiedAt DESC")
    List<ProfessionalVerification> findRecentlyApproved(@Param("since") LocalDateTime since);

    // Professionals directory queries
    @Query("SELECT pv FROM ProfessionalVerification pv WHERE pv.status = 'APPROVED' ORDER BY pv.verifiedAt DESC")
    Page<ProfessionalVerification> findApprovedProfessionals(Pageable pageable);

    @Query("SELECT pv FROM ProfessionalVerification pv WHERE pv.status = 'APPROVED' AND pv.professionalType = :type ORDER BY pv.verifiedAt DESC")
    Page<ProfessionalVerification> findApprovedByType(@Param("type") com.mindcare.connect.entity.ProfessionalType type, Pageable pageable);

    @Query("SELECT pv FROM ProfessionalVerification pv JOIN pv.user u WHERE pv.status = 'APPROVED' AND " +
           "(LOWER(u.firstName) LIKE %:search% OR LOWER(u.lastName) LIKE %:search% OR " +
           "LOWER(pv.specialization) LIKE %:search% OR LOWER(pv.degreeInstitution) LIKE %:search%) " +
           "ORDER BY pv.verifiedAt DESC")
    Page<ProfessionalVerification> findApprovedBySearch(@Param("search") String search, Pageable pageable);

    @Query("SELECT pv FROM ProfessionalVerification pv JOIN pv.user u WHERE pv.status = 'APPROVED' AND " +
           "pv.professionalType = :type AND " +
           "(LOWER(u.firstName) LIKE %:search% OR LOWER(u.lastName) LIKE %:search% OR " +
           "LOWER(pv.specialization) LIKE %:search% OR LOWER(pv.degreeInstitution) LIKE %:search%) " +
           "ORDER BY pv.verifiedAt DESC")
    Page<ProfessionalVerification> findApprovedByTypeAndSearch(@Param("type") com.mindcare.connect.entity.ProfessionalType type, 
                                                               @Param("search") String search, 
                                                               Pageable pageable);
}
