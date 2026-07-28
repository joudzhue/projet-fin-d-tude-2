package com.grod.platform.service;

import com.grod.platform.dto.DemandeDevisResponseDTO;
import org.openpdf.text.Document;
import org.openpdf.text.DocumentException;
import org.openpdf.text.Element;
import org.openpdf.text.Font;
import org.openpdf.text.FontFactory;
import org.openpdf.text.PageSize;
import org.openpdf.text.Paragraph;
import org.openpdf.text.Phrase;
import org.openpdf.text.pdf.PdfPCell;
import org.openpdf.text.pdf.PdfPTable;
import org.openpdf.text.pdf.PdfWriter;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

@Service
public class DemandeDevisPdfService {

    private static final Color GREEN = new Color(26, 104, 64);
    private static final Color LIGHT_GREEN = new Color(232, 242, 235);
    private static final Color LIGHT_GRAY = new Color(245, 247, 246);
    private static final DateTimeFormatter DATE_FORMAT =
            DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    public byte[] genererPdf(DemandeDevisResponseDTO demande) {
        ByteArrayOutputStream output = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4, 42, 42, 40, 40);

        try {
            PdfWriter.getInstance(document, output);
            document.open();

            ajouterEntete(document, demande);
            ajouterSection(document, "Informations client", new String[][]{
                    {"Societe", demande.getSociete()},
                    {"Contact", demande.getNomContact()},
                    {"Email", demande.getEmail()},
                    {"Telephone", demande.getTelephone()},
                    {"Client fidele", demande.isClientFidele() ? "Oui" : "Non"},
                    {"Reference client", demande.getReferenceClient()}
            });
            ajouterSection(document, "Besoin produit", new String[][]{
                    {"Produit", demande.getProduitDemande()},
                    {"Purete du cuivre", formatNombre(demande.getPureteCuivre(), " %")},
                    {"Quantite", demande.getQuantite() == null ? null : demande.getQuantite().toString()},
                    {"Longueur", formatNombre(demande.getLongueur(), " mm")},
                    {"Largeur", formatNombre(demande.getLargeur(), " mm")},
                    {"Epaisseur", formatNombre(demande.getEpaisseur(), " mm")},
                    {"Besoin de livraison", demande.getBesoinLivraison()}
            });
            ajouterSection(document, "Informations complementaires", new String[][]{
                    {"Message", demande.getMessage()},
                    {"Fichier technique", demande.getFichierTechniqueNom()},
                    {"Lien du fichier", demande.getFichierTechniqueUrl()}
            });

            Paragraph footer = new Paragraph(
                    "G-ROD B2B Platform - Solutions cuivre et metaux",
                    FontFactory.getFont(FontFactory.HELVETICA, 9, Color.GRAY)
            );
            footer.setAlignment(Element.ALIGN_CENTER);
            footer.setSpacingBefore(20);
            document.add(footer);
        } catch (DocumentException exception) {
            throw new IllegalStateException("Impossible de generer le PDF de la demande", exception);
        } finally {
            document.close();
        }

        return output.toByteArray();
    }

    private void ajouterEntete(Document document, DemandeDevisResponseDTO demande)
            throws DocumentException {
        PdfPTable header = new PdfPTable(new float[]{1, 2});
        header.setWidthPercentage(100);
        header.setSpacingAfter(20);

        PdfPCell brandCell = new PdfPCell(new Phrase(
                "G-ROD",
                FontFactory.getFont(FontFactory.HELVETICA_BOLD, 22, Color.WHITE)
        ));
        brandCell.setBackgroundColor(GREEN);
        brandCell.setPadding(15);
        brandCell.setBorder(0);
        brandCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        header.addCell(brandCell);

        String reference = valeur(demande.getReferenceDemande(),
                demande.getId() == null ? "Demande de devis" : "Demande #" + demande.getId());
        String date = demande.getDateCreation() == null
                ? "-"
                : DATE_FORMAT.format(demande.getDateCreation());
        String statut = demande.getStatut() == null
                ? "-"
                : demande.getStatut().name().replace('_', ' ');

        Paragraph details = new Paragraph();
        details.add(new Phrase(
                "FICHE DEMANDE DE DEVIS\n",
                FontFactory.getFont(FontFactory.HELVETICA_BOLD, 15, GREEN)
        ));
        details.add(new Phrase(
                reference + "\nDate : " + date + "\nStatut : " + statut,
                FontFactory.getFont(FontFactory.HELVETICA, 10, Color.DARK_GRAY)
        ));

        PdfPCell detailsCell = new PdfPCell(details);
        detailsCell.setBackgroundColor(LIGHT_GREEN);
        detailsCell.setPadding(12);
        detailsCell.setBorder(0);
        header.addCell(detailsCell);

        document.add(header);
    }

    private void ajouterSection(Document document, String titre, String[][] lignes)
            throws DocumentException {
        Paragraph heading = new Paragraph(
                titre,
                FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, GREEN)
        );
        heading.setSpacingBefore(8);
        heading.setSpacingAfter(7);
        document.add(heading);

        PdfPTable table = new PdfPTable(new float[]{1.2f, 2.8f});
        table.setWidthPercentage(100);
        table.setSpacingAfter(10);

        boolean ligneAjoutee = false;
        for (String[] ligne : lignes) {
            if (!aUneValeur(ligne[1])) {
                continue;
            }

            table.addCell(creerCellule(ligne[0], true));
            table.addCell(creerCellule(ligne[1], false));
            ligneAjoutee = true;
        }

        if (ligneAjoutee) {
            document.add(table);
        } else {
            Paragraph empty = new Paragraph(
                    "Aucune information renseignee.",
                    FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 9, Color.GRAY)
            );
            empty.setSpacingAfter(10);
            document.add(empty);
        }
    }

    private PdfPCell creerCellule(String texte, boolean label) {
        Font font = FontFactory.getFont(
                label ? FontFactory.HELVETICA_BOLD : FontFactory.HELVETICA,
                9,
                Color.DARK_GRAY
        );
        PdfPCell cell = new PdfPCell(new Phrase(texte, font));
        cell.setPadding(8);
        cell.setBackgroundColor(label ? LIGHT_GRAY : Color.WHITE);
        cell.setBorderColor(new Color(215, 222, 217));
        cell.setVerticalAlignment(Element.ALIGN_TOP);
        return cell;
    }

    private String formatNombre(Double nombre, String unite) {
        if (nombre == null) {
            return null;
        }
        return String.format(Locale.US, "%.2f", nombre)
                .replaceAll("\\.?0+$", "") + unite;
    }

    private boolean aUneValeur(String valeur) {
        return valeur != null && !valeur.isBlank();
    }

    private String valeur(String valeur, String fallback) {
        return aUneValeur(valeur) ? valeur : fallback;
    }
}
