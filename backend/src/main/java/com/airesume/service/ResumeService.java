package com.airesume.service;

import com.airesume.dto.ResumeUploadResponse;
import com.airesume.entity.MasterResume;
import com.airesume.entity.User;
import com.airesume.exception.BadRequestException;
import com.airesume.exception.ResourceNotFoundException;
import com.airesume.repository.MasterResumeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ResumeService {

    private final DocumentParserService documentParserService;
    private final MasterResumeRepository masterResumeRepository;

    public ResumeService(DocumentParserService documentParserService, MasterResumeRepository masterResumeRepository) {
        this.documentParserService = documentParserService;
        this.masterResumeRepository = masterResumeRepository;
    }

    @Transactional
    public ResumeUploadResponse uploadResume(User user, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Please select a valid PDF or Word (.docx) file to upload.");
        }

        String originalFilename = file.getOriginalFilename();
        String fileType = determineFileType(originalFilename);

        // Extract text via PDFBox / Apache POI
        String extractedText = documentParserService.extractText(file);

        MasterResume resume = new MasterResume(user, originalFilename, fileType, extractedText);
        MasterResume savedResume = masterResumeRepository.save(resume);

        String preview = extractedText.length() > 300 ? extractedText.substring(0, 300) + "..." : extractedText;

        return new ResumeUploadResponse(
                savedResume.getId(),
                savedResume.getOriginalFileName(),
                savedResume.getFileType(),
                extractedText.length(),
                preview,
                savedResume.getUploadedAt(),
                extractedText
        );
    }

    @Transactional(readOnly = true)
    public List<ResumeUploadResponse> getUserResumes(User user) {
        return masterResumeRepository.findByUserOrderByUploadedAtDesc(user)
                .stream()
                .map(r -> new ResumeUploadResponse(
                        r.getId(),
                        r.getOriginalFileName(),
                        r.getFileType(),
                        r.getExtractedText().length(),
                        r.getExtractedText().length() > 200 ? r.getExtractedText().substring(0, 200) + "..." : r.getExtractedText(),
                        r.getUploadedAt(),
                        r.getExtractedText()
                ))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ResumeUploadResponse getResumeDetails(User user, Long resumeId) {
        MasterResume r = getResumeEntity(user, resumeId);
        return new ResumeUploadResponse(
                r.getId(),
                r.getOriginalFileName(),
                r.getFileType(),
                r.getExtractedText().length(),
                r.getExtractedText().length() > 200 ? r.getExtractedText().substring(0, 200) + "..." : r.getExtractedText(),
                r.getUploadedAt(),
                r.getExtractedText()
        );
    }

    @Transactional(readOnly = true)
    public MasterResume getResumeEntity(User user, Long resumeId) {
        return masterResumeRepository.findByIdAndUser(resumeId, user)
                .orElseThrow(() -> new ResourceNotFoundException("Resume not found with id: " + resumeId));
    }

    @Transactional
    public void deleteResume(User user, Long resumeId) {
        MasterResume resume = masterResumeRepository.findByIdAndUser(resumeId, user)
                .orElseThrow(() -> new ResourceNotFoundException("Resume not found with id: " + resumeId));
        masterResumeRepository.delete(resume);
    }

    private String determineFileType(String filename) {
        if (filename == null) return "UNKNOWN";
        String lower = filename.toLowerCase();
        if (lower.endsWith(".pdf")) return "PDF";
        if (lower.endsWith(".docx")) return "DOCX";
        if (lower.endsWith(".txt")) return "TXT";
        return "UNKNOWN";
    }
}
