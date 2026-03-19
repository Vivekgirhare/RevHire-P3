package com.revhire.job.dto;

import com.revhire.job.entity.Job;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class JobDto {

    @Data
    public static class CreateJobRequest {
        private String title;
        private String description;
        private String requiredSkills;
        private String requiredEducation;
        private Integer minExperienceYears;
        private Integer maxExperienceYears;
        private String location;
        private Boolean isRemote = false;
        private BigDecimal minSalary;
        private BigDecimal maxSalary;
        private Job.JobType jobType;
        private LocalDate applicationDeadline;
        private Integer numberOfOpenings;
    }

    @Data
    public static class JobResponse {
        private Long id;
        private String title;
        private String description;
        private String requiredSkills;
        private String requiredEducation;
        private Integer minExperienceYears;
        private Integer maxExperienceYears;
        private String location;
        private Boolean isRemote;
        private BigDecimal minSalary;
        private BigDecimal maxSalary;
        private Job.JobType jobType;
        private Job.JobStatus status;
        private LocalDate applicationDeadline;
        private Integer numberOfOpenings;
        private LocalDateTime postedAt;
        private Long companyId;
        private String companyName;
        private String companyIndustry;
        private String companyLocation;
        private long applicationCount;
        private boolean alreadyApplied;
        private boolean saved;
    }

    @Data
    public static class JobSearchRequest {
        private String title;
        private String location;
        private String companyName;
        private Job.JobType jobType;
        private Integer maxExperience;
        private BigDecimal minSalary;
        private BigDecimal maxSalary;
    }
}
