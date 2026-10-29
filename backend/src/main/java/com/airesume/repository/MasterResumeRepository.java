package com.airesume.repository;

import com.airesume.entity.MasterResume;
import com.airesume.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MasterResumeRepository extends JpaRepository<MasterResume, Long> {
    List<MasterResume> findByUserOrderByUploadedAtDesc(User user);
    Optional<MasterResume> findByIdAndUser(Long id, User user);
    Optional<MasterResume> findFirstByUserOrderByUploadedAtDesc(User user);
}
