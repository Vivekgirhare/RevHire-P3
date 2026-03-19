package com.revhire.application.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "applications")
@Data @NoArgsConstructor @AllArgsConstructor
public class Application {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "job_id",           nullable = false) private Long   jobId;
    @Column(name = "job_seeker_user_id", nullable = false) private Long jobSeekerUserId;
    @Column(name = "job_title")                           private String jobTitle;
    @Column(name = "company_name")                        private String companyName;
    @Column(name = "company_location")                    private String companyLocation;
    @Column(name = "employer_user_id")                    private Long   employerUserId;

    @Column(columnDefinition = "TEXT")  private String coverLetter;

    @Enumerated(EnumType.STRING) @Column(nullable = false)
    private ApplicationStatus status = ApplicationStatus.APPLIED;

    @Column(columnDefinition = "TEXT") private String employerNote;
    @Column(columnDefinition = "TEXT") private String withdrawalReason;

    @Column(name = "applied_at")  private LocalDateTime appliedAt;
    @Column(name = "updated_at")  private LocalDateTime updatedAt;

    @PrePersist protected void onCreate() { appliedAt = LocalDateTime.now(); updatedAt = LocalDateTime.now(); }
    @PreUpdate  protected void onUpdate() { updatedAt = LocalDateTime.now(); }

    public enum ApplicationStatus { APPLIED, UNDER_REVIEW, SHORTLISTED, REJECTED, WITHDRAWN }
}
