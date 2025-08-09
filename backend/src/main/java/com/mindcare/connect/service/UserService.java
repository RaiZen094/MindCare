package com.mindcare.connect.service;

import com.mindcare.connect.dto.AuthResponse;
import com.mindcare.connect.dto.LoginRequest;
import com.mindcare.connect.dto.RegisterRequest;
import com.mindcare.connect.entity.Role;
import com.mindcare.connect.entity.User;
import com.mindcare.connect.entity.UserStatus;
import com.mindcare.connect.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

@Service
@Transactional
public class UserService implements UserDetailsService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    
    @Value("${security.max-login-attempts}")
    private int maxLoginAttempts;
    
    public UserService(UserRepository userRepository, 
                      PasswordEncoder passwordEncoder,
                      JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }
    
    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
        
        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())
                .password(user.getPassword())
                .authorities(user.getRoles().stream()
                        .map(role -> "ROLE_" + role.name())
                        .toArray(String[]::new))
                .disabled(user.getStatus() != UserStatus.ACTIVE)
                .build();
    }
    
    public AuthResponse registerUser(RegisterRequest request) {
        try {
            // Validate request
            if (!request.isPasswordsMatch()) {
                return AuthResponse.error("Passwords do not match");
            }
            
            if (!request.isTermsAgreed()) {
                return AuthResponse.error("You must agree to the terms and conditions");
            }
            
            // Check if user already exists
            if (userRepository.existsByEmail(request.getEmail())) {
                return AuthResponse.error("Email address is already registered");
            }
            
            if (request.getPhone() != null && userRepository.existsByPhone(request.getPhone())) {
                return AuthResponse.error("Phone number is already registered");
            }
            
            // Create new user
            User user = new User(
                    request.getFirstName(),
                    request.getLastName(),
                    request.getEmail(),
                    passwordEncoder.encode(request.getPassword())
            );
            
            if (request.getPhone() != null) {
                user.setPhone(request.getPhone());
            }
            
            user.setStatus(UserStatus.PENDING_VERIFICATION);
            user = userRepository.save(user);
            
            // Generate JWT token
            Map<String, Object> claims = new HashMap<>();
            claims.put("userId", user.getId());
            claims.put("roles", user.getRoles());
            claims.put("status", user.getStatus());
            
            String token = jwtService.generateToken(user.getEmail(), claims);
            
            // Create user info for response
            AuthResponse.UserInfo userInfo = new AuthResponse.UserInfo(
                    user.getId(),
                    user.getFirstName(),
                    user.getLastName(),
                    user.getEmail(),
                    user.getPhone(),
                    user.getRoles(),
                    user.getStatus(),
                    user.getEmailVerified(),
                    user.getPhoneVerified(),
                    user.getLastLogin(),
                    user.getCreatedAt()
            );
            
            return AuthResponse.success(token, jwtService.getExpirationTime(), userInfo);
            
        } catch (Exception e) {
            return AuthResponse.error("Registration failed: " + e.getMessage());
        }
    }
    
    public AuthResponse authenticateUser(LoginRequest request) {
        try {
            Optional<User> userOpt = userRepository.findByEmail(request.getEmail());
            
            if (userOpt.isEmpty()) {
                return AuthResponse.error("Invalid email or password");
            }
            
            User user = userOpt.get();
            
            // Check if account is locked
            if (user.isAccountLocked()) {
                return AuthResponse.error("Account is temporarily locked due to multiple failed login attempts. Please try again later.");
            }
            
            // Check if account is active
            if (user.getStatus() != UserStatus.ACTIVE && user.getStatus() != UserStatus.PENDING_VERIFICATION) {
                return AuthResponse.error("Account is suspended or banned. Please contact support.");
            }
            
            try {
                // Verify password manually
                if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
                    throw new BadCredentialsException("Invalid password");
                }
                
                // Reset login attempts on successful authentication
                user.resetLoginAttempts();
                user.setLastLogin(LocalDateTime.now());
                userRepository.save(user);
                
                // Generate JWT token
                Map<String, Object> claims = new HashMap<>();
                claims.put("userId", user.getId());
                claims.put("roles", user.getRoles());
                claims.put("status", user.getStatus());
                
                String token = jwtService.generateToken(user.getEmail(), claims);
                
                // Create user info for response
                AuthResponse.UserInfo userInfo = new AuthResponse.UserInfo(
                        user.getId(),
                        user.getFirstName(),
                        user.getLastName(),
                        user.getEmail(),
                        user.getPhone(),
                        user.getRoles(),
                        user.getStatus(),
                        user.getEmailVerified(),
                        user.getPhoneVerified(),
                        user.getLastLogin(),
                        user.getCreatedAt()
                );
                
                return AuthResponse.success(token, jwtService.getExpirationTime(), userInfo);
                
            } catch (BadCredentialsException e) {
                // Increment login attempts
                user.incrementLoginAttempts();
                
                if (user.getLoginAttempts() >= maxLoginAttempts) {
                    user.lockAccount(30); // Lock for 30 minutes
                    userRepository.save(user);
                    return AuthResponse.error("Account locked due to multiple failed login attempts. Please try again in 30 minutes.");
                }
                
                userRepository.save(user);
                
                int remainingAttempts = maxLoginAttempts - user.getLoginAttempts();
                return AuthResponse.error("Invalid email or password. " + remainingAttempts + " attempts remaining.");
            }
            
        } catch (LockedException e) {
            return AuthResponse.error("Account is locked. Please contact support.");
        } catch (DisabledException e) {
            return AuthResponse.error("Account is disabled. Please contact support.");
        } catch (Exception e) {
            return AuthResponse.error("Authentication failed: " + e.getMessage());
        }
    }
    
    public User createAdminUser(String email, String password, String firstName, String lastName) {
        if (userRepository.existsByEmail(email)) {
            return userRepository.findByEmail(email).get();
        }
        
        User admin = new User(firstName, lastName, email, passwordEncoder.encode(password));
        admin.setRoles(Set.of(Role.ADMIN));
        admin.setStatus(UserStatus.ACTIVE);
        admin.setEmailVerified(true);
        
        return userRepository.save(admin);
    }
    
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }
    
    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }
    
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }
    
    public User updateUser(User user) {
        return userRepository.save(user);
    }
    
    public void unlockExpiredAccounts() {
        userRepository.unlockExpiredAccounts(LocalDateTime.now());
    }
}
