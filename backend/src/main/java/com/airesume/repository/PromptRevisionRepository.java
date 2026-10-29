package com.airesume.repository;

import com.airesume.entity.PromptRevision;
import com.airesume.entity.RevisionStatus;
import com.airesume.entity.TargetType;
import com.airesume.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PromptRevisionRepository extends JpaRepository<PromptRevision, Long> {
    List<PromptRevision> findByUserAndTargetTypeOrderByRevisionNumberDesc(User user, TargetType targetType);

    List<PromptRevision> findByUserAndTargetTypeAndStatusOrderByRevisionNumberDesc(
            User user, TargetType targetType, RevisionStatus status);

    Optional<PromptRevision> findFirstByUserAndTargetTypeAndStatusOrderByRevisionNumberDesc(
            User user, TargetType targetType, RevisionStatus status);

    Optional<PromptRevision> findByIdAndUser(Long id, User user);

    void deleteByIdAndUser(Long id, User user);
}
