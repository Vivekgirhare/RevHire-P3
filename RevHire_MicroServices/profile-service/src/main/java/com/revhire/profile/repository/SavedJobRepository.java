package com.revhire.profile.repository;

import com.revhire.profile.entity.SavedJob;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface SavedJobRepository extends JpaRepository<SavedJob, Long> {
    List<SavedJob>     findByUserId(Long userId);
    boolean            existsByUserIdAndJobId(Long userId, Long jobId);
    Optional<SavedJob> findByUserIdAndJobId(Long userId, Long jobId);
    void               deleteByUserIdAndJobId(Long userId, Long jobId);
}
