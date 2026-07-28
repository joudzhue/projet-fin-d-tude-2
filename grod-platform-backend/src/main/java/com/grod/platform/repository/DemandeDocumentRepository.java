package com.grod.platform.repository;

import com.grod.platform.entity.DemandeDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DemandeDocumentRepository extends JpaRepository<DemandeDocument, Long> {
}
