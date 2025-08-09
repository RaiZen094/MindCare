package com.mindcare.connect.repository;

import com.mindcare.connect.entity.Role;
import com.mindcare.connect.entity.User;
import com.mindcare.connect.entity.UserStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    Optional<User> findByEmail(String email);
    
    Optional<User> findByPhone(String phone);
    
    boolean existsByEmail(String email);
    
    boolean existsByPhone(String phone);
    
    List<User> findByStatus(UserStatus status);
    
    @Query("SELECT u FROM User u JOIN u.roles r WHERE r = :role")
    List<User> findByRole(@Param("role") Role role);
    
    @Query("SELECT u FROM User u WHERE u.emailVerified = false AND u.createdAt < :cutoffTime")
    List<User> findUnverifiedUsersOlderThan(@Param("cutoffTime") LocalDateTime cutoffTime);
    
    @Query("SELECT u FROM User u WHERE u.lockedUntil IS NOT NULL AND u.lockedUntil < :now")
    List<User> findUsersToUnlock(@Param("now") LocalDateTime now);
    
    @Modifying
    @Query("UPDATE User u SET u.loginAttempts = 0, u.lockedUntil = NULL WHERE u.lockedUntil IS NOT NULL AND u.lockedUntil < :now")
    int unlockExpiredAccounts(@Param("now") LocalDateTime now);
    
    @Query("SELECT COUNT(u) FROM User u WHERE u.createdAt >= :startDate")
    long countNewUsersAfter(@Param("startDate") LocalDateTime startDate);
}
