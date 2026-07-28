package com.grod.platform.repository;

import com.grod.platform.entity.DemandeDevis;
import com.grod.platform.entity.StatutDemande;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DemandeDevisRepository extends JpaRepository<DemandeDevis, Long> {

    List<DemandeDevis> findByStatut(StatutDemande statut);

    List<DemandeDevis> findByProduitDemande(String produitDemande);
}