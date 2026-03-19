package com.revhire.auth.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data @NoArgsConstructor @AllArgsConstructor
public class User {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false) @NotBlank
    private String name;

    @Column(unique = true, nullable = false) @Email
    private String email;

    @Column(nullable = false)
    private String password;

    private String phone;
    private String location;

    @Enumerated(EnumType.STRING) @Column(nullable = false)
    private UserRole role;

    @Enumerated(EnumType.STRING)
    private EmploymentStatus employmentStatus;

    @Column(name = "created_at") private LocalDateTime createdAt;
    @Column(name = "updated_at") private LocalDateTime updatedAt;
    private boolean active = true;

    @PrePersist protected void onCreate() { createdAt = LocalDateTime.now(); updatedAt = LocalDateTime.now(); }
    @PreUpdate  protected void onUpdate() { updatedAt = LocalDateTime.now(); }

    public enum UserRole { JOB_SEEKER, EMPLOYER }
    public enum EmploymentStatus { EMPLOYED, UNEMPLOYED, STUDENT, FREELANCER }
}
