package com.revhire.company.service;

import com.revhire.company.dto.CompanyDto;
import com.revhire.company.entity.Company;
import com.revhire.company.exception.AppException;
import com.revhire.company.feign.ApplicationServiceClient;
import com.revhire.company.feign.JobServiceClient;
import com.revhire.company.repository.CompanyRepository;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Service
public class CompanyService {

    private static final Logger logger = LoggerFactory.getLogger(CompanyService.class);

    @Autowired private CompanyRepository companyRepository;
    @Autowired private JobServiceClient jobServiceClient;
    @Autowired private ApplicationServiceClient applicationServiceClient;

    @Transactional
    public void createCompany(CompanyDto.CreateCompanyRequest req) {
        if (companyRepository.findByUserId(req.getUserId()).isPresent()) return;
        Company c = new Company();
        c.setUserId(req.getUserId());
        c.setName(req.getCompanyName() != null ? req.getCompanyName() : "My Company");
        c.setIndustry(req.getIndustry());
        c.setDescription(req.getCompanyDescription());
        c.setWebsite(req.getWebsite());
        c.setLocation(req.getLocation());
        if (req.getCompanySize() != null) {
            try   { c.setSize(Company.CompanySize.valueOf(req.getCompanySize())); }
            catch (Exception e) { c.setSize(Company.CompanySize.SMALL); }
        }
        companyRepository.save(c);
        logger.info("Company created for userId: {}", req.getUserId());
    }

    @org.springframework.transaction.annotation.Transactional
    public CompanyDto.CompanyResponse getCompany(Long userId) {
        // Lazily create company if it wasn't created during registration
        Company c = companyRepository.findByUserId(userId).orElseGet(() -> {
            logger.info("Company not found for userId={}, creating lazily", userId);
            Company newCompany = new Company();
            newCompany.setUserId(userId);
            newCompany.setName("My Company");
            return companyRepository.save(newCompany);
        });
        return mapToResponse(c);
    }

    @Transactional
    public CompanyDto.CompanyResponse updateCompany(Long userId, CompanyDto.UpdateCompanyRequest req) {
        Company c = companyRepository.findByUserId(userId)
                .orElseThrow(() -> new AppException("Company not found", 404));
        if (req.getName()        != null) c.setName(req.getName());
        if (req.getIndustry()    != null) c.setIndustry(req.getIndustry());
        if (req.getSize()        != null) c.setSize(req.getSize());
        if (req.getDescription() != null) c.setDescription(req.getDescription());
        if (req.getWebsite()     != null) c.setWebsite(req.getWebsite());
        if (req.getLocation()    != null) c.setLocation(req.getLocation());
        if (req.getFoundedYear() != null) c.setFoundedYear(req.getFoundedYear());
        c = companyRepository.save(c);
        logger.info("Company updated: {}", c.getName());
        return mapToResponse(c);
    }

    public Map<String, Object> getCompanyByUser(Long userId) {
        Company c = companyRepository.findByUserId(userId)
                .orElseThrow(() -> new AppException("Company not found", 404));
        Map<String, Object> m = new HashMap<>();
        m.put("id", c.getId()); m.put("name", c.getName());
        m.put("industry", c.getIndustry()); m.put("location", c.getLocation());
        return m;
    }

    @CircuitBreaker(name = "jobService", fallbackMethod = "mapToResponseFallback")
    private CompanyDto.CompanyResponse mapToResponse(Company c) {
        CompanyDto.CompanyResponse r = new CompanyDto.CompanyResponse();
        r.setId(c.getId()); r.setName(c.getName()); r.setIndustry(c.getIndustry());
        r.setSize(c.getSize()); r.setDescription(c.getDescription());
        r.setWebsite(c.getWebsite()); r.setLocation(c.getLocation()); r.setFoundedYear(c.getFoundedYear());
        try {
            Map<String, Object> stats = jobServiceClient.getJobStats(c.getId());
            if (stats != null) {
                r.setTotalJobs( ((Number) stats.getOrDefault("totalJobs",  0)).longValue());
                r.setActiveJobs(((Number) stats.getOrDefault("activeJobs", 0)).longValue());
            }
        } catch (Exception e) { logger.warn("Could not fetch job stats: {}", e.getMessage()); }
        try {
            Map<String, Object> stats = applicationServiceClient.getApplicationStats(c.getUserId());
            if (stats != null) {
                r.setTotalApplications(  ((Number) stats.getOrDefault("total",   0)).longValue());
                r.setPendingApplications(((Number) stats.getOrDefault("pending", 0)).longValue());
            }
        } catch (Exception e) { logger.warn("Could not fetch app stats: {}", e.getMessage()); }
        return r;
    }

    public CompanyDto.CompanyResponse mapToResponseFallback(Company c, Exception ex) {
        logger.warn("mapToResponse fallback for companyId={}: {}", c.getId(), ex.getMessage());
        CompanyDto.CompanyResponse r = new CompanyDto.CompanyResponse();
        r.setId(c.getId()); r.setName(c.getName()); r.setIndustry(c.getIndustry());
        r.setSize(c.getSize()); r.setDescription(c.getDescription());
        r.setWebsite(c.getWebsite()); r.setLocation(c.getLocation()); r.setFoundedYear(c.getFoundedYear());
        r.setTotalJobs(0L); r.setActiveJobs(0L);
        r.setTotalApplications(0L); r.setPendingApplications(0L);
        return r;
    }
}
