package com.grod.platform.repository;

import com.grod.platform.entity.Produit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProduitRepository extends JpaRepository<Produit, Long>, JpaSpecificationExecutor<Produit> {

    List<Produit> findByActifTrue();

    List<Produit> findByCategorie(String categorie);

    Optional<Produit> findByNom(String nom);

    boolean existsByNom(String nom);

    long countByActifTrue();
}
