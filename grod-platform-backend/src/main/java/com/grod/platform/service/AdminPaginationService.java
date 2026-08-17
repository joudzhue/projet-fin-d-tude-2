package com.grod.platform.service;

import com.grod.platform.dto.*;
import com.grod.platform.entity.*;
import com.grod.platform.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminPaginationService {
    private final DemandeDevisRepository devisRepository;
    private final ClientRepository clientRepository;
    private final DemandeDocumentRepository documentRequestRepository;
    private final ProduitRepository produitRepository;
    private final DocumentTechniqueRepository resourceRepository;

    @Transactional(readOnly = true)
    public DashboardSummaryDTO dashboardSummary() {
        Map<String, Long> statuses = new LinkedHashMap<>();
        for (StatutDemande statut : StatutDemande.values()) statuses.put(statut.name(), devisRepository.countByStatut(statut));
        return new DashboardSummaryDTO(devisRepository.count(), statuses.getOrDefault("NOUVELLE", 0L),
                documentRequestRepository.countByStatutNotIn(List.of(StatutDemande.TRAITEE, StatutDemande.ANNULEE)),
                produitRepository.countByActifTrue(), clientRepository.count(), statuses);
    }

    @Transactional(readOnly = true)
    public PagedResponse<DemandeDevisResponseDTO> devis(Pageable pageable, String search, StatutDemande statut,
            String produit, Long clientId, LocalDate dateDebut, LocalDate dateFin) {
        Specification<DemandeDevis> spec = text(search, "referenceDemande", "societe", "nomContact", "email", "telephone", "produitDemande");
        if (statut != null) spec = spec.and(equal("statut", statut));
        if (hasText(produit)) spec = spec.and(like("produitDemande", produit));
        if (clientId != null) spec = spec.and((root, query, cb) -> cb.equal(root.get("client").get("id"), clientId));
        spec = dates(spec, "dateCreation", dateDebut, dateFin);
        return PagedResponse.from(devisRepository.findAll(spec, pageable).map(this::devisDto));
    }

    @Transactional(readOnly = true)
    public PagedResponse<ClientListDTO> clients(Pageable pageable, String search, Boolean actif, Boolean recurrent) {
        Specification<Client> spec = text(search, "nom", "societe", "email", "telephone");
        if (actif != null) spec = spec.and(equal("actif", actif));
        if (recurrent != null) spec = spec.and((root, query, cb) -> {
            var countQuery = query.subquery(Long.class);
            var demande = countQuery.from(DemandeDevis.class);
            countQuery.select(cb.count(demande)).where(cb.equal(demande.get("client").get("id"), root.get("id")));
            return recurrent ? cb.greaterThan(countQuery, 1L) : cb.lessThanOrEqualTo(countQuery, 1L);
        });
        Page<Client> page = clientRepository.findAll(spec, pageable);
        List<Long> ids = page.getContent().stream().map(Client::getId).toList();
        Map<Long, List<DemandeDevis>> grouped = ids.isEmpty() ? Map.of() : devisRepository.findByClientIdIn(ids).stream()
                .collect(Collectors.groupingBy(item -> item.getClient().getId()));
        Page<ClientListDTO> dtoPage = page.map(client -> clientDto(client, grouped.getOrDefault(client.getId(), List.of())));
        return PagedResponse.from(dtoPage);
    }

    @Transactional(readOnly = true)
    public PagedResponse<DemandeDocumentResponseDTO> documents(Pageable pageable, String search, StatutDemande statut,
            String type, LocalDate dateDebut, LocalDate dateFin) {
        Specification<DemandeDocument> spec = text(search, "referenceDemande", "societe", "nomContact", "email", "telephone", "titreDocument", "typeDocument", "produitConcerne");
        if (statut != null) spec = spec.and(equal("statut", statut));
        if (hasText(type)) spec = spec.and(like("typeDocument", type));
        spec = dates(spec, "dateCreation", dateDebut, dateFin);
        return PagedResponse.from(documentRequestRepository.findAll(spec, pageable).map(this::documentDto));
    }

    @Transactional(readOnly = true)
    public PagedResponse<ProduitResponseDTO> produits(Pageable pageable, String search, Boolean actif, String categorie) {
        Specification<Produit> spec = text(search, "nom", "categorie", "description", "normes");
        if (actif != null) spec = spec.and(equal("actif", actif));
        if (hasText(categorie)) spec = spec.and(like("categorie", categorie));
        return PagedResponse.from(produitRepository.findAll(spec, pageable).map(this::produitDto));
    }

    @Transactional(readOnly = true)
    public PagedResponse<DocumentTechniqueResponseDTO> ressources(Pageable pageable, String search, Boolean actif,
            Boolean publique, String type, String produit) {
        Specification<DocumentTechnique> spec = text(search, "titre", "typeDocument", "produitConcerne", "fichierNom", "description");
        if (actif != null) spec = spec.and(equal("actif", actif));
        if (publique != null) spec = spec.and(equal("telechargementPublic", publique));
        if (hasText(type)) spec = spec.and(like("typeDocument", type));
        if (hasText(produit)) spec = spec.and(like("produitConcerne", produit));
        return PagedResponse.from(resourceRepository.findAll(spec, pageable).map(this::resourceDto));
    }

    public Pageable pageable(int page, int size, String sort, String direction, Set<String> allowed, String fallback) {
        int safePage = Math.max(0, page);
        int safeSize = Math.max(1, Math.min(size, 100));
        String safeSort = allowed.contains(sort) ? sort : fallback;
        Sort.Direction safeDirection = "asc".equalsIgnoreCase(direction) ? Sort.Direction.ASC : Sort.Direction.DESC;
        return PageRequest.of(safePage, safeSize, Sort.by(safeDirection, safeSort));
    }

    private <T> Specification<T> text(String search, String... fields) {
        if (!hasText(search)) return Specification.where(null);
        String value = "%" + search.trim().toLowerCase(Locale.ROOT) + "%";
        return (root, query, cb) -> cb.or(Arrays.stream(fields)
                .map(field -> cb.like(cb.lower(root.get(field).as(String.class)), value)).toArray(jakarta.persistence.criteria.Predicate[]::new));
    }
    private <T> Specification<T> equal(String field, Object value) { return (root, query, cb) -> cb.equal(root.get(field), value); }
    private <T> Specification<T> like(String field, String value) { return (root, query, cb) -> cb.like(cb.lower(root.get(field)), "%" + value.trim().toLowerCase(Locale.ROOT) + "%"); }
    private <T> Specification<T> dates(Specification<T> spec, String field, LocalDate start, LocalDate end) {
        if (start != null) spec = spec.and((root, query, cb) -> cb.greaterThanOrEqualTo(root.get(field), start.atStartOfDay()));
        if (end != null) spec = spec.and((root, query, cb) -> cb.lessThan(root.get(field), end.plusDays(1).atStartOfDay()));
        return spec;
    }
    private boolean hasText(String value) { return value != null && !value.isBlank(); }

    private DemandeDevisResponseDTO devisDto(DemandeDevis d) { return DemandeDevisResponseDTO.builder().id(d.getId()).referenceDemande(d.getReferenceDemande()).clientId(d.getClient()==null?null:d.getClient().getId()).societe(d.getSociete()).nomContact(d.getNomContact()).email(d.getEmail()).telephone(d.getTelephone()).produitId(d.getProduitId()).produitDemande(d.getProduitDemande()).pureteCuivre(d.getPureteCuivre()).longueur(d.getLongueur()).largeur(d.getLargeur()).epaisseur(d.getEpaisseur()).quantite(d.getQuantite()).besoinLivraison(d.getBesoinLivraison()).applicationProjet(d.getApplicationProjet()).finitionSouhaitee(d.getFinitionSouhaitee()).normeReference(d.getNormeReference()).lienPlanTechnique(d.getLienPlanTechnique()).diametreSouhaite(d.getDiametreSouhaite()).clientFidele(d.isClientFidele()).referenceClient(d.getReferenceClient()).message(d.getMessage()).fichierTechniqueUrl(d.getFichierTechniqueUrl()==null?null:"/api/demandes-devis/"+d.getId()+"/attachment").fichierTechniqueNom(d.getFichierTechniqueNom()).statut(d.getStatut()).dateCreation(d.getDateCreation()).build(); }
    private DemandeDocumentResponseDTO documentDto(DemandeDocument d) { return DemandeDocumentResponseDTO.builder().id(d.getId()).referenceDemande(d.getReferenceDemande()).societe(d.getSociete()).nomContact(d.getNomContact()).email(d.getEmail()).telephone(d.getTelephone()).typeDocument(d.getTypeDocument()).titreDocument(d.getTitreDocument()).produitConcerne(d.getProduitConcerne()).message(d.getMessage()).statut(d.getStatut()).dateCreation(d.getDateCreation()).build(); }
    private ProduitResponseDTO produitDto(Produit p) { return ProduitResponseDTO.builder().id(p.getId()).nom(p.getNom()).description(p.getDescription()).categorie(p.getCategorie()).imageUrl(p.getImageUrl()).applications(p.getApplications()).dimensions(p.getDimensions()).purete(p.getPurete()).normes(p.getNormes()).conditionnement(p.getConditionnement()).actif(p.isActif()).build(); }
    private DocumentTechniqueResponseDTO resourceDto(DocumentTechnique d) { return DocumentTechniqueResponseDTO.builder().id(d.getId()).titre(d.getTitre()).typeDocument(d.getTypeDocument()).produitConcerne(d.getProduitConcerne()).description(d.getDescription()).fichierUrl("/api/admin/ressources/"+d.getId()+"/download").fichierNom(d.getFichierNom()).actif(d.isActif()).telechargementPublic(d.isTelechargementPublic()).dateCreation(d.getDateCreation()).build(); }
    private ClientListDTO clientDto(Client c, List<DemandeDevis> demandes) { var dates=demandes.stream().map(DemandeDevis::getDateCreation).filter(Objects::nonNull).toList(); return ClientListDTO.builder().id(c.getId()).nom(c.getNom()).societe(c.getSociete()).email(c.getEmail()).telephone(c.getTelephone()).actif(c.isActif()).nombreDemandes(demandes.size()).nombreDemandesOuvertes(demandes.stream().filter(d->d.getStatut()==StatutDemande.NOUVELLE||d.getStatut()==StatutDemande.EN_TRAITEMENT).count()).premiereDemande(dates.stream().min(Comparator.naturalOrder()).orElse(null)).derniereDemande(dates.stream().max(Comparator.naturalOrder()).orElse(null)).produitsDemandes(demandes.stream().map(DemandeDevis::getProduitDemande).filter(Objects::nonNull).distinct().sorted().toList()).recurrent(demandes.size()>1).build(); }
}
