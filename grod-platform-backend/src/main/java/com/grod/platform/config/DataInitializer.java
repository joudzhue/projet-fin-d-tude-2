package com.grod.platform.config;

import com.grod.platform.entity.Role;
import com.grod.platform.entity.Produit;
import com.grod.platform.entity.Utilisateur;
import com.grod.platform.repository.ProduitRepository;
import com.grod.platform.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UtilisateurRepository utilisateurRepository;
    private final ProduitRepository produitRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        String adminEmail = "admin@grod.ma";

        if (!utilisateurRepository.existsByEmail(adminEmail)) {
            Utilisateur admin = Utilisateur.builder()
                    .nomComplet("Administrateur G-ROD")
                    .email(adminEmail)
                    .motDePasse(passwordEncoder.encode("admin123"))
                    .role(Role.ADMIN)
                    .actif(true)
                    .build();

            utilisateurRepository.save(admin);
        }

        upsertProduit(
                "Copper Rod",
                "Copper products",
                "Barres rondes en cuivre haute purete offrant une excellente conductivite electrique et thermique pour les applications industrielles.",
                "https://grod.achrafchtouki.ma/Pages/Nos_solutions/Solution/Copper_rod/images/rod-index-770x460.jpg"
        );
        upsertProduit(
                "Copper Anodes",
                "Copper products",
                "Anodes en cuivre destinees aux procedes industriels, electrolytiques et metallurgiques.",
                "https://grod.achrafchtouki.ma/Pages/Nos_solutions/Solution/Copper_rod/images/ImagebildROD_1-kopiera-616x460.jpg"
        );
        upsertProduit(
                "Copper Bus Bars",
                "Copper products",
                "Barres conductrices en cuivre concues pour les systemes electriques, tableaux industriels et installations energetiques.",
                "https://grod.achrafchtouki.ma/Pages/Nos_solutions/Solution/Copper_rod/images/rod-index-770x460.jpg"
        );
        upsertProduit(
                "Copper Flat Bars",
                "Copper products",
                "Meplats en cuivre adaptes aux applications electriques, techniques et industrielles.",
                "https://grod.achrafchtouki.ma/Pages/Nos_solutions/Solution/Copper_rod/images/ImagebildROD_1-kopiera-616x460.jpg"
        );
        upsertProduit(
                "Copper Tubes",
                "Copper products",
                "Tubes en cuivre utilises pour la plomberie, la climatisation, l industrie et les installations techniques.",
                "https://grod.achrafchtouki.ma/Pages/Nos_solutions/Solution/Copper_rod/images/rod-index-770x460.jpg"
        );
        upsertProduit(
                "Copper Sheets",
                "Copper products",
                "Feuilles et plaques de cuivre destinees a la fabrication, au revetement, a l electricite et aux usages industriels.",
                "https://grod.achrafchtouki.ma/Pages/Nos_solutions/Solution/Copper_rod/images/ImagebildROD_1-kopiera-616x460.jpg"
        );
        upsertProduit(
                "Copper Wire",
                "Copper products",
                "Fil de cuivre haute conductivite utilise dans les cables, bobinages, connexions electriques et applications industrielles.",
                "https://grod.achrafchtouki.ma/Pages/Nos_solutions/Solution/Copper_rod/images/rod-index-770x460.jpg"
        );
        upsertProduit(
                "Custom Copper Parts",
                "Copper products",
                "Pieces en cuivre sur mesure fabriquees selon les besoins specifiques des clients et les plans techniques.",
                "https://grod.achrafchtouki.ma/Pages/Nos_solutions/Solution/Copper_rod/images/ImagebildROD_1-kopiera-616x460.jpg"
        );

        disableObsoleteProduit("Quality");
        disableObsoleteProduit("Specials");
        disableObsoleteProduit("Anodes cuivre");
        disableObsoleteProduit("Bus Bars cuivre");
        disableObsoleteProduit("Meplats cuivre");
        disableObsoleteProduit("Tubes cuivre");
        disableObsoleteProduit("Solutions speciales");
    }

    private void upsertProduit(String nom, String categorie, String description, String imageUrl) {
        Produit produit = produitRepository.findByNom(nom)
                .orElseGet(Produit::new);

        boolean nouveauProduit = produit.getId() == null;

        produit.setNom(nom);
        if (nouveauProduit || isBlank(produit.getCategorie())) {
            produit.setCategorie(categorie);
        }
        if (nouveauProduit || isBlank(produit.getDescription())) {
            produit.setDescription(description);
        }
        if (nouveauProduit || isBlank(produit.getImageUrl())) {
            produit.setImageUrl(imageUrl);
        }
        produit.setActif(true);

        produitRepository.save(produit);
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }

    private void disableObsoleteProduit(String nom) {
        produitRepository.findByNom(nom).ifPresent(produit -> {
            produit.setActif(false);
            produitRepository.save(produit);
        });
    }
}
