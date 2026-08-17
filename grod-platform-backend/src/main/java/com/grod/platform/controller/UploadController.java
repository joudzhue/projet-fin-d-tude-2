package com.grod.platform.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.grod.platform.service.StoredFileService;
import lombok.RequiredArgsConstructor;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.Arrays;
import java.nio.charset.StandardCharsets;

@RestController
@RequestMapping("/api/uploads")
@Tag(name = "Uploads", description = "Upload des fichiers produits et devis")
@RequiredArgsConstructor
public class UploadController {
    private static final long MAX_IMAGE_SIZE = 5L * 1024 * 1024;
    private static final long MAX_QUOTE_SIZE = 10L * 1024 * 1024;
    private static final long MAX_PDF_SIZE = 10L * 1024 * 1024;

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
            "application/dxf",
            "image/vnd.dxf",
            "image/vnd.dwg"
    );

    @Value("${app.upload-dir:uploads}")
    private String uploadDir;
    private final StoredFileService storedFileService;

    @PostMapping("/images")
    @Operation(summary = "Uploader une image produit", description = "Enregistre une image et retourne son URL publique")
    public Map<String, String> uploadProductImage(
            @RequestParam("file") MultipartFile file,
            HttpServletRequest request
    ) throws Exception {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Le fichier image est obligatoire");
        }
        requireMaxSize(file, MAX_IMAGE_SIZE);

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_IMAGE_CONTENT_TYPES.contains(contentType)) {
            throw new IllegalArgumentException("Format image non supporte");
        }

        String extension = detectImageExtension(file);
        String filename = UUID.randomUUID() + extension;
        Path productUploadDir = Path.of(uploadDir, "products").toAbsolutePath().normalize();
        Files.createDirectories(productUploadDir);

        Path targetPath = productUploadDir.resolve(filename).normalize();
        file.transferTo(targetPath);

        String imageUrl = "/uploads/products/" + filename;

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
        requireMaxSize(file, MAX_QUOTE_SIZE);

        String contentType = file.getContentType();
        if (contentType == null || !isAllowedQuoteDocument(file.getOriginalFilename(), contentType)) {
            throw new IllegalArgumentException("Format document non supporte");
        }

        String originalName = StringUtils.cleanPath(file.getOriginalFilename() == null ? "document" : file.getOriginalFilename());
        String extension = detectQuoteExtension(file, originalName);
        String documentUrl = storedFileService.storeTemporaryQuote(file, extension);

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
        requireMaxSize(file, MAX_PDF_SIZE);

        String originalName = StringUtils.cleanPath(
                file.getOriginalFilename() == null ? "document.pdf" : file.getOriginalFilename()
        );
        String extension = StringUtils.getFilenameExtension(originalName);
        if (!"application/pdf".equals(file.getContentType())
                && (extension == null || !"pdf".equalsIgnoreCase(extension))) {
            throw new IllegalArgumentException("Seuls les fichiers PDF sont acceptes");
        }
        if (!hasPrefix(file, "%PDF".getBytes(StandardCharsets.US_ASCII))) {
            throw new IllegalArgumentException("Le contenu du fichier PDF est invalide");
        }

        String filename = UUID.randomUUID() + ".pdf";
        Path documentUploadDir = Path.of(uploadDir, "documents").toAbsolutePath().normalize();
        Files.createDirectories(documentUploadDir);
        file.transferTo(documentUploadDir.resolve(filename).normalize());

        String documentUrl = "/uploads/documents/" + filename;

        return Map.of(
                "documentUrl", documentUrl,
                "originalName", originalName
        );
    }

    private boolean isAllowedQuoteDocument(String originalFilename, String contentType) {
        String extension = StringUtils.getFilenameExtension(originalFilename);
        boolean allowedExtension = extension != null && Set.of("pdf", "jpg", "jpeg", "png", "webp", "gif", "dwg", "dxf")
                .contains(extension.toLowerCase());

        return ALLOWED_QUOTE_DOCUMENT_CONTENT_TYPES.contains(contentType) && allowedExtension;
    }

    private void requireMaxSize(MultipartFile file, long maxSize) {
        if (file.getSize() > maxSize) throw new IllegalArgumentException("Fichier trop volumineux");
        String name = file.getOriginalFilename();
        if (name != null && (name.contains("..") || name.contains("/") || name.contains("\\")))
            throw new IllegalArgumentException("Nom de fichier invalide");
    }

    private String detectImageExtension(MultipartFile file) throws Exception {
        byte[] bytes = file.getBytes();
        if (startsWith(bytes, new byte[]{(byte)0xFF,(byte)0xD8,(byte)0xFF})) return ".jpg";
        if (startsWith(bytes, new byte[]{(byte)0x89,0x50,0x4E,0x47,0x0D,0x0A,0x1A,0x0A})) return ".png";
        if (startsWith(bytes, "GIF8".getBytes(StandardCharsets.US_ASCII))) return ".gif";
        if (bytes.length >= 12 && startsWith(bytes, "RIFF".getBytes(StandardCharsets.US_ASCII))
                && Arrays.equals(Arrays.copyOfRange(bytes, 8, 12), "WEBP".getBytes(StandardCharsets.US_ASCII))) return ".webp";
        throw new IllegalArgumentException("Contenu image invalide");
    }

    private String detectQuoteExtension(MultipartFile file, String originalName) throws Exception {
        String extension = StringUtils.getFilenameExtension(originalName);
        String normalized = extension == null ? "" : extension.toLowerCase();
        if ("pdf".equals(normalized)) {
            if (!hasPrefix(file, "%PDF".getBytes(StandardCharsets.US_ASCII))) throw new IllegalArgumentException("Contenu PDF invalide");
            return ".pdf";
        }
        if (Set.of("jpg","jpeg","png","webp","gif").contains(normalized)) return detectImageExtension(file);
        byte[] prefix = Arrays.copyOf(file.getBytes(), (int)Math.min(file.getSize(), 64));
        String ascii = new String(prefix, StandardCharsets.US_ASCII).trim();
        if ("dwg".equals(normalized) && ascii.startsWith("AC10")) return ".dwg";
        if ("dxf".equals(normalized) && ascii.contains("SECTION")) return ".dxf";
        throw new IllegalArgumentException("Contenu document invalide");
    }

    private boolean hasPrefix(MultipartFile file, byte[] signature) throws Exception {
        return startsWith(file.getBytes(), signature);
    }

    private boolean startsWith(byte[] bytes, byte[] prefix) {
        if (bytes.length < prefix.length) return false;
        for (int i=0;i<prefix.length;i++) if (bytes[i] != prefix[i]) return false;
        return true;
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
