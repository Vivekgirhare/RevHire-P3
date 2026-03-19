package com.revhire.job.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity @Table(name = "jobs")
@Data @NoArgsConstructor @AllArgsConstructor
public class Job {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "company_id",       nullable = false) private Long   companyId;
    @Column(name = "employer_user_id", nullable = false) private Long   employerUserId;
    @Column(name = "company_name")                       private String companyName;
    @Column(name = "company_industry")                   private String companyIndustry;
    @Column(name = "company_location")                   private String companyLocation;

    @Column(nullable = false)             private String     title;
    @Column(columnDefinition = "TEXT", nullable = false) private String description;
    @Column(columnDefinition = "TEXT")    private String     requiredSkills;
    private String  requiredEducation;
    private Integer minExperienceYears;
    private Integer maxExperienceYears;
    private String  location;
    private Boolean isRemote = false;
    @Column(precision = 12, scale = 2)   private BigDecimal minSalary;
    @Column(precision = 12, scale = 2)   private BigDecimal maxSalary;

    @Enumerated(EnumType.STRING)          private JobType   jobType;
    @Enumerated(EnumType.STRING)          private JobStatus status = JobStatus.ACTIVE;
    private LocalDate applicationDeadline;
    private Integer   numberOfOpenings;

    @Column(name = "posted_at")  private LocalDateTime postedAt;
    @Column(name = "updated_at") private LocalDateTime updatedAt;

    @PrePersist protected void onCreate() { postedAt = LocalDateTime.now(); updatedAt = LocalDateTime.now(); }
    @PreUpdate  protected void onUpdate() { updatedAt = LocalDateTime.now(); }

    public enum JobType   { FULL_TIME, PART_TIME, CONTRACT, FREELANCE, INTERNSHIP }
    public enum JobStatus { ACTIVE, CLOSED, FILLED, DRAFT }
}
