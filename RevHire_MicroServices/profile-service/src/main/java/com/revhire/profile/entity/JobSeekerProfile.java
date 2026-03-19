package com.revhire.profile.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity @Table(name = "job_seeker_profiles")
@Data @NoArgsConstructor @AllArgsConstructor
public class JobSeekerProfile {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false, unique = true)
    private Long userId;

    private String name;
    private String email;
    private String phone;
    private String location;
    private String employmentStatus;

    @Column(columnDefinition = "TEXT") private String objective;
    @Column(columnDefinition = "TEXT") private String education;
    @Column(columnDefinition = "TEXT") private String experience;
    @Column(columnDefinition = "TEXT") private String skills;
    @Column(columnDefinition = "TEXT") private String projects;
    @Column(columnDefinition = "TEXT") private String certifications;

    private String  resumeFileName;
    private String  resumeFilePath;
    private String  resumeContentType;
    private Integer totalExperienceYears;
    private String  currentJobTitle;
    private String  linkedinUrl;
    private String  portfolioUrl;

    @Column(name = "updated_at") private LocalDateTime updatedAt;

    @PrePersist @PreUpdate
    protected void onUpdate() { updatedAt = LocalDateTime.now(); }
}
