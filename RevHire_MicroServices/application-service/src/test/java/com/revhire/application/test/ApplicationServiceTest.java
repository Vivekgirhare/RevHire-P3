package com.revhire.application.test;

import com.revhire.application.entity.Application;
import com.revhire.application.exception.AppException;
import com.revhire.application.repository.ApplicationRepository;
import com.revhire.application.service.ApplicationService;
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
public class ApplicationServiceTest {

    @Mock private ApplicationRepository applicationRepository;
    @Mock private RestTemplate restTemplate;
    @InjectMocks private ApplicationService applicationService;

    @Test
    public void testCheckApplied_true() {
        when(applicationRepository.existsByJobIdAndJobSeekerUserId(1L, 2L)).thenReturn(true);
        assertTrue(applicationService.checkApplied(2L, 1L));
    }

    @Test
    public void testCheckApplied_false() {
        when(applicationRepository.existsByJobIdAndJobSeekerUserId(1L, 2L)).thenReturn(false);
        assertFalse(applicationService.checkApplied(2L, 1L));
    }

    @Test
    public void testWithdraw_notFound_throwsException() {
        when(applicationRepository.findById(99L)).thenReturn(Optional.empty());
        try { applicationService.withdraw(1L, 99L, "reason"); fail(); }
        catch (AppException e) { assertEquals("Application not found", e.getMessage()); }
    }

    @Test
    public void testApplicationStatusEnum_validValues() {
        assertNotNull(Application.ApplicationStatus.valueOf("APPLIED"));
        assertNotNull(Application.ApplicationStatus.valueOf("SHORTLISTED"));
        assertNotNull(Application.ApplicationStatus.valueOf("REJECTED"));
        assertNotNull(Application.ApplicationStatus.valueOf("WITHDRAWN"));
    }
}
