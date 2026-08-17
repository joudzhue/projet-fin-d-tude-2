package com.grod.platform.repository;

import com.grod.platform.entity.DemandeDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import com.grod.platform.entity.StatutDemande;
import java.util.Collection;

@Repository
public interface DemandeDocumentRepository extends JpaRepository<DemandeDocument, Long>, JpaSpecificationExecutor<DemandeDocument> {
    long countByStatutNotIn(Collection<StatutDemande> statuts);
}
