package com.revhire.company.controller;

import com.revhire.company.dto.CompanyDto;
import com.revhire.company.service.CompanyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/company")
public class CompanyController {

    @Autowired private CompanyService companyService;

    @GetMapping
    public ResponseEntity<CompanyDto.CompanyResponse> getCompany(@RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(companyService.getCompany(Long.parseLong(userId)));
    }

    @PutMapping
    public ResponseEntity<CompanyDto.CompanyResponse> updateCompany(
            @RequestBody CompanyDto.UpdateCompanyRequest request,
            @RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(companyService.updateCompany(Long.parseLong(userId), request));
    }

    @GetMapping("/dashboard")
    public ResponseEntity<CompanyDto.CompanyResponse> getDashboard(@RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(companyService.getCompany(Long.parseLong(userId)));
    }

    // ── INTERNAL ───────────────────────────────────────────────────────────
    @PostMapping("/internal/create")
    public ResponseEntity<Void> createCompany(@RequestBody CompanyDto.CreateCompanyRequest request) {
        companyService.createCompany(request);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/internal/by-user/{userId}")
    public ResponseEntity<Map<String, Object>> getCompanyByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(companyService.getCompanyByUser(userId));
    }
}
