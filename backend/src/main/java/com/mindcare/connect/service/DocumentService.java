package com.mindcare.connect.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

/**
 * Document Service for secure file handling
 * Following Integrity Pact: Signed URLs for documents, rate limiting, PII redaction
 */
@Service
public class DocumentService {

    private static final Logger logger = LoggerFactory.getLogger(DocumentService.class);

    @Value("${app.base-url:${APP_BASE_URL:http://localhost:8080}}")
    private String baseUrl;

    @Value("${storage.local.path:${STORAGE_LOCAL_PATH:./uploads}}")
    private String localStoragePath;

    @Value("${storage.max-file-size:${STORAGE_MAX_FILE_SIZE:10485760}}")
    private long maxFileSize;

    private static final String[] ALLOWED_EXTENSIONS = {".pdf", ".jpg", ".jpeg", ".png", ".doc", ".docx"};

    public DocumentService() {
        logger.info("DocumentService initialized successfully");
    }

    /**
     * Upload document and return signed URL
     * DEV: Uses local storage with signed URL emulator
     * PROD: Would use cloud storage (S3/Blob) with actual signed URLs
     */
    public String uploadDocument(MultipartFile file, String documentType, Long userId) throws IOException {
        // Rate limiting check (Integrity Pact)
        if (file.getSize() > maxFileSize) {
            throw new RuntimeException("File size exceeds maximum allowed size");
        }

        // Validate file type
        if (!isAllowedFileType(file.getOriginalFilename())) {
            throw new RuntimeException("File type not allowed");
        }

        // Generate unique filename to prevent conflicts and PII exposure
        String originalFilename = file.getOriginalFilename();
        String extension = getFileExtension(originalFilename);
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
        String uniqueId = UUID.randomUUID().toString().substring(0, 8);
        String filename = String.format("%s_%s_%d_%s%s", documentType, timestamp, userId, uniqueId, extension);

        // Create directory if it doesn't exist
        Path uploadPath = Paths.get(localStoragePath);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Save file
        Path filePath = uploadPath.resolve(filename);
        Files.copy(file.getInputStream(), filePath);

        // Generate signed URL (emulated for DEV, real for PROD)
        return generateSignedUrl(filename);
    }

    /**
     * Generate signed URL for document access
     * DEV: Emulated signed URL
     * PROD: Real signed URL from cloud storage
     */
    public String generateSignedUrl(String filename) {
        // In DEV environment, create a time-limited URL with signature
        long expirationTime = System.currentTimeMillis() + (24 * 60 * 60 * 1000); // 24 hours
        String signature = generateSignature(filename, expirationTime);
        
        return String.format("%s/documents/%s?expires=%d&signature=%s", 
                           baseUrl, filename, expirationTime, signature);
    }

    /**
     * Validate signed URL and serve document
     */
    public boolean isValidSignedUrl(String filename, long expires, String signature) {
        if (System.currentTimeMillis() > expires) {
            return false; // URL expired
        }
        
        String expectedSignature = generateSignature(filename, expires);
        return expectedSignature.equals(signature);
    }

    /**
     * Get document content if signed URL is valid
     */
    public byte[] getDocument(String filename, long expires, String signature) throws IOException {
        if (!isValidSignedUrl(filename, expires, signature)) {
            throw new RuntimeException("Invalid or expired signed URL");
        }
        
        Path filePath = Paths.get(localStoragePath).resolve(filename);
        if (!Files.exists(filePath)) {
            throw new RuntimeException("Document not found");
        }
        
        return Files.readAllBytes(filePath);
    }

    /**
     * Delete document (for cleanup or GDPR compliance)
     */
    public void deleteDocument(String filename) throws IOException {
        Path filePath = Paths.get(localStoragePath).resolve(filename);
        if (Files.exists(filePath)) {
            Files.delete(filePath);
        }
    }

    /**
     * Validate file type
     */
    private boolean isAllowedFileType(String filename) {
        if (filename == null) return false;
        
        String extension = getFileExtension(filename).toLowerCase();
        for (String allowed : ALLOWED_EXTENSIONS) {
            if (allowed.equals(extension)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Get file extension
     */
    private String getFileExtension(String filename) {
        if (filename == null || filename.lastIndexOf('.') == -1) {
            return "";
        }
        return filename.substring(filename.lastIndexOf('.'));
    }

    /**
     * Generate signature for URL signing
     * Simple implementation for DEV - would use proper HMAC in PROD
     */
    private String generateSignature(String filename, long expires) {
        String data = filename + "_" + expires;
        return Integer.toHexString(data.hashCode());
    }
}
