package com.grod.platform;

import com.grod.platform.config.DataInitializer;
import com.grod.platform.entity.Produit;
import com.grod.platform.repository.ProduitRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
class DataInitializerIntegrationTests {

    @Autowired DataInitializer dataInitializer;
    @Autowired ProduitRepository produitRepository;

    @BeforeEach
    void viderCatalogue() {
        produitRepository.deleteAll();
    }

    @Test
    void creeLesProduitsSurBaseVideSansDoublonsAuSecondDemarrage() throws Exception {
        dataInitializer.run();
        long nombreInitial = produitRepository.count();

        dataInitializer.run();

        assertThat(nombreInitial).isEqualTo(8);
        assertThat(produitRepository.count()).isEqualTo(nombreInitial);
    }

    @Test
    void neModifieJamaisUnProduitExistant() throws Exception {
        dataInitializer.run();
        Produit produit = produitRepository.findByNom("Copper Rod").orElseThrow();
        produit.setActif(false);
        produit.setDescription("Description modifiee manuellement");
        produit.setCategorie("Categorie manuelle");
        produit.setPurete("Purete manuelle");
        produit.setDimensions("Dimensions manuelles");
        produit.setNormes("Norme manuelle");
        produit.setConditionnement("Conditionnement manuel");
        produit.setImageUrl("https://example.test/image-manuelle.png");
        produitRepository.saveAndFlush(produit);

        dataInitializer.run();

        Produit apresRedemarrage = produitRepository.findById(produit.getId()).orElseThrow();
        assertThat(apresRedemarrage.isActif()).isFalse();
        assertThat(apresRedemarrage.getDescription()).isEqualTo("Description modifiee manuellement");
        assertThat(apresRedemarrage.getCategorie()).isEqualTo("Categorie manuelle");
        assertThat(apresRedemarrage.getPurete()).isEqualTo("Purete manuelle");
        assertThat(apresRedemarrage.getDimensions()).isEqualTo("Dimensions manuelles");
        assertThat(apresRedemarrage.getNormes()).isEqualTo("Norme manuelle");
        assertThat(apresRedemarrage.getConditionnement()).isEqualTo("Conditionnement manuel");
        assertThat(apresRedemarrage.getImageUrl()).isEqualTo("https://example.test/image-manuelle.png");
        assertThat(produitRepository.count()).isEqualTo(8);
    }
}
