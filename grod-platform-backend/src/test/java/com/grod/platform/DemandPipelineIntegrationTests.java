package com.grod.platform;

import com.grod.platform.dto.DemandPipelineColumnDTO;
import com.grod.platform.entity.DemandeDevis;
import com.grod.platform.entity.StatutDemande;
import com.grod.platform.repository.DemandeDevisRepository;
import com.grod.platform.service.AdminPaginationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
class DemandPipelineIntegrationTests {

    @Autowired DemandeDevisRepository demandes;
    @Autowired AdminPaginationService paginationService;

    @BeforeEach
    void cleanRequests() {
        demandes.deleteAll();
    }

    @Test
    void pipelineReturnsGlobalTotalAndOnlyFourHighestPriorityRequests() {
        DemandeDevis highPriority = request("Prioritaire", 100);
        highPriority.setClientFidele(true);
        highPriority.setLongueur(25.0);
        highPriority.setMessage("Cahier des charges complet");
        highPriority.setLienPlanTechnique("https://example.test/plan.pdf");
        demandes.save(highPriority);

        for (int index = 1; index <= 5; index++) {
            demandes.save(request("Standard " + index, 1));
        }

        DemandPipelineColumnDTO newRequests = paginationService.demandPipeline().columns().get("NOUVELLE");

        assertThat(newRequests.total()).isEqualTo(6);
        assertThat(newRequests.demandes()).hasSize(4);
        assertThat(newRequests.demandes().getFirst().getSociete()).isEqualTo("Prioritaire");
    }

    private DemandeDevis request(String company, int quantity) {
        return DemandeDevis.builder()
                .societe(company)
                .nomContact("Contact " + company)
                .email(company.toLowerCase().replace(' ', '-') + "@example.test")
                .telephone("+212600000001")
                .produitDemande("Copper Rod")
                .quantite(quantity)
                .statut(StatutDemande.NOUVELLE)
                .build();
    }
}
