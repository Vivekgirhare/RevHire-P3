package com.revhire.job.repository;

import com.revhire.job.entity.Job;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface JobRepository extends JpaRepository<Job, Long> {
    List<Job> findByCompanyId(Long companyId);

    @Query("SELECT j FROM Job j WHERE j.status = 'ACTIVE' AND " +
           "(:title IS NULL OR LOWER(j.title) LIKE LOWER(CONCAT('%',:title,'%'))) AND " +
           "(:location IS NULL OR LOWER(j.location) LIKE LOWER(CONCAT('%',:location,'%'))) AND " +
           "(:jobType IS NULL OR j.jobType = :jobType) AND " +
           "(:minExp IS NULL OR j.minExperienceYears <= :minExp) AND " +
           "(:companyName IS NULL OR LOWER(j.companyName) LIKE LOWER(CONCAT('%',:companyName,'%')))")
    List<Job> searchJobs(@Param("title") String title, @Param("location") String location,
                         @Param("jobType") Job.JobType jobType, @Param("minExp") Integer minExp,
                         @Param("companyName") String companyName);

    long countByCompanyId(Long companyId);

    @Query("SELECT COUNT(j) FROM Job j WHERE j.companyId = :companyId AND j.status = 'ACTIVE'")
    long countActiveByCompanyId(@Param("companyId") Long companyId);
}