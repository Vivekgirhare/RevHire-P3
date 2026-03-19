package com.revhire.auth.controller;

import com.revhire.auth.dto.AuthDto;
import com.revhire.auth.entity.User;
import com.revhire.auth.exception.AppException;
import com.revhire.auth.repository.UserRepository;
import com.revhire.auth.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Internal endpoints - called by other microservices ONLY, not exposed via API Gateway.
 */
@RestController
@RequestMapping("/api/auth/internal")
public class UserInternalController {
    @Autowired private UserRepository userRepository;
    @Autowired private AuthService authService;

    @GetMapping("/users/{userId}")
    public ResponseEntity<User> getUserById(@PathVariable Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException("User not found", 404));
        return ResponseEntity.ok(user);
    }

    @GetMapping("/users/email/{email}")
    public ResponseEntity<User> getUserByEmail(@PathVariable String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException("User not found", 404));
        return ResponseEntity.ok(user);
    }

    @PutMapping("/users/{userId}/basic")
    public ResponseEntity<Void> updateUserBasic(@PathVariable Long userId,
                                                 @RequestBody AuthDto.UpdateUserBasicRequest request) {
        authService.updateUserBasic(userId, request);
        return ResponseEntity.ok().build();
    }
}
