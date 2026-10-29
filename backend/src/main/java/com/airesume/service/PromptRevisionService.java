package com.airesume.service;

import com.airesume.dto.PromptRevisionDto;
import com.airesume.entity.PromptRevision;
import com.airesume.entity.RevisionStatus;
import com.airesume.entity.TargetType;
import com.airesume.entity.User;
import com.airesume.exception.ResourceNotFoundException;
import com.airesume.repository.PromptRevisionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PromptRevisionService {

    private final PromptRevisionRepository promptRevisionRepository;

    public PromptRevisionService(PromptRevisionRepository promptRevisionRepository) {
        this.promptRevisionRepository = promptRevisionRepository;
    }

    /**
     * Records a new prompt generation snapshot.
     */
    @Transactional
    public PromptRevision createRevision(User user, TargetType targetType, String promptText, String outputText, Long parentRevisionId) {
        List<PromptRevision> existing = promptRevisionRepository
                .findByUserAndTargetTypeOrderByRevisionNumberDesc(user, targetType);

        int nextRevisionNumber = existing.isEmpty() ? 1 : existing.get(0).getRevisionNumber() + 1;

        PromptRevision revision = new PromptRevision(
                user,
                targetType,
                promptText,
                outputText,
                nextRevisionNumber,
                parentRevisionId
        );

        return promptRevisionRepository.save(revision);
    }

    /**
     * Retrieves all active/historical revisions for a specific task.
     */
    @Transactional(readOnly = true)
    public List<PromptRevisionDto> getRevisions(User user, TargetType targetType) {
        return promptRevisionRepository.findByUserAndTargetTypeOrderByRevisionNumberDesc(user, targetType)
                .stream()
                .filter(r -> r.getStatus() != RevisionStatus.ERASED)
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Rolls back to a chosen previous revision, marking newer revisions as ROLLED_BACK.
     */
    @Transactional
    public PromptRevisionDto rollbackTo(User user, TargetType targetType, Long targetRevisionId) {
        PromptRevision targetRevision = promptRevisionRepository.findByIdAndUser(targetRevisionId, user)
                .orElseThrow(() -> new ResourceNotFoundException("Target revision not found with id: " + targetRevisionId));

        int targetRevNumber = targetRevision.getRevisionNumber();

        // Mark all subsequent revisions as ROLLED_BACK
        List<PromptRevision> subsequent = promptRevisionRepository
                .findByUserAndTargetTypeOrderByRevisionNumberDesc(user, targetType);

        for (PromptRevision rev : subsequent) {
            if (rev.getRevisionNumber() > targetRevNumber && rev.getStatus() == RevisionStatus.ACTIVE) {
                rev.setStatus(RevisionStatus.ROLLED_BACK);
                promptRevisionRepository.save(rev);
            } else if (rev.getId().equals(targetRevisionId)) {
                rev.setStatus(RevisionStatus.ACTIVE);
                promptRevisionRepository.save(rev);
            }
        }

        return toDto(targetRevision);
    }

    /**
     * Erases a prompt revision to fix bugs, hallucinations, or remove unwanted iterations.
     */
    @Transactional
    public void eraseRevision(User user, Long revisionId) {
        PromptRevision revision = promptRevisionRepository.findByIdAndUser(revisionId, user)
                .orElseThrow(() -> new ResourceNotFoundException("Revision not found with id: " + revisionId));

        revision.setStatus(RevisionStatus.ERASED);
        promptRevisionRepository.save(revision);
    }

    private PromptRevisionDto toDto(PromptRevision revision) {
        return new PromptRevisionDto(
                revision.getId(),
                revision.getTargetType(),
                revision.getPromptText(),
                revision.getOutputText(),
                revision.getRevisionNumber(),
                revision.getStatus(),
                revision.getParentRevisionId(),
                revision.getCreatedAt()
        );
    }
}
