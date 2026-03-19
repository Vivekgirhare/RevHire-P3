package com.revhire.profile.dto;
import lombok.Data;

public class ProfileDto {

    @Data public static class UpdateProfileRequest {
        private String  name;
        private String  phone;
        private String  location;
        private String  objective;
        private String  education;
        private String  experience;
        private String  skills;
        private String  projects;
        private String  certifications;
        private Integer totalExperienceYears;
        private String  currentJobTitle;
        private String  linkedinUrl;
        private String  portfolioUrl;
    }

    @Data public static class ProfileResponse {
        private Long    userId;
        private String  name;
        private String  email;
        private String  phone;
        private String  location;
        private String  employmentStatus;
        private Long    profileId;
        private String  objective;
        private String  education;
        private String  experience;
        private String  skills;
        private String  projects;
        private String  certifications;
        private Integer totalExperienceYears;
        private String  currentJobTitle;
        private String  linkedinUrl;
        private String  portfolioUrl;
        private String  resumeFileName;
    }

    @Data public static class CreateProfileRequest {
        private Long userId;
    }
}
