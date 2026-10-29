package com.airesume.service;

import com.airesume.exception.DocumentParsingException;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xwpf.extractor.XWPFWordExtractor;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;

@Service
public class DocumentParserService {

    private static final Logger logger = LoggerFactory.getLogger(DocumentParserService.class);

    /**
     * Extracts text content from uploaded PDF or Word (.docx / .doc) documents.
     */
    public String extractText(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new DocumentParsingException("Uploaded file is empty or null");
        }

        String originalFilename = file.getOriginalFilename();
        String filenameLower = (originalFilename != null) ? originalFilename.toLowerCase() : "";

        try {
            if (filenameLower.endsWith(".pdf")) {
                return parsePdf(file.getBytes());
            } else if (filenameLower.endsWith(".docx")) {
                return parseDocx(file.getInputStream());
            } else if (filenameLower.endsWith(".txt")) {
                return parsePlainText(file.getInputStream());
            } else {
                // Fallback attempt based on content type or try PDF then DOCX
                String contentType = file.getContentType();
                if (contentType != null && contentType.contains("pdf")) {
                    return parsePdf(file.getBytes());
                } else if (contentType != null && (contentType.contains("word") || contentType.contains("officedocument"))) {
                    return parseDocx(file.getInputStream());
                } else {
                    throw new DocumentParsingException(
                            "Unsupported file type. Please upload a PDF (.pdf) or Word document (.docx).");
                }
            }
        } catch (DocumentParsingException ex) {
            throw ex;
        } catch (Exception ex) {
            logger.error("Failed to parse document: {}", originalFilename, ex);
            throw new DocumentParsingException("Failed to extract text from file " + originalFilename + ": " + ex.getMessage(), ex);
        }
    }

    private String parsePdf(byte[] pdfBytes) {
        try (PDDocument document = Loader.loadPDF(pdfBytes)) {
            if (document.isEncrypted()) {
                throw new DocumentParsingException("The PDF file is password protected and cannot be read.");
            }

            PDFTextStripper stripper = new PDFTextStripper();
            stripper.setSortByPosition(true);
            String text = stripper.getText(document);

            return sanitizeExtractedText(text);
        } catch (Exception ex) {
            throw new DocumentParsingException("Error parsing PDF file: " + ex.getMessage(), ex);
        }
    }

    private String parseDocx(InputStream inputStream) {
        try (XWPFDocument document = new XWPFDocument(inputStream);
             XWPFWordExtractor extractor = new XWPFWordExtractor(document)) {
            String text = extractor.getText();
            return sanitizeExtractedText(text);
        } catch (Exception ex) {
            throw new DocumentParsingException("Error parsing DOCX Word document: " + ex.getMessage(), ex);
        }
    }

    private String parsePlainText(InputStream inputStream) {
        try {
            byte[] bytes = inputStream.readAllBytes();
            return sanitizeExtractedText(new String(bytes, StandardCharsets.UTF_8));
        } catch (Exception ex) {
            throw new DocumentParsingException("Error reading text file: " + ex.getMessage(), ex);
        }
    }

    private String sanitizeExtractedText(String rawText) {
        if (rawText == null || rawText.trim().isEmpty()) {
            throw new DocumentParsingException("Extracted document content is empty or contains no readable text.");
        }
        // Normalize whitespace and remove non-printable null bytes
        String sanitized = rawText.replace("\u0000", "")
                .replaceAll("[\\r\\n]+", "\n")
                .trim();

        if (sanitized.length() < 30) {
            throw new DocumentParsingException("The document has insufficient readable content (less than 30 characters).");
        }

        return sanitized;
    }
}
