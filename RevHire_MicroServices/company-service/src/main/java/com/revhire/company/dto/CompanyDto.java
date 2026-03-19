package com.revhire.company.dto;

import com.revhire.company.entity.Company;
import lombok.Data;

public class CompanyDto {

    @Data public static class UpdateCompanyRequest {
        private String name;
        private String industry;
        private Company.CompanySize size;
        private String description;
        private String website;
        private String location;
        private Integer foundedYear;
    }

    @Data public static class CompanyResponse {
        private Long   id;
        private String name;
        private String industry;
        private Company.CompanySize size;
        private String  description;
        private String  website;
        private String  location;
        private Integer foundedYear;
        private long    totalJobs;
        private long    activeJobs;
        private long    totalApplications;
        private long    pendingApplications;
    }

    @Data public static class CreateCompanyRequest {
        private Long   userId;
        private String companyName;
        private String industry;
        private String companySize;
        private String companyDescription;
        private String website;
        private String location;
    }
}
