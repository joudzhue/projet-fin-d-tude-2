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
import org.springframework.beans.factory.annotation.Value;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UtilisateurRepository utilisateurRepository;
    private final ProduitRepository produitRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.bootstrap-admin.email:}") private String adminEmail;
    @Value("${app.bootstrap-admin.password:}") private String adminPassword;
    @Value("${app.bootstrap-admin.name:Administrateur G-ROD}") private String adminName;

    @Override
    public void run(String... args) {
        if (!isBlank(adminEmail) && !isBlank(adminPassword) && !utilisateurRepository.existsByEmail(adminEmail)) {
            Utilisateur admin = Utilisateur.builder()
                    .nomComplet(adminName)
                    .email(adminEmail)
                    .motDePasse(passwordEncoder.encode(adminPassword))
                    .role(Role.ADMIN)
                    .actif(true)
                    .build();

            utilisateurRepository.save(admin);
        }

        creerProduitSiAbsent(
                "Copper Rod",
                "Copper products",
                "Barres rondes en cuivre haute purete offrant une excellente conductivite electrique et thermique pour les applications industrielles.",
                "https://grod.achrafchtouki.ma/Pages/Nos_solutions/Solution/Copper_rod/images/rod-index-770x460.jpg",
                "Cuivre haute conductivite",
                "Diametres et longueurs selon demande client",
                "ASTM, EN, IEC ou specification interne"
        );
        creerProduitSiAbsent(
                "Copper Anodes",
                "Copper products",
                "Anodes en cuivre destinees aux procedes industriels, electrolytiques et metallurgiques.",
                "https://grod.achrafchtouki.ma/Pages/Nos_solutions/Solution/Copper_rod/images/ImagebildROD_1-kopiera-616x460.jpg",
                "Choix libre entre 50% et 99,99%",
                "Formats et epaisseurs selon installation",
                "Specification client et controle laboratoire"
        );
        creerProduitSiAbsent(
                "Copper Bus Bars",
                "Copper products",
                "Barres conductrices en cuivre concues pour les systemes electriques, tableaux industriels et installations energetiques.",
                "https://grod.achrafchtouki.ma/Pages/Nos_solutions/Solution/Copper_rod/images/rod-index-770x460.jpg",
                "Cuivre conducteur",
                "Largeur, epaisseur et percage sur demande",
                "Normes electriques industrielles"
        );
        creerProduitSiAbsent(
                "Copper Flat Bars",
                "Copper products",
                "Meplats en cuivre adaptes aux applications electriques, techniques et industrielles.",
                "https://grod.achrafchtouki.ma/Pages/Nos_solutions/Solution/Copper_rod/images/ImagebildROD_1-kopiera-616x460.jpg",
                "Cuivre technique",
                "Largeur, epaisseur et longueur selon besoin",
                "EN 13601 ou equivalent selon specification"
        );
        creerProduitSiAbsent(
                "Copper Tubes",
                "Copper products",
                "Tubes en cuivre utilises pour la plomberie, la climatisation, l industrie et les installations techniques.",
                "https://grod.achrafchtouki.ma/Pages/Nos_solutions/Solution/Copper_rod/images/rod-index-770x460.jpg",
                "Cuivre adapte aux installations techniques",
                "Diametres, epaisseurs et longueurs sur demande",
                "Normes plomberie, HVAC et industrie"
        );
        creerProduitSiAbsent(
                "Copper Sheets",
                "Copper products",
                "Feuilles et plaques de cuivre destinees a la fabrication, au revetement, a l electricite et aux usages industriels.",
                "https://grod.achrafchtouki.ma/Pages/Nos_solutions/Solution/Copper_rod/images/ImagebildROD_1-kopiera-616x460.jpg",
                "Cuivre pour fabrication et conductivite",
                "Feuilles, plaques et epaisseurs selon besoin",
                "Specification client ou norme industrielle"
        );
        creerProduitSiAbsent(
                "Copper Wire",
                "Copper products",
                "Fil de cuivre haute conductivite utilise dans les cables, bobinages, connexions electriques et applications industrielles.",
                "https://grod.achrafchtouki.ma/Pages/Nos_solutions/Solution/Copper_rod/images/rod-index-770x460.jpg",
                "Haute conductivite",
                "Sections et conditionnements selon application",
                "Normes cable, bobinage et connexion"
        );
        creerProduitSiAbsent(
                "Custom Copper Parts",
                "Copper products",
                "Pieces en cuivre sur mesure fabriquees selon les besoins specifiques des clients et les plans techniques.",
                "https://grod.achrafchtouki.ma/Pages/Nos_solutions/Solution/Copper_rod/images/ImagebildROD_1-kopiera-616x460.jpg",
                "Selon usage et contrainte technique",
                "Selon plan 2D/3D et cahier des charges",
                "Controle selon specification client"
        );

    }

    private void creerProduitSiAbsent(
            String nom,
            String categorie,
            String description,
            String imageUrl,
            String purete,
            String dimensions,
            String normes
    ) {
        if (produitRepository.existsByNom(nom)) {
            return;
        }

        produitRepository.save(Produit.builder()
                .nom(nom)
                .categorie(categorie)
                .description(description)
                .imageUrl(imageUrl)
                .purete(purete)
                .dimensions(dimensions)
                .normes(normes)
                .actif(true)
                .build());
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}
