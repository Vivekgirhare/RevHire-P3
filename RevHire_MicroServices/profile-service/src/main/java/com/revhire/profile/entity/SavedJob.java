package com.revhire.profile.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "saved_jobs", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "job_id"})
})
@Data @NoArgsConstructor @AllArgsConstructor
public class SavedJob {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false) private Long   userId;
    @Column(name = "job_id",  nullable = false) private Long   jobId;
    private String jobTitle;
    private String companyName;
    private String jobLocation;
    private String jobType;

    @Column(name = "saved_at") private LocalDateTime savedAt;

    @PrePersist protected void onCreate() { savedAt = LocalDateTime.now(); }
}
