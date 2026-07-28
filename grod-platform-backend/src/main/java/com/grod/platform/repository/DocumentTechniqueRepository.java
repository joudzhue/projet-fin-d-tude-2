package com.grod.platform.repository;

import com.grod.platform.entity.DocumentTechnique;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentTechniqueRepository extends JpaRepository<DocumentTechnique, Long> {

    List<DocumentTechnique> findByActifTrueOrderByDateCreationDesc();
}
