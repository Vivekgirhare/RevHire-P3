package com.revhire.auth.service;

import com.revhire.auth.dto.AuthDto;
import com.revhire.auth.entity.User;
import com.revhire.auth.exception.AppException;
import com.revhire.auth.feign.CompanyServiceClient;
import com.revhire.auth.feign.ProfileServiceClient;
import com.revhire.auth.repository.UserRepository;
import com.revhire.auth.security.JwtUtils;
import com.revhire.auth.security.UserDetailsImpl;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {
    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    @Autowired private UserRepository userRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private AuthenticationManager authenticationManager;
    @Autowired private JwtUtils jwtUtils;
    @Autowired private ProfileServiceClient profileServiceClient;
    @Autowired private CompanyServiceClient companyServiceClient;

    @Transactional
    public AuthDto.AuthResponse register(AuthDto.RegisterRequest request) {
        logger.info("Registering new user: {}", request.getEmail());

        if (userRepository.existsByEmail(request.getEmail()))
            throw new AppException("Email already registered");

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPhone(request.getPhone());
        user.setLocation(request.getLocation());
        user.setRole(User.UserRole.valueOf(request.getRole()));
        user.setEmploymentStatus(request.getEmploymentStatus());
        user.setActive(true);
        user = userRepository.save(user);

        // ── Downstream service calls are best-effort ──────────────────────
        // We do NOT roll back the whole registration if profile/company service
        // is temporarily unavailable (Eureka not yet synced, cold start, etc.)
        // The user is saved; profile/company can be lazily created on first access.
        if (user.getRole() == User.UserRole.JOB_SEEKER) {
            try {
                AuthDto.CreateProfileRequest req = new AuthDto.CreateProfileRequest();
                req.setUserId(user.getId());
                profileServiceClient.createProfile(req);
                logger.info("Profile created via Profile Service for userId: {}", user.getId());
            } catch (Exception e) {
                // Log but do NOT re-throw — registration still succeeds
                logger.warn("Profile service unavailable during registration for userId={}. " +
                        "Profile will be created on first access. Reason: {}", user.getId(), e.getMessage());
            }
        } else {
            try {
                AuthDto.CreateCompanyRequest req = new AuthDto.CreateCompanyRequest();
                req.setUserId(user.getId());
                req.setCompanyName(request.getCompanyName() != null ? request.getCompanyName() : user.getName() + "'s Company");
                req.setIndustry(request.getIndustry());
                req.setCompanySize(request.getCompanySize());
                req.setCompanyDescription(request.getCompanyDescription());
                req.setWebsite(request.getWebsite());
                req.setLocation(request.getLocation());
                companyServiceClient.createCompany(req);
                logger.info("Company created via Company Service for userId: {}", user.getId());
            } catch (Exception e) {
                // Log but do NOT re-throw — registration still succeeds
                logger.warn("Company service unavailable during registration for userId={}. " +
                        "Company will be created on first access. Reason: {}", user.getId(), e.getMessage());
            }
        }

        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));
        SecurityContextHolder.getContext().setAuthentication(auth);
        String token = jwtUtils.generateToken(auth);
        logger.info("Registration successful for: {}", request.getEmail());
        return new AuthDto.AuthResponse(token, user.getRole().name(), user.getId(), user.getName(), user.getEmail());
    }

    public AuthDto.AuthResponse login(AuthDto.LoginRequest request) {
        logger.info("Login attempt: {}", request.getEmail());
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));
        SecurityContextHolder.getContext().setAuthentication(auth);
        UserDetailsImpl ud = (UserDetailsImpl) auth.getPrincipal();
        String token = jwtUtils.generateToken(auth);
        logger.info("Login successful: {}", request.getEmail());
        return new AuthDto.AuthResponse(token, ud.getRole().name(), ud.getId(), ud.getName(), ud.getUsername());
    }

    @Transactional
    public void updateUserBasic(Long userId, AuthDto.UpdateUserBasicRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException("User not found", 404));
        if (request.getName() != null && !request.getName().isBlank()) user.setName(request.getName());
        if (request.getPhone() != null && !request.getPhone().isBlank()) user.setPhone(request.getPhone());
        if (request.getLocation() != null && !request.getLocation().isBlank()) user.setLocation(request.getLocation());
        userRepository.save(user);
    }
}
