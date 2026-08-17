package com.grod.platform.repository;

import com.grod.platform.entity.DemandeDevis;
import com.grod.platform.entity.StatutDemande;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

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
}
