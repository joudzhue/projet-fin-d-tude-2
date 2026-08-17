package com.grod.platform.repository;

import com.grod.platform.entity.DocumentTechnique;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;

@Repository
public interface DocumentTechniqueRepository extends JpaRepository<DocumentTechnique, Long>, JpaSpecificationExecutor<DocumentTechnique> {

    List<DocumentTechnique> findByActifTrueOrderByDateCreationDesc();
    List<DocumentTechnique> findByActifTrueAndTelechargementPublicTrueOrderByDateCreationDesc();
}
