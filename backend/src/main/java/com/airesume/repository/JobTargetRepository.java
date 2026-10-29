package com.airesume.repository;

import com.airesume.entity.JobTarget;
import com.airesume.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface JobTargetRepository extends JpaRepository<JobTarget, Long> {
    List<JobTarget> findByUserOrderByCreatedAtDesc(User user);
    Optional<JobTarget> findByIdAndUser(Long id, User user);
    Optional<JobTarget> findFirstByUserOrderByCreatedAtDesc(User user);
}
