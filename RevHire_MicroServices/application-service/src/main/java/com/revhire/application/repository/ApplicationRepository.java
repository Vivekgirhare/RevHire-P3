package com.revhire.application.repository;

import com.revhire.application.entity.Application;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface ApplicationRepository extends JpaRepository<Application, Long> {
    List<Application> findByJobSeekerUserId(Long jobSeekerUserId);
    List<Application> findByJobId(Long jobId);
    boolean existsByJobIdAndJobSeekerUserId(Long jobId, Long jobSeekerUserId);
    boolean existsByJobIdAndJobSeekerUserIdAndStatusNot(Long jobId, Long jobSeekerUserId, Application.ApplicationStatus status);

    @Query("SELECT COUNT(a) FROM Application a WHERE a.employerUserId = :empId")
    long countByEmployerUserId(@Param("empId") Long empId);

    @Query("SELECT COUNT(a) FROM Application a WHERE a.employerUserId = :empId AND a.status = 'APPLIED'")
    long countPendingByEmployerUserId(@Param("empId") Long empId);
}