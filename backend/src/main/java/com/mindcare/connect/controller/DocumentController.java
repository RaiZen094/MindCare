package com.mindcare.connect.controller;

import com.mindcare.connect.service.DocumentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

/**
 * Document Controller for secure file handling
 * Following Integrity Pact: Signed URLs, rate limiting, secure access
 */
@RestController
@RequestMapping("/documents")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"}, allowCredentials = "true")
public class DocumentController {

    private final DocumentService documentService;

    @Autowired
    public DocumentController(DocumentService documentService) {
        this.documentService = documentService;
    }

    /**
     * Upload document for professional verification
     * Rate limited and secured following Integrity Pact
     */
    @PostMapping("/upload")
    @PreAuthorize("hasRole('PATIENT') or hasRole('PROFESSIONAL')")
    public ResponseEntity<?> uploadDocument(@RequestParam("file") MultipartFile file,
                                            @RequestParam("documentType") String documentType) {
        try {
            // For now, use a default user ID - can be enhanced later with JWT extraction
            Long userId = 1L; // Simplified for now

            // Validate document type
            if (!isValidDocumentType(documentType)) {
                return ResponseEntity.badRequest().body("Invalid document type");
            }

            // Upload document and get signed URL
            String signedUrl = documentService.uploadDocument(file, documentType, userId);
            
            // Create response with signed URL
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Document uploaded successfully");
            response.put("documentUrl", signedUrl);
            response.put("documentType", documentType);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Upload failed: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    /**
     * Serve document with signed URL validation
     * Following Integrity Pact: Secure document access
     */
    @GetMapping("/{filename}")
    public ResponseEntity<?> getDocument(@PathVariable String filename,
                                         @RequestParam("expires") long expires,
                                         @RequestParam("signature") String signature) {
        try {
            // Get document content with signature validation
            byte[] documentContent = documentService.getDocument(filename, expires, signature);
            
            // Determine content type
            String contentType = getContentType(filename);
            
            // Return document
            ByteArrayResource resource = new ByteArrayResource(documentContent);
            
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                    .contentLength(documentContent.length)
                    .body(resource);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to retrieve document: " + e.getMessage());
        }
    }

    /**
     * Generate new signed URL for existing document
     */
    @PostMapping("/{filename}/sign")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROFESSIONAL')")
    public ResponseEntity<?> generateSignedUrl(@PathVariable String filename) {
        try {
            String signedUrl = documentService.generateSignedUrl(filename);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("signedUrl", signedUrl);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to generate signed URL: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    /**
     * Delete document (admin only, for cleanup or GDPR compliance)
     */
    @DeleteMapping("/{filename}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteDocument(@PathVariable String filename) {
        try {
            documentService.deleteDocument(filename);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Document deleted successfully");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to delete document: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    /**
     * Validate document type for verification
     */
    private boolean isValidDocumentType(String documentType) {
        return documentType != null && (
            documentType.equals("license") ||
            documentType.equals("degree") ||
            documentType.equals("bmdc") ||
            documentType.equals("additional")
        );
    }

    /**
     * Get content type based on file extension
     */
    private String getContentType(String filename) {
        if (filename.toLowerCase().endsWith(".pdf")) {
            return "application/pdf";
        } else if (filename.toLowerCase().matches(".*\\.(jpg|jpeg)$")) {
            return "image/jpeg";
        } else if (filename.toLowerCase().endsWith(".png")) {
            return "image/png";
        } else if (filename.toLowerCase().matches(".*\\.(doc|docx)$")) {
            return "application/msword";
        }
        return "application/octet-stream";
    }
}
