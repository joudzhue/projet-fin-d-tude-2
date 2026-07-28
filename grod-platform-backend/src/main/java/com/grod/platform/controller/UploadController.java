package com.grod.platform.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@RestController
@RequestMapping("/api/uploads")
@CrossOrigin(origins = "*")
@Tag(name = "Uploads", description = "Upload des fichiers produits et devis")
public class UploadController {

    private static final Set<String> ALLOWED_IMAGE_CONTENT_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif"
    );

    private static final Set<String> ALLOWED_QUOTE_DOCUMENT_CONTENT_TYPES = Set.of(
            "application/pdf",
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif",
            "application/dwg",
            "application/acad",
            "image/vnd.dwg"
    );

    @Value("${app.upload-dir:uploads}")
    private String uploadDir;

    @PostMapping("/images")
    @Operation(summary = "Uploader une image produit", description = "Enregistre une image et retourne son URL publique")
    public Map<String, String> uploadProductImage(
            @RequestParam("file") MultipartFile file,
            HttpServletRequest request
    ) throws Exception {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Le fichier image est obligatoire");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_IMAGE_CONTENT_TYPES.contains(contentType)) {
            throw new IllegalArgumentException("Format image non supporte");
        }

        String extension = getExtension(file.getOriginalFilename(), contentType);
        String filename = UUID.randomUUID() + extension;
        Path productUploadDir = Path.of(uploadDir, "products").toAbsolutePath().normalize();
        Files.createDirectories(productUploadDir);

        Path targetPath = productUploadDir.resolve(filename).normalize();
        file.transferTo(targetPath);

        String imageUrl = request.getScheme() + "://" + request.getServerName() + ":" + request.getServerPort()
                + "/uploads/products/" + filename;

        return Map.of("imageUrl", imageUrl);
    }

    @PostMapping("/quote-documents")
    @Operation(summary = "Uploader un document de devis", description = "Enregistre un plan, PDF ou image et retourne son URL publique")
    public Map<String, String> uploadQuoteDocument(
            @RequestParam("file") MultipartFile file,
            HttpServletRequest request
    ) throws Exception {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Le fichier technique est obligatoire");
        }

        String contentType = file.getContentType();
        if (contentType == null || !isAllowedQuoteDocument(file.getOriginalFilename(), contentType)) {
            throw new IllegalArgumentException("Format document non supporte");
        }

        String originalName = StringUtils.cleanPath(file.getOriginalFilename() == null ? "document" : file.getOriginalFilename());
        String extension = getExtension(originalName, contentType);
        String filename = UUID.randomUUID() + extension;
        Path quoteUploadDir = Path.of(uploadDir, "quotes").toAbsolutePath().normalize();
        Files.createDirectories(quoteUploadDir);

        Path targetPath = quoteUploadDir.resolve(filename).normalize();
        file.transferTo(targetPath);

        String documentUrl = request.getScheme() + "://" + request.getServerName() + ":" + request.getServerPort()
                + "/uploads/quotes/" + filename;

        return Map.of(
                "documentUrl", documentUrl,
                "originalName", originalName
        );
    }

    @PostMapping("/technical-documents")
    @Operation(summary = "Uploader un PDF technique", description = "Enregistre un PDF de la bibliotheque documentaire")
    public Map<String, String> uploadTechnicalDocument(
            @RequestParam("file") MultipartFile file,
            HttpServletRequest request
    ) throws Exception {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Le fichier PDF est obligatoire");
        }

        String originalName = StringUtils.cleanPath(
                file.getOriginalFilename() == null ? "document.pdf" : file.getOriginalFilename()
        );
        String extension = StringUtils.getFilenameExtension(originalName);
        if (!"application/pdf".equals(file.getContentType())
                && (extension == null || !"pdf".equalsIgnoreCase(extension))) {
            throw new IllegalArgumentException("Seuls les fichiers PDF sont acceptes");
        }

        String filename = UUID.randomUUID() + ".pdf";
        Path documentUploadDir = Path.of(uploadDir, "documents").toAbsolutePath().normalize();
        Files.createDirectories(documentUploadDir);
        file.transferTo(documentUploadDir.resolve(filename).normalize());

        String documentUrl = request.getScheme() + "://" + request.getServerName() + ":" + request.getServerPort()
                + "/uploads/documents/" + filename;

        return Map.of(
                "documentUrl", documentUrl,
                "originalName", originalName
        );
    }

    private boolean isAllowedQuoteDocument(String originalFilename, String contentType) {
        String extension = StringUtils.getFilenameExtension(originalFilename);
        boolean allowedExtension = extension != null && Set.of("pdf", "jpg", "jpeg", "png", "webp", "gif", "dwg", "dxf")
                .contains(extension.toLowerCase());

        return ALLOWED_QUOTE_DOCUMENT_CONTENT_TYPES.contains(contentType) || allowedExtension;
    }

    private String getExtension(String originalFilename, String contentType) {
        String extension = StringUtils.getFilenameExtension(originalFilename);

        if (extension != null && !extension.isBlank()) {
            return "." + extension.toLowerCase();
        }

        return switch (contentType) {
            case "image/png" -> ".png";
            case "image/webp" -> ".webp";
            case "image/gif" -> ".gif";
            case "application/pdf" -> ".pdf";
            default -> ".jpg";
        };
    }
}
