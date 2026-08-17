package com.grod.platform;

import com.grod.platform.dto.DocumentTechniqueRequestDTO;
import com.grod.platform.dto.ProduitRequestDTO;
import com.grod.platform.entity.DocumentTechnique;
import com.grod.platform.entity.Produit;
import com.grod.platform.repository.DocumentTechniqueRepository;
import com.grod.platform.repository.ProduitRepository;
import com.grod.platform.service.DocumentTechniqueService;
import com.grod.platform.service.ProduitServiceImpl;
import com.grod.platform.service.StoredFileService;
import org.junit.jupiter.api.Test;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

class ManagedBusinessFileLifecycleTests {

    @Test
    void remplacementImageSupprimeAncienneImageApresSauvegarde() {
        ProduitRepository repository = mock(ProduitRepository.class);
        StoredFileService storage = mock(StoredFileService.class);
        Produit product = Produit.builder().id(1L).nom("Copper").imageUrl("/uploads/products/old.png").build();
        when(repository.findById(1L)).thenReturn(Optional.of(product));
        when(repository.save(product)).thenReturn(product);
        new ProduitServiceImpl(repository, storage).modifierProduit(1L, productRequest("/uploads/products/new.png"));
        var order = inOrder(repository, storage);
        order.verify(repository).save(product);
        order.verify(storage).deleteManagedFile("/uploads/products/old.png", "products");
    }

    @Test
    void echecProduitConserveAncienneImage() {
        ProduitRepository repository = mock(ProduitRepository.class);
        StoredFileService storage = mock(StoredFileService.class);
        Produit product = Produit.builder().id(1L).nom("Copper").imageUrl("/uploads/products/old.png").build();
        when(repository.findById(1L)).thenReturn(Optional.of(product));
        when(repository.save(product)).thenThrow(new IllegalStateException("db"));
        assertThatThrownBy(() -> new ProduitServiceImpl(repository, storage).modifierProduit(1L, productRequest("/uploads/products/new.png")))
                .isInstanceOf(IllegalStateException.class);
        verify(storage, never()).deleteManagedFile(any(), any());
    }

    @Test
    void remplacementDocumentSupprimeAncienFichierApresSauvegarde() {
        DocumentTechniqueRepository repository = mock(DocumentTechniqueRepository.class);
        StoredFileService storage = mock(StoredFileService.class);
        DocumentTechnique document = DocumentTechnique.builder().id(2L).titre("Fiche").fichierUrl("/uploads/documents/old.pdf").build();
        when(repository.findById(2L)).thenReturn(Optional.of(document));
        when(repository.save(document)).thenReturn(document);
        new DocumentTechniqueService(repository, storage).modifier(2L, documentRequest("/uploads/documents/new.pdf"));
        var order = inOrder(repository, storage);
        order.verify(repository).save(document);
        order.verify(storage).deleteManagedFile("/uploads/documents/old.pdf", "documents");
    }

    @Test
    void suppressionDocumentNettoieSeulementViaStockageCentral() {
        DocumentTechniqueRepository repository = mock(DocumentTechniqueRepository.class);
        StoredFileService storage = mock(StoredFileService.class);
        DocumentTechnique document = DocumentTechnique.builder().id(2L).fichierUrl("https://cdn.example.test/file.pdf").build();
        when(repository.findById(2L)).thenReturn(Optional.of(document));
        new DocumentTechniqueService(repository, storage).supprimer(2L);
        var order = inOrder(repository, storage);
        order.verify(repository).delete(document);
        order.verify(storage).deleteManagedFile("https://cdn.example.test/file.pdf", "documents");
    }

    private ProduitRequestDTO productRequest(String url) {
        return ProduitRequestDTO.builder().nom("Copper").imageUrl(url).actif(true).build();
    }

    private DocumentTechniqueRequestDTO documentRequest(String url) {
        return DocumentTechniqueRequestDTO.builder().titre("Fiche").typeDocument("PDF").fichierUrl(url)
                .fichierNom("fiche.pdf").actif(true).build();
    }
}
