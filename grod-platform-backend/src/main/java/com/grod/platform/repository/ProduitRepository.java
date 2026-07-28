package com.grod.platform.repository;

import com.grod.platform.entity.Produit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProduitRepository extends JpaRepository<Produit, Long> {

    List<Produit> findByActifTrue();

    List<Produit> findByCategorie(String categorie);

    Optional<Produit> findByNom(String nom);

    boolean existsByNom(String nom);
}
