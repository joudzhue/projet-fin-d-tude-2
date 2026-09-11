package com.grod.platform.repository;

import com.grod.platform.entity.DemandeDevis;
import com.grod.platform.entity.StatutDemande;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Collection;

@Repository
public interface DemandeDevisRepository extends JpaRepository<DemandeDevis, Long>, JpaSpecificationExecutor<DemandeDevis> {

    List<DemandeDevis> findByStatut(StatutDemande statut);

    List<DemandeDevis> findByProduitDemande(String produitDemande);

    List<DemandeDevis> findByClientIdOrderByDateCreationDesc(Long clientId);

    List<DemandeDevis> findByClientIdIn(Collection<Long> clientIds);

    List<DemandeDevis> findByClientIsNull();

    long countByStatut(StatutDemande statut);

    @Query("""
            select d from DemandeDevis d
            where d.statut = :statut
            order by (
                case when d.societe is not null and d.nomContact is not null and d.email is not null and d.telephone is not null then 15 else 0 end
                + case when d.produitDemande is not null then 15 else 0 end
                + case when d.quantite is not null then 15 else 0 end
                + case when d.longueur is not null or d.largeur is not null or d.epaisseur is not null or d.diametreSouhaite is not null or d.pureteCuivre is not null then 15 else 0 end
                + case when (d.message is not null and d.message <> '') or (d.fichierTechniqueUrl is not null and d.fichierTechniqueUrl <> '') or (d.lienPlanTechnique is not null and d.lienPlanTechnique <> '') or (d.besoinLivraison is not null and d.besoinLivraison <> '') then 15 else 0 end
                + case when d.clientFidele = true then 10 else 0 end
                + case when d.quantite >= 10 then 10 else 0 end
                + case when (d.fichierTechniqueUrl is not null and d.fichierTechniqueUrl <> '') or (d.lienPlanTechnique is not null and d.lienPlanTechnique <> '') then 10 else 0 end
            ) desc, d.dateCreation desc
            """)
    List<DemandeDevis> findHighestPriorityByStatut(@Param("statut") StatutDemande statut, Pageable pageable);
}
