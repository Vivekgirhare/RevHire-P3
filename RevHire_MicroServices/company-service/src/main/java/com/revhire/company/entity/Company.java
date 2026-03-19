package com.revhire.company.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity @Table(name = "companies")
@Data @NoArgsConstructor @AllArgsConstructor
public class Company {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false, unique = true)
    private Long userId;

    @Column(nullable = false) private String name;
    private String industry;

    @Enumerated(EnumType.STRING) private CompanySize size;

    @Column(columnDefinition = "TEXT") private String description;
    private String  website;
    private String  location;
    private String  logoUrl;
    @Column(name = "founded_year") private Integer foundedYear;

    @Column(name = "created_at") private LocalDateTime createdAt;
    @Column(name = "updated_at") private LocalDateTime updatedAt;

    @PrePersist protected void onCreate() { createdAt = LocalDateTime.now(); updatedAt = LocalDateTime.now(); }
    @PreUpdate  protected void onUpdate() { updatedAt = LocalDateTime.now(); }

    public enum CompanySize { STARTUP, SMALL, MEDIUM, LARGE, ENTERPRISE }
}
