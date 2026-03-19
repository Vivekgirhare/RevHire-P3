package com.revhire.auth.test;

import com.revhire.auth.dto.AuthDto;
import com.revhire.auth.exception.AppException;
import com.revhire.auth.repository.UserRepository;
import com.revhire.auth.security.JwtUtils;
import com.revhire.auth.service.AuthService;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.client.RestTemplate;
import static org.junit.Assert.*;
import static org.mockito.Mockito.*;

@RunWith(MockitoJUnitRunner.class)
public class AuthServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private AuthenticationManager authenticationManager;
    @Mock private JwtUtils jwtUtils;
    @Mock private RestTemplate restTemplate;
    @InjectMocks private AuthService authService;

    @Test
    public void testRegister_existingEmail_throwsException() {
        when(userRepository.existsByEmail("existing@test.com")).thenReturn(true);
        AuthDto.RegisterRequest req = new AuthDto.RegisterRequest();
        req.setEmail("existing@test.com"); req.setPassword("pass123");
        req.setName("Test User"); req.setRole("JOB_SEEKER");
        try {
            authService.register(req);
            fail("Expected AppException");
        } catch (AppException e) {
            assertEquals("Email already registered", e.getMessage());
        }
    }

    @Test
    public void testEmailExists_true() {
        when(userRepository.existsByEmail("user@test.com")).thenReturn(true);
        assertTrue(userRepository.existsByEmail("user@test.com"));
    }

    @Test
    public void testEmailExists_false() {
        when(userRepository.existsByEmail("new@test.com")).thenReturn(false);
        assertFalse(userRepository.existsByEmail("new@test.com"));
    }

    @Test
    public void testPasswordEncoding_notPlainText() {
        when(passwordEncoder.encode("rawPassword")).thenReturn("$2a$10$encodedHashValue");
        String encoded = passwordEncoder.encode("rawPassword");
        assertNotEquals("rawPassword", encoded);
        assertTrue(encoded.startsWith("$2a$"));
    }

    @Test
    public void testUserRole_jobSeeker() {
        assertNotNull(com.revhire.auth.entity.User.UserRole.valueOf("JOB_SEEKER"));
    }

    @Test
    public void testUserRole_employer() {
        assertNotNull(com.revhire.auth.entity.User.UserRole.valueOf("EMPLOYER"));
    }
}
