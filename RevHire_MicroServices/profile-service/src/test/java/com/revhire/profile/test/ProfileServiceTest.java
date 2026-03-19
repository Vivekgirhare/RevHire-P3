package com.revhire.profile.test;

import com.revhire.profile.dto.ProfileDto;
import com.revhire.profile.entity.JobSeekerProfile;
import com.revhire.profile.entity.SavedJob;
import com.revhire.profile.exception.AppException;
import com.revhire.profile.feign.AuthServiceClient;
import com.revhire.profile.repository.ProfileRepository;
import com.revhire.profile.repository.SavedJobRepository;
import com.revhire.profile.service.ProfileService;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.*;

import static org.junit.Assert.*;
import static org.mockito.Mockito.*;

@RunWith(MockitoJUnitRunner.class)
public class ProfileServiceTest {

    @Mock private ProfileRepository profileRepository;
    @Mock private SavedJobRepository savedJobRepository;
    @Mock private AuthServiceClient authServiceClient;
    @InjectMocks private ProfileService profileService;

    /**
     * Test that createProfile does not create duplicate profiles.
     */
    @Test
    public void testCreateProfile_alreadyExists_doesNothing() {
        when(profileRepository.findByUserId(1L)).thenReturn(Optional.of(new JobSeekerProfile()));
        profileService.createProfile(1L);
        verify(profileRepository, never()).save(any());
    }

    /**
     * Test successful profile creation with user data from auth service.
     */
    @Test
    public void testCreateProfile_newProfile_createsWithUserData() {
        when(profileRepository.findByUserId(1L)).thenReturn(Optional.empty());
        Map<String, Object> userData = new HashMap<>();
        userData.put("name", "John Doe");
        userData.put("email", "john@example.com");
        userData.put("phone", "1234567890");
        userData.put("location", "NYC");
        when(authServiceClient.getUserById(1L)).thenReturn(userData);

        profileService.createProfile(1L);

        verify(profileRepository).save(argThat(profile -> {
            assertEquals(Long.valueOf(1L), profile.getUserId());
            assertEquals("John Doe", profile.getName());
            assertEquals("john@example.com", profile.getEmail());
            assertEquals("1234567890", profile.getPhone());
            assertEquals("NYC", profile.getLocation());
            return true;
        }));
    }

    /**
     * Test retrieving existing profile and mapping to response.
     */
    @Test
    public void testGetProfile_existing_returnsMappedResponse() {
        JobSeekerProfile profile = new JobSeekerProfile();
        profile.setUserId(1L);
        profile.setName("John");
        when(profileRepository.findByUserId(1L)).thenReturn(Optional.of(profile));

        ProfileDto.ProfileResponse response = profileService.getProfile(1L);

        assertEquals(Long.valueOf(1L), response.getUserId());
        assertEquals("John", response.getName());
    }

    /**
     * Test lazy profile creation when profile not found.
     */
    @Test
    public void testGetProfile_notFound_createsLazily() {
        when(profileRepository.findByUserId(1L)).thenReturn(Optional.empty());
        when(profileRepository.save(any())).thenReturn(new JobSeekerProfile());

        profileService.getProfile(1L);

        verify(profileRepository).save(any(JobSeekerProfile.class));
    }

    /**
     * Test exception when updating non-existent profile.
     */
    @Test
    public void testUpdateProfile_profileNotFound_throwsException() {
        when(profileRepository.findByUserId(1L)).thenReturn(Optional.empty());

        try {
            profileService.updateProfile(1L, new ProfileDto.UpdateProfileRequest());
            fail("Expected AppException");
        } catch (AppException e) {
            assertEquals("Profile not found", e.getMessage());
        }
    }

    /**
     * Test successful profile update with field changes.
     */
    @Test
    public void testUpdateProfile_success_updatesFields() {
        JobSeekerProfile profile = new JobSeekerProfile();
        profile.setUserId(1L);
        when(profileRepository.findByUserId(1L)).thenReturn(Optional.of(profile));

        ProfileDto.UpdateProfileRequest req = new ProfileDto.UpdateProfileRequest();
        req.setName("Updated Name");
        req.setSkills("Java");

        profileService.updateProfile(1L, req);

        assertEquals("Updated Name", profile.getName());
        assertEquals("Java", profile.getSkills());
        verify(profileRepository).save(profile);
    }

    /**
     * Test file size validation for resume upload.
     */
    @Test
    public void testUploadResume_fileTooLarge_throwsException() throws IOException {
        MultipartFile file = mock(MultipartFile.class);
        when(file.getSize()).thenReturn(3L * 1024 * 1024); // 3MB

        try {
            profileService.uploadResume(1L, file);
            fail("Expected AppException");
        } catch (AppException e) {
            assertEquals("File size must not exceed 2MB", e.getMessage());
        }
    }

    /**
     * Test content type validation for resume upload.
     */
    @Test
    public void testUploadResume_invalidContentType_throwsException() throws IOException {
        MultipartFile file = mock(MultipartFile.class);
        when(file.getSize()).thenReturn(1024L);
        when(file.getContentType()).thenReturn("text/plain");

        try {
            profileService.uploadResume(1L, file);
            fail("Expected AppException");
        } catch (AppException e) {
            assertEquals("Only PDF and DOCX files are allowed", e.getMessage());
        }
    }

    /**
     * Test exception when saving already saved job.
     */
    @Test
    public void testSaveJob_alreadySaved_throwsException() {
        when(savedJobRepository.existsByUserIdAndJobId(1L, 2L)).thenReturn(true);

        try {
            profileService.saveJob(1L, 2L, "Title", "Company", "Location", "Type");
            fail("Expected AppException");
        } catch (AppException e) {
            assertEquals("Job already saved", e.getMessage());
        }
    }

    /**
     * Test successful job saving.
     */
    @Test
    public void testSaveJob_success_savesJob() {
        when(savedJobRepository.existsByUserIdAndJobId(1L, 2L)).thenReturn(false);

        profileService.saveJob(1L, 2L, "Title", "Company", "Location", "Type");

        verify(savedJobRepository).save(argThat(savedJob -> {
            assertEquals(Long.valueOf(1L), savedJob.getUserId());
            assertEquals(Long.valueOf(2L), savedJob.getJobId());
            assertEquals("Title", savedJob.getJobTitle());
            return true;
        }));
    }

    /**
     * Test job unsaving.
     */
    @Test
    public void testUnsaveJob_deletesJob() {
        profileService.unsaveJob(1L, 2L);
        verify(savedJobRepository).deleteByUserIdAndJobId(1L, 2L);
    }

    /**
     * Test retrieving saved jobs list.
     */
    @Test
    public void testGetSavedJobs_returnsMappedList() {
        SavedJob savedJob = new SavedJob();
        savedJob.setId(1L);
        savedJob.setJobId(2L);
        savedJob.setJobTitle("Title");
        savedJob.setCompanyName("Company");
        savedJob.setJobLocation("Location");
        savedJob.setJobType("Type");
        savedJob.setSavedAt(LocalDateTime.now());

        when(savedJobRepository.findByUserId(1L)).thenReturn(Arrays.asList(savedJob));

        List<Map<String, Object>> result = profileService.getSavedJobs(1L);

        assertEquals(1, result.size());
        Map<String, Object> map = result.get(0);
        assertEquals(1L, map.get("id"));
        assertEquals(2L, map.get("jobId"));
        assertEquals("Title", map.get("jobTitle"));
    }

    /**
     * Test checking if job is saved.
     */
    @Test
    public void testCheckSaved_returnsExistence() {
        when(savedJobRepository.existsByUserIdAndJobId(1L, 2L)).thenReturn(true);
        assertTrue(profileService.checkSaved(1L, 2L));

        when(savedJobRepository.existsByUserIdAndJobId(1L, 2L)).thenReturn(false);
        assertFalse(profileService.checkSaved(1L, 2L));
    }

    /**
     * Test internal profile data retrieval for existing profile.
     */
    @Test
    public void testGetProfileInternal_profileExists_returnsMap() {
        JobSeekerProfile profile = new JobSeekerProfile();
        profile.setUserId(1L);
        profile.setName("John");
        profile.setSkills("Java");
        when(profileRepository.findByUserId(1L)).thenReturn(Optional.of(profile));

        Map<String, Object> result = profileService.getProfileInternal(1L);

        assertEquals(1L, result.get("userId"));
        assertEquals("John", result.get("name"));
        assertEquals("Java", result.get("skills"));
    }

    /**
     * Test internal profile data retrieval when profile not found.
     */
    @Test
    public void testGetProfileInternal_profileNotFound_returnsEmptyMap() {
        when(profileRepository.findByUserId(1L)).thenReturn(Optional.empty());

        Map<String, Object> result = profileService.getProfileInternal(1L);

        assertTrue(result.isEmpty());
    }
}