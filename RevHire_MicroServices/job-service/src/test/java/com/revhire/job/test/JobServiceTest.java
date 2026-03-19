package com.revhire.job.test;

import com.revhire.job.entity.Job;
import com.revhire.job.exception.AppException;
import com.revhire.job.repository.JobRepository;
import com.revhire.job.service.JobService;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.web.client.RestTemplate;
import java.util.Optional;
import static org.junit.Assert.*;
import static org.mockito.Mockito.*;

@RunWith(MockitoJUnitRunner.class)
public class JobServiceTest {
    @Mock private JobRepository jobRepository;
    @Mock private RestTemplate restTemplate;
    @InjectMocks private JobService jobService;

    @Test
    public void testGetJobById_notFound_throwsException() {
        when(jobRepository.findById(99L)).thenReturn(Optional.empty());
        try { jobService.getJobById(99L, null); fail("Expected AppException"); }
        catch (AppException e) { assertEquals("Job not found", e.getMessage()); }
    }

    @Test
    public void testJobStatusEnum_validValues() {
        assertNotNull(Job.JobStatus.valueOf("ACTIVE"));
        assertNotNull(Job.JobStatus.valueOf("CLOSED"));
        assertNotNull(Job.JobStatus.valueOf("FILLED"));
        assertNotNull(Job.JobStatus.valueOf("DRAFT"));
    }

    @Test
    public void testJobTypeEnum_validValues() {
        assertNotNull(Job.JobType.valueOf("FULL_TIME"));
        assertNotNull(Job.JobType.valueOf("PART_TIME"));
        assertNotNull(Job.JobType.valueOf("CONTRACT"));
        assertNotNull(Job.JobType.valueOf("INTERNSHIP"));
    }

    @Test
    public void testMapJobToResponse_correctFields() {
        Job job = new Job();
        job.setId(1L); job.setTitle("Software Engineer");
        job.setStatus(Job.JobStatus.ACTIVE); job.setCompanyName("TechCorp");
        var r = jobService.mapJobToResponse(job, false, false);
        assertEquals("Software Engineer", r.getTitle());
        assertEquals(Job.JobStatus.ACTIVE, r.getStatus());
        assertEquals("TechCorp", r.getCompanyName());
        assertFalse(r.isAlreadyApplied()); assertFalse(r.isSaved());
    }
}
