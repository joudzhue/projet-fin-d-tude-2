package com.grod.platform;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.grod.platform.entity.*;
import com.grod.platform.repository.*;
import com.grod.platform.security.JwtService;
import com.grod.platform.service.ClientService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import java.nio.file.Files;
import java.nio.file.Path;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties = "app.upload-dir=target/test-uploads")
@AutoConfigureMockMvc
class SecurityAndBusinessIntegrationTests {
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper objectMapper;
    @Autowired UtilisateurRepository utilisateurs;
    @Autowired DemandeDevisRepository devis;
    @Autowired ClientRepository clients;
    @Autowired NotificationRepository notifications;
    @Autowired NotificationLectureRepository notificationLectures;
    @Autowired DocumentTechniqueRepository documents;
    @Autowired PasswordEncoder encoder;
    @Autowired JwtService jwtService;
    @Autowired ClientService clientService;

    private Utilisateur admin;

    @BeforeEach
    void prepare() throws Exception {
        notificationLectures.deleteAll();
        notifications.deleteAll();
        devis.deleteAll();
        clients.deleteAll();
        documents.deleteAll();
        utilisateurs.deleteAll();
        admin = utilisateurs.save(Utilisateur.builder().nomComplet("Admin Test")
                .email("admin-test@grod.local").motDePasse(encoder.encode("OldPassword123!"))
                .role(Role.ADMIN).actif(true).build());
        Files.createDirectories(Path.of("target/test-uploads/documents"));
    }

    @Test
    void loginEtAutorisationsParRole() throws Exception {
        mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"admin-test@grod.local\",\"motDePasse\":\"OldPassword123!\"}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.token").isNotEmpty());
        mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"admin-test@grod.local\",\"motDePasse\":\"incorrect\"}"))
                .andExpect(status().isUnauthorized());
        mvc.perform(get("/api/demandes-devis")).andExpect(status().isUnauthorized());

        Utilisateur commercial = utilisateurs.save(Utilisateur.builder().nomComplet("Commercial")
                .email("commercial@grod.local").motDePasse(encoder.encode("Password123!"))
                .role(Role.COMMERCIAL).actif(true).build());
        mvc.perform(get("/api/demandes-devis").header("Authorization", bearer(commercial)))
                .andExpect(status().isForbidden());
        mvc.perform(get("/api/demandes-devis").header("Authorization", bearer(admin)))
                .andExpect(status().isOk());
    }

    @Test
    void corsAutoriseSeulementLeFrontendConfigure() throws Exception {
        mvc.perform(options("/api/demandes-devis")
                        .header("Origin", "http://localhost:5173")
                        .header("Access-Control-Request-Method", "POST")
                        .header("Access-Control-Request-Headers", "content-type"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:5173"));

        mvc.perform(options("/api/demandes-devis")
                        .header("Origin", "https://hostile.example")
                        .header("Access-Control-Request-Method", "POST"))
                .andExpect(status().isForbidden())
                .andExpect(header().doesNotExist("Access-Control-Allow-Origin"));
    }

    @Test
    void changementMotDePasseEstProtegeEtVerifieAncienMotDePasse() throws Exception {
        String body = "{\"currentPassword\":\"OldPassword123!\",\"newPassword\":\"NewPassword123!\"}";
        mvc.perform(put("/api/auth/password").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isUnauthorized());
        mvc.perform(put("/api/auth/password").header("Authorization", bearer(admin))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"currentPassword\":\"wrong-password\",\"newPassword\":\"NewPassword123!\"}"))
                .andExpect(status().isBadRequest());
        mvc.perform(put("/api/auth/password").header("Authorization", bearer(admin))
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isOk());
        assertThat(encoder.matches("NewPassword123!", utilisateurs.findByEmail(admin.getEmail()).orElseThrow().getMotDePasse())).isTrue();
        mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"admin-test@grod.local\",\"motDePasse\":\"OldPassword123!\"}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void devisValideStatutsEtQuantite() throws Exception {
        String invalid = devisJson(0);
        mvc.perform(post("/api/demandes-devis").contentType(MediaType.APPLICATION_JSON).content(invalid))
                .andExpect(status().isBadRequest());
        String response = mvc.perform(post("/api/demandes-devis").contentType(MediaType.APPLICATION_JSON).content(devisJson(10)))
                .andExpect(status().isOk()).andExpect(jsonPath("$.statut").value("NOUVELLE"))
                .andReturn().getResponse().getContentAsString();
        long id = objectMapper.readTree(response).get("id").asLong();
        mvc.perform(put("/api/demandes-devis/{id}/statut", id).param("statut", "EN_TRAITEMENT")
                        .header("Authorization", bearer(admin))).andExpect(status().isOk());
        assertThat(devis.findById(id).orElseThrow().getStatut()).isEqualTo(StatutDemande.EN_TRAITEMENT);
        mvc.perform(put("/api/demandes-devis/{id}/statut", id).param("statut", "TRAITEE")
                        .header("Authorization", bearer(admin))).andExpect(status().isOk());
        assertThat(devis.findById(id).orElseThrow().getStatut()).isEqualTo(StatutDemande.TRAITEE);
    }

    @Test
    void devisCompletPersisteLesChampsStructuresEtGardeLeMessageLibre() throws Exception {
        String request = """
                {
                  "societe":"Atlas Industries",
                  "nomContact":"Client Test",
                  "email":"client@example.com",
                  "telephone":"+212 600 000 000",
                  "produitId":42,
                  "produitDemande":"Copper Rod",
                  "quantite":25,
                  "pureteCuivre":99.9,
                  "longueur":1200,
                  "largeur":20,
                  "epaisseur":8,
                  "diametreSouhaite":"12 mm +/- 0,1",
                  "normeReference":"ASTM B49",
                  "finitionSouhaitee":"Brillante",
                  "applicationProjet":"Tableau electrique industriel",
                  "besoinLivraison":"Sous 4 semaines",
                  "lienPlanTechnique":"https://example.com/plan-42",
                  "fichierTechniqueUrl":"/uploads/quotes/plan-42.pdf",
                  "fichierTechniqueNom":"plan-42.pdf",
                  "message":"Merci de confirmer la disponibilite."
                }
                """;

        String response = mvc.perform(post("/api/demandes-devis")
                        .contentType(MediaType.APPLICATION_JSON).content(request))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.statut").value("NOUVELLE"))
                .andExpect(jsonPath("$.referenceDemande").value(org.hamcrest.Matchers.matchesPattern("GROD-\\d{4}-\\d{5}")))
                .andExpect(jsonPath("$.applicationProjet").value("Tableau electrique industriel"))
                .andExpect(jsonPath("$.message").value("Merci de confirmer la disponibilite."))
                .andReturn().getResponse().getContentAsString();

        long id = objectMapper.readTree(response).get("id").asLong();
        DemandeDevis saved = devis.findById(id).orElseThrow();
        assertThat(saved.getProduitId()).isEqualTo(42L);
        assertThat(saved.getProduitDemande()).isEqualTo("Copper Rod");
        assertThat(saved.getDiametreSouhaite()).isEqualTo("12 mm +/- 0,1");
        assertThat(saved.getNormeReference()).isEqualTo("ASTM B49");
        assertThat(saved.getFinitionSouhaitee()).isEqualTo("Brillante");
        assertThat(saved.getApplicationProjet()).isEqualTo("Tableau electrique industriel");
        assertThat(saved.getLienPlanTechnique()).isEqualTo("https://example.com/plan-42");
        assertThat(saved.getMessage()).isEqualTo("Merci de confirmer la disponibilite.");
    }

    @Test
    void devisMinimalAccepteLesNouveauxChampsNulsEtRejetteUnChampStructureTropLong() throws Exception {
        String response = mvc.perform(post("/api/demandes-devis")
                        .contentType(MediaType.APPLICATION_JSON).content(devisJson(1)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.applicationProjet").doesNotExist())
                .andExpect(jsonPath("$.diametreSouhaite").doesNotExist())
                .andReturn().getResponse().getContentAsString();
        DemandeDevis saved = devis.findById(objectMapper.readTree(response).get("id").asLong()).orElseThrow();
        assertThat(saved.getApplicationProjet()).isNull();
        assertThat(saved.getNormeReference()).isNull();

        String tooLong = "x".repeat(1001);
        String invalid = devisJson(1).replace("}", ",\"applicationProjet\":\"" + tooLong + "\"}");
        mvc.perform(post("/api/demandes-devis").contentType(MediaType.APPLICATION_JSON).content(invalid))
                .andExpect(status().isBadRequest());
    }

    @Test
    void demandesRapprochentLeClientParEmailNormaliseEtConserventLesSnapshots() throws Exception {
        long firstId = createQuote("Client@Entreprise.ma", "0600000000", "Societe A", "Contact A");
        long secondId = createQuote("  client@entreprise.ma  ", "0611111111", "Societe B", "Contact B");

        assertThat(clients.count()).isEqualTo(1);
        Client client = clients.findAll().getFirst();
        assertThat(client.getEmail()).isEqualTo("client@entreprise.ma");
        assertThat(client.getTelephone()).isEqualTo("0611111111");
        assertThat(client.getSociete()).isEqualTo("Societe B");
        assertThat(client.getNom()).isEqualTo("Contact B");
        assertThat(devis.findById(firstId).orElseThrow().getTelephone()).isEqualTo("0600000000");
        assertThat(devis.findById(secondId).orElseThrow().getClient().getId()).isEqualTo(client.getId());

        mvc.perform(get("/api/admin/clients").header("Authorization", bearer(admin)))
                .andExpect(status().isOk()).andExpect(jsonPath("$.content[0].nombreDemandes").value(2))
                .andExpect(jsonPath("$.content[0].recurrent").value(true));
        mvc.perform(get("/api/admin/clients/{id}", client.getId()).header("Authorization", bearer(admin)))
                .andExpect(status().isOk()).andExpect(jsonPath("$.historique.length()").value(2));
    }

    @Test
    void emailsDifferentsCreentDeuxClientsEtApiClientsEstAdminUniquement() throws Exception {
        createQuote("one@example.com", "0600000000", "One", "Contact One");
        createQuote("two@example.com", "0600000001", "Two", "Contact Two");
        assertThat(clients.count()).isEqualTo(2);

        mvc.perform(get("/api/admin/clients")).andExpect(status().isUnauthorized());
        Utilisateur commercial = utilisateurs.save(Utilisateur.builder().nomComplet("Commercial CRM")
                .email("commercial-crm@grod.local").motDePasse(encoder.encode("Password123!"))
                .role(Role.COMMERCIAL).actif(true).build());
        mvc.perform(get("/api/admin/clients").header("Authorization", bearer(commercial)))
                .andExpect(status().isForbidden());
        mvc.perform(get("/api/admin/clients").header("Authorization", bearer(admin)))
                .andExpect(status().isOk());
    }

    @Test
    void ancienneDemandeSansClientPeutEtreRattacheeSansModifierSonSnapshot() {
        DemandeDevis legacy = devis.save(DemandeDevis.builder().societe("Legacy SA").nomContact("Ancien Contact")
                .email("Legacy@Example.com").telephone("0600000099").produitDemande("Copper Rod")
                .quantite(3).statut(StatutDemande.NOUVELLE).build());
        assertThat(legacy.getClient()).isNull();

        assertThat(clientService.rattacherDemandesExistantes()).isEqualTo(1);
        DemandeDevis linked = devis.findById(legacy.getId()).orElseThrow();
        assertThat(linked.getClient()).isNotNull();
        assertThat(linked.getEmail()).isEqualTo("Legacy@Example.com");
        assertThat(clients.findByEmail("legacy@example.com")).isPresent();
    }

    @Test
    void notificationsSontCreeesLuesEtPersisteesParAdministrateur() throws Exception {
        long quoteId = createQuote("notify@example.com", "0600000010", "Notify SA", "Contact Notify");
        String documentBody = """
                {"societe":"Notify SA","nomContact":"Contact Notify","email":"notify@example.com",
                 "telephone":"0600000010","typeDocument":"Fiche technique",
                 "titreDocument":"Fiche Copper Rod","produitConcerne":"Copper Rod"}
                """;
        mvc.perform(post("/api/demandes-documents").contentType(MediaType.APPLICATION_JSON).content(documentBody))
                .andExpect(status().isOk());

        assertThat(notifications.count()).isEqualTo(2);
        mvc.perform(get("/api/admin/notifications/unread-count").header("Authorization", bearer(admin)))
                .andExpect(status().isOk()).andExpect(jsonPath("$.count").value(2));
        String list = mvc.perform(get("/api/admin/notifications").header("Authorization", bearer(admin)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[?(@.referenceType == 'DEVIS')].referenceId").value(org.hamcrest.Matchers.hasItem((int) quoteId)))
                .andReturn().getResponse().getContentAsString();
        JsonNode devisNotification = java.util.stream.StreamSupport.stream(objectMapper.readTree(list).path("content").spliterator(), false)
                .filter(node -> "DEVIS".equals(node.path("referenceType").asText())).findFirst().orElseThrow();
        long notificationId = devisNotification.get("id").asLong();

        mvc.perform(put("/api/admin/notifications/{id}/read", notificationId).header("Authorization", bearer(admin)))
                .andExpect(status().isOk()).andExpect(jsonPath("$.lue").value(true));
        mvc.perform(get("/api/admin/notifications/unread-count").header("Authorization", bearer(admin)))
                .andExpect(status().isOk()).andExpect(jsonPath("$.count").value(1));
        assertThat(notificationLectures.count()).isEqualTo(1);

        Utilisateur secondAdmin = utilisateurs.save(Utilisateur.builder().nomComplet("Second Admin")
                .email("second-admin@grod.local").motDePasse(encoder.encode("Password123!"))
                .role(Role.ADMIN).actif(true).build());
        mvc.perform(get("/api/admin/notifications/unread-count").header("Authorization", bearer(secondAdmin)))
                .andExpect(status().isOk()).andExpect(jsonPath("$.count").value(2));

        mvc.perform(put("/api/admin/notifications/read-all").header("Authorization", bearer(admin)))
                .andExpect(status().isOk());
        mvc.perform(get("/api/admin/notifications/unread-count").header("Authorization", bearer(admin)))
                .andExpect(status().isOk()).andExpect(jsonPath("$.count").value(0));
        assertThat(notificationLectures.findByUtilisateurId(admin.getId())).hasSize(2);
    }

    @Test
    void apiNotificationsEstReserveeAuxAdmins() throws Exception {
        mvc.perform(get("/api/admin/notifications")).andExpect(status().isUnauthorized());
        Utilisateur commercial = utilisateurs.save(Utilisateur.builder().nomComplet("Commercial Notifications")
                .email("commercial-notifications@grod.local").motDePasse(encoder.encode("Password123!"))
                .role(Role.COMMERCIAL).actif(true).build());
        mvc.perform(get("/api/admin/notifications").header("Authorization", bearer(commercial)))
                .andExpect(status().isForbidden());
        mvc.perform(get("/api/admin/notifications").header("Authorization", bearer(admin)))
                .andExpect(status().isOk());
    }

    @Test
    void listesAdminSupportentPaginationRechercheFiltreEtTri() throws Exception {
        for (int index = 0; index < 12; index++) {
            createQuote("page" + index + "@example.com", "060000" + String.format("%04d", index),
                    index == 7 ? "Atlas Recherche" : "Societe " + index, "Contact " + index);
        }
        mvc.perform(get("/api/admin/demandes").param("page","0").param("size","5")
                        .header("Authorization", bearer(admin)))
                .andExpect(status().isOk()).andExpect(jsonPath("$.content.length()").value(5))
                .andExpect(jsonPath("$.totalElements").value(12)).andExpect(jsonPath("$.totalPages").value(3))
                .andExpect(jsonPath("$.first").value(true));
        mvc.perform(get("/api/admin/demandes").param("page","1").param("size","5")
                        .param("sort","referenceDemande").param("direction","asc")
                        .header("Authorization", bearer(admin)))
                .andExpect(status().isOk()).andExpect(jsonPath("$.page").value(1))
                .andExpect(jsonPath("$.content.length()").value(5));
        mvc.perform(get("/api/admin/demandes").param("search","atlas recherche")
                        .header("Authorization", bearer(admin)))
                .andExpect(status().isOk()).andExpect(jsonPath("$.totalElements").value(1))
                .andExpect(jsonPath("$.content[0].societe").value("Atlas Recherche"));
        mvc.perform(get("/api/admin/demandes").param("statut","NOUVELLE").param("produit","copper")
                        .header("Authorization", bearer(admin)))
                .andExpect(status().isOk()).andExpect(jsonPath("$.totalElements").value(12));
        mvc.perform(get("/api/admin/demandes")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/admin/dashboard/summary").header("Authorization", bearer(admin)))
                .andExpect(status().isOk()).andExpect(jsonPath("$.demandesTotales").value(12))
                .andExpect(jsonPath("$.nouvellesDemandes").value(12));
    }

    @Test
    void ressourcePriveeNestJamaisExposeePubliquement() throws Exception {
        Files.writeString(Path.of("target/test-uploads/documents/public.pdf"), "%PDF-1.4 public");
        Files.writeString(Path.of("target/test-uploads/documents/private.pdf"), "%PDF-1.4 private");
        DocumentTechnique publicDoc = documents.save(document("Public", "public.pdf", true));
        DocumentTechnique privateDoc = documents.save(document("Prive", "private.pdf", false));
        mvc.perform(get("/api/documents-techniques/actifs")).andExpect(status().isOk())
                .andExpect(jsonPath("$[0].titre").value("Public")).andExpect(jsonPath("$[1]").doesNotExist());
        mvc.perform(get("/api/documents-techniques/{id}/download", publicDoc.getId())).andExpect(status().isOk());
        mvc.perform(get("/api/documents-techniques/{id}/download", privateDoc.getId())).andExpect(status().isNotFound());
        mvc.perform(get("/api/admin/ressources/{id}/download", privateDoc.getId())).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/admin/ressources/{id}/download", privateDoc.getId())
                        .header("Authorization", bearer(admin))).andExpect(status().isOk());
        mvc.perform(get("/uploads/documents/private.pdf")).andExpect(status().isUnauthorized());
    }

    @Test
    void uploadPdfVerifieLeContenu() throws Exception {
        MockMultipartFile valid = new MockMultipartFile("file", "valid.pdf", "application/pdf", "%PDF-1.4 valid".getBytes());
        mvc.perform(multipart("/api/uploads/technical-documents").file(valid).header("Authorization", bearer(admin)))
                .andExpect(status().isOk());
        MockMultipartFile fake = new MockMultipartFile("file", "fake.pdf", "application/pdf", "MZ executable".getBytes());
        mvc.perform(multipart("/api/uploads/technical-documents").file(fake).header("Authorization", bearer(admin)))
                .andExpect(status().isBadRequest());
        MockMultipartFile oversized = new MockMultipartFile("file", "large.pdf", "application/pdf", new byte[10 * 1024 * 1024 + 1]);
        mvc.perform(multipart("/api/uploads/technical-documents").file(oversized).header("Authorization", bearer(admin)))
                .andExpect(status().isBadRequest());
    }

    private String bearer(Utilisateur user) { return "Bearer " + jwtService.generateToken(user); }
    private long createQuote(String email, String phone, String company, String contact) throws Exception {
        String body = objectMapper.writeValueAsString(java.util.Map.of(
                "societe", company, "nomContact", contact, "email", email, "telephone", phone,
                "produitDemande", "Copper Rod", "quantite", 10));
        String response = mvc.perform(post("/api/demandes-devis").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        return objectMapper.readTree(response).get("id").asLong();
    }
    private String devisJson(int quantity) {
        return "{\"societe\":\"Atlas\",\"nomContact\":\"Client Test\",\"email\":\"client@example.com\",\"telephone\":\"+212 600 000 000\",\"produitDemande\":\"Copper Rod\",\"quantite\":" + quantity + "}";
    }
    private DocumentTechnique document(String title, String filename, boolean publicDownload) {
        return DocumentTechnique.builder().titre(title).typeDocument("Fiche technique").fichierNom(filename)
                .fichierUrl("/uploads/documents/" + filename).actif(true).telechargementPublic(publicDownload).build();
    }
}
