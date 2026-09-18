import os
import sys
from pathlib import Path

DEPS = Path(__file__).resolve().parents[1] / ".codex_deps"
sys.path.insert(0, str(DEPS))

from docx import Document
from docx.enum.section import WD_SECTION_START
from docx.enum.style import WD_STYLE_TYPE
from docx.enum.table import WD_ALIGN_VERTICAL, WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_BREAK, WD_LINE_SPACING
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Cm, Inches, Pt, RGBColor


ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "rapport"
OUT_FILE = OUT_DIR / "RAPPORT_PFE_GROD_VERSION_1_CORRIGEE.docx"
LOGO = ROOT / "grod-platform-frontend" / "public" / "grod-logo.png"
FLOW = ROOT / "grod-platform-frontend" / "public" / "documents" / "mcf-flow-chart-production.png"
FACTORY = ROOT / "grod-platform-frontend" / "public" / "images" / "process" / "process-hero-furnace-wide.jpg"
PROCESS_RECEPTION = ROOT / "grod-platform-frontend" / "public" / "images" / "process" / "process-reception.jpg"
PROCESS_LAB = ROOT / "grod-platform-frontend" / "public" / "images" / "process" / "process-lab.jpg"

GREEN = "006B3C"
DARK_GREEN = "003C2A"
COPPER = "B75A22"
LIGHT_GREEN = "EAF5EF"
LIGHT_COPPER = "F8EEE8"
LIGHT_GRAY = "F2F4F3"
MID_GRAY = "64706A"
BLACK = "111111"
WHITE = "FFFFFF"

# Preset: narrative_proposal.
# Named override academic_a4_grod: A4, 2.5 cm margins, Times New Roman 12 pt,
# justified 1.5-line body, G-ROD green/copper heading palette.
PAGE_WIDTH_DXA = 11907
PAGE_MARGIN_DXA = 1417
CONTENT_WIDTH_DXA = PAGE_WIDTH_DXA - 2 * PAGE_MARGIN_DXA
TABLE_INDENT_DXA = 120
CELL_MARGIN_DXA = {"top": 90, "bottom": 90, "start": 120, "end": 120}


def set_cell_shading(cell, fill):
    tc_pr = cell._tc.get_or_add_tcPr()
    shd = tc_pr.find(qn("w:shd"))
    if shd is None:
        shd = OxmlElement("w:shd")
        tc_pr.append(shd)
    shd.set(qn("w:fill"), fill)


def set_cell_margins(cell):
    tc_pr = cell._tc.get_or_add_tcPr()
    tc_mar = tc_pr.first_child_found_in("w:tcMar")
    if tc_mar is None:
        tc_mar = OxmlElement("w:tcMar")
        tc_pr.append(tc_mar)
    for edge, value in CELL_MARGIN_DXA.items():
        tag = "start" if edge == "start" else "end" if edge == "end" else edge
        node = tc_mar.find(qn(f"w:{tag}"))
        if node is None:
            node = OxmlElement(f"w:{tag}")
            tc_mar.append(node)
        node.set(qn("w:w"), str(value))
        node.set(qn("w:type"), "dxa")


def set_table_geometry(table, widths_dxa):
    if sum(widths_dxa) != CONTENT_WIDTH_DXA:
        raise ValueError(f"Table widths must sum to {CONTENT_WIDTH_DXA}: {widths_dxa}")
    table.autofit = False
    table.alignment = WD_TABLE_ALIGNMENT.LEFT
    tbl_pr = table._tbl.tblPr
    tbl_w = tbl_pr.find(qn("w:tblW"))
    if tbl_w is None:
        tbl_w = OxmlElement("w:tblW")
        tbl_pr.append(tbl_w)
    tbl_w.set(qn("w:w"), str(CONTENT_WIDTH_DXA))
    tbl_w.set(qn("w:type"), "dxa")
    tbl_ind = tbl_pr.find(qn("w:tblInd"))
    if tbl_ind is None:
        tbl_ind = OxmlElement("w:tblInd")
        tbl_pr.append(tbl_ind)
    tbl_ind.set(qn("w:w"), str(TABLE_INDENT_DXA))
    tbl_ind.set(qn("w:type"), "dxa")
    layout = tbl_pr.find(qn("w:tblLayout"))
    if layout is None:
        layout = OxmlElement("w:tblLayout")
        tbl_pr.append(layout)
    layout.set(qn("w:type"), "fixed")
    grid = table._tbl.tblGrid
    for child in list(grid):
        grid.remove(child)
    for width in widths_dxa:
        col = OxmlElement("w:gridCol")
        col.set(qn("w:w"), str(width))
        grid.append(col)
    for row in table.rows:
        for idx, cell in enumerate(row.cells):
            cell.width = Inches(widths_dxa[idx] / 1440)
            tc_pr = cell._tc.get_or_add_tcPr()
            tc_w = tc_pr.find(qn("w:tcW"))
            if tc_w is None:
                tc_w = OxmlElement("w:tcW")
                tc_pr.append(tc_w)
            tc_w.set(qn("w:w"), str(widths_dxa[idx]))
            tc_w.set(qn("w:type"), "dxa")
            cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
            set_cell_margins(cell)


def set_repeat_table_header(row):
    tr_pr = row._tr.get_or_add_trPr()
    tbl_header = OxmlElement("w:tblHeader")
    tbl_header.set(qn("w:val"), "true")
    tr_pr.append(tbl_header)


def set_font(run, name="Times New Roman", size=None, color=None, bold=None, italic=None):
    run.font.name = name
    run._element.get_or_add_rPr().rFonts.set(qn("w:ascii"), name)
    run._element.get_or_add_rPr().rFonts.set(qn("w:hAnsi"), name)
    run._element.get_or_add_rPr().rFonts.set(qn("w:eastAsia"), name)
    if size is not None:
        run.font.size = Pt(size)
    if color is not None:
        run.font.color.rgb = RGBColor.from_string(color)
    if bold is not None:
        run.bold = bold
    if italic is not None:
        run.italic = italic


def add_field(paragraph, field_code, placeholder=""):
    fld = OxmlElement("w:fldSimple")
    fld.set(qn("w:instr"), field_code)
    run = OxmlElement("w:r")
    text = OxmlElement("w:t")
    text.text = placeholder
    run.append(text)
    fld.append(run)
    paragraph._p.append(fld)


def configure_styles(doc):
    styles = doc.styles
    normal = styles["Normal"]
    normal.font.name = "Times New Roman"
    normal._element.rPr.rFonts.set(qn("w:ascii"), "Times New Roman")
    normal._element.rPr.rFonts.set(qn("w:hAnsi"), "Times New Roman")
    normal.font.size = Pt(12)
    normal.font.color.rgb = RGBColor.from_string(BLACK)
    normal.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    normal.paragraph_format.space_before = Pt(0)
    normal.paragraph_format.space_after = Pt(6)
    normal.paragraph_format.line_spacing = 1.5

    title = styles["Title"]
    title.font.name = "Times New Roman"
    title.font.size = Pt(26)
    title.font.bold = True
    title.font.color.rgb = RGBColor.from_string(DARK_GREEN)
    title.paragraph_format.space_after = Pt(12)
    title.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.CENTER

    heading_tokens = {
        "Heading 1": (18, GREEN, 18, 10),
        "Heading 2": (15, GREEN, 12, 6),
        "Heading 3": (13, COPPER, 8, 4),
    }
    for name, (size, color, before, after) in heading_tokens.items():
        style = styles[name]
        style.font.name = "Times New Roman"
        style._element.rPr.rFonts.set(qn("w:ascii"), "Times New Roman")
        style._element.rPr.rFonts.set(qn("w:hAnsi"), "Times New Roman")
        style.font.size = Pt(size)
        style.font.bold = True
        style.font.color.rgb = RGBColor.from_string(color)
        style.paragraph_format.space_before = Pt(before)
        style.paragraph_format.space_after = Pt(after)
        style.paragraph_format.keep_with_next = True

    for name in ("List Bullet", "List Number"):
        style = styles[name]
        style.font.name = "Times New Roman"
        style.font.size = Pt(12)
        style.paragraph_format.left_indent = Inches(0.5)
        style.paragraph_format.first_line_indent = Inches(-0.25)
        style.paragraph_format.space_after = Pt(4)
        style.paragraph_format.line_spacing = 1.2

    caption = styles["Caption"]
    caption.font.name = "Times New Roman"
    caption.font.size = Pt(10)
    caption.font.italic = True
    caption.font.color.rgb = RGBColor.from_string(MID_GRAY)
    caption.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.CENTER
    caption.paragraph_format.space_before = Pt(4)
    caption.paragraph_format.space_after = Pt(10)

    for style_name, fill, color in (
        ("Placeholder", LIGHT_COPPER, COPPER),
        ("Code Block", LIGHT_GRAY, DARK_GREEN),
    ):
        if style_name not in styles:
            style = styles.add_style(style_name, WD_STYLE_TYPE.PARAGRAPH)
        else:
            style = styles[style_name]
        style.font.name = "Consolas" if style_name == "Code Block" else "Times New Roman"
        style.font.size = Pt(9.5 if style_name == "Code Block" else 10.5)
        style.font.color.rgb = RGBColor.from_string(color)
        style.paragraph_format.space_before = Pt(5)
        style.paragraph_format.space_after = Pt(7)
        style.paragraph_format.left_indent = Cm(0.35)
        style.paragraph_format.right_indent = Cm(0.35)
        style._element.get_or_add_pPr().append(make_shading(fill))


def make_shading(fill):
    shd = OxmlElement("w:shd")
    shd.set(qn("w:fill"), fill)
    return shd


def configure_sections(doc):
    for section in doc.sections:
        section.page_width = Cm(21)
        section.page_height = Cm(29.7)
        section.top_margin = Cm(2.5)
        section.bottom_margin = Cm(2.5)
        section.left_margin = Cm(2.5)
        section.right_margin = Cm(2.5)
        section.header_distance = Cm(1.25)
        section.footer_distance = Cm(1.25)
        section.different_first_page_header_footer = True


def configure_header_footer(section):
    header = section.header
    p = header.paragraphs[0]
    p.alignment = WD_ALIGN_PARAGRAPH.LEFT
    p.paragraph_format.space_after = Pt(0)
    r = p.add_run("RAPPORT DE PROJET DE FIN D'ÉTUDES  |  G-ROD")
    set_font(r, name="Arial", size=8.5, color=MID_GRAY, bold=True)
    p_pr = p._p.get_or_add_pPr()
    p_bdr = OxmlElement("w:pBdr")
    bottom = OxmlElement("w:bottom")
    bottom.set(qn("w:val"), "single")
    bottom.set(qn("w:sz"), "6")
    bottom.set(qn("w:space"), "4")
    bottom.set(qn("w:color"), COPPER)
    p_bdr.append(bottom)
    p_pr.append(p_bdr)

    footer = section.footer
    p = footer.paragraphs[0]
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(0)
    r = p.add_run("G-ROD — Morocco Copper Foundry     |     Page ")
    set_font(r, name="Arial", size=8.5, color=MID_GRAY)
    add_field(p, "PAGE", "1")


def add_body(doc, text, bold_lead=None):
    p = doc.add_paragraph()
    if bold_lead and text.startswith(bold_lead):
        r = p.add_run(bold_lead)
        set_font(r, bold=True)
        r = p.add_run(text[len(bold_lead):])
        set_font(r)
    else:
        r = p.add_run(text)
        set_font(r)
    return p


def add_bullets(doc, items):
    for item in items:
        p = doc.add_paragraph(style="List Bullet")
        r = p.add_run(item)
        set_font(r)


def add_numbered(doc, items):
    for item in items:
        p = doc.add_paragraph(style="List Number")
        r = p.add_run(item)
        set_font(r)


def add_placeholder(doc, text):
    p = doc.add_paragraph(style="Placeholder")
    p.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.LEFT
    r = p.add_run("À COMPLÉTER — " + text)
    set_font(r, size=10.5, color=COPPER, bold=True)
    return p


def add_code(doc, lines):
    p = doc.add_paragraph(style="Code Block")
    p.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.LEFT
    r = p.add_run("\n".join(lines))
    set_font(r, name="Consolas", size=9.5, color=DARK_GREEN)
    return p


def add_table(doc, headers, rows, widths, caption=None, header_fill=DARK_GREEN):
    if caption:
        p = doc.add_paragraph(caption, style="Caption")
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    table = doc.add_table(rows=1, cols=len(headers))
    table.style = "Table Grid"
    table.alignment = WD_TABLE_ALIGNMENT.LEFT
    header = table.rows[0]
    set_repeat_table_header(header)
    for idx, text in enumerate(headers):
        cell = header.cells[idx]
        set_cell_shading(cell, header_fill)
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.space_after = Pt(0)
        r = p.add_run(str(text))
        set_font(r, name="Arial", size=9, color=WHITE, bold=True)
    for row_idx, row_data in enumerate(rows):
        cells = table.add_row().cells
        for idx, text in enumerate(row_data):
            if row_idx % 2:
                set_cell_shading(cells[idx], "F7FAF8")
            p = cells[idx].paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.LEFT
            p.paragraph_format.space_after = Pt(0)
            p.paragraph_format.line_spacing = 1.08
            r = p.add_run(str(text))
            set_font(r, size=9.3)
    set_table_geometry(table, widths)
    doc.add_paragraph().paragraph_format.space_after = Pt(2)
    return table


def add_picture(doc, path, width_cm, caption, alt_text):
    if not path.exists():
        add_placeholder(doc, f"Illustration manquante : {caption}")
        return
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = p.add_run()
    shape = run.add_picture(str(path), width=Cm(width_cm))
    doc_pr = shape._inline.docPr
    doc_pr.set("descr", alt_text)
    cap = doc.add_paragraph(caption, style="Caption")
    cap.alignment = WD_ALIGN_PARAGRAPH.CENTER


def add_chapter_title(doc, number, title, purpose):
    doc.add_page_break()
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(80)
    p.paragraph_format.space_after = Pt(12)
    r = p.add_run(f"CHAPITRE {number}")
    set_font(r, name="Arial", size=12, color=COPPER, bold=True)
    p = doc.add_paragraph(style="Title")
    r = p.add_run(title)
    set_font(r, size=25, color=DARK_GREEN, bold=True)
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_after = Pt(28)
    r = p.add_run(purpose)
    set_font(r, size=12, color=MID_GRAY, italic=True)
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = p.add_run("●")
    set_font(r, name="Arial", size=14, color=COPPER)
    doc.add_page_break()


def add_section_heading(doc, text, level=1):
    return doc.add_paragraph(text, style=f"Heading {level}")


def add_chapter_conclusion(doc, number, text):
    add_section_heading(doc, f"Conclusion du chapitre {number}", 2)
    add_body(doc, text)


doc = Document()
configure_styles(doc)
configure_sections(doc)
configure_header_footer(doc.sections[0])

# Cover page — editorial_cover pattern, adapted to an academic report.
p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
p.paragraph_format.space_after = Pt(18)
r = p.add_run("[NOM DE L'ÉCOLE]")
set_font(r, name="Arial", size=14, color=DARK_GREEN, bold=True)
p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
r = p.add_run("Rapport de projet de fin d'études")
set_font(r, name="Arial", size=13, color=MID_GRAY, bold=True)

if LOGO.exists():
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(32)
    p.paragraph_format.space_after = Pt(26)
    cover_logo = p.add_run().add_picture(str(LOGO), width=Cm(6.2))
    cover_logo._inline.docPr.set("descr", "Logo de la marque industrielle G-ROD")

p = doc.add_paragraph(style="Title")
r = p.add_run("Conception et développement d'une plateforme web B2B pour G-ROD")
set_font(r, size=25, color=DARK_GREEN, bold=True)
p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
p.paragraph_format.space_after = Pt(28)
r = p.add_run("Catalogue industriel, demandes commerciales et espace d'administration")
set_font(r, name="Arial", size=13, color=COPPER, italic=True)

add_table(
    doc,
    ["Réalisé par", "Encadrement"],
    [
        ("[NOM COMPLET]\n[FILIÈRE — NIVEAU]", "Encadrant pédagogique : [NOM]\nEncadrant entreprise : [NOM]"),
        ("Entreprise d'accueil", "Morocco Copper Foundry — G-ROD"),
    ],
    [4536, 4537],
    header_fill=DARK_GREEN,
)
p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
p.paragraph_format.space_before = Pt(22)
r = p.add_run("Année universitaire : [20XX / 20XX]")
set_font(r, name="Arial", size=11, color=MID_GRAY, bold=True)
doc.add_page_break()

add_section_heading(doc, "Remerciements", 1)
add_placeholder(doc, "Personnaliser les remerciements avec les noms des encadrants, de l'équipe et de l'établissement.")
add_body(doc, "Je tiens à exprimer ma sincère gratitude à toutes les personnes qui ont contribué à la réalisation de ce projet de fin d'études. Je remercie tout particulièrement mon encadrant en entreprise pour son accompagnement, ses remarques et la confiance accordée durant la conception de la plateforme G-ROD.")
add_body(doc, "Mes remerciements s'adressent également à mon encadrant pédagogique ainsi qu'à l'ensemble du corps professoral pour les connaissances transmises au cours de ma formation. Enfin, je remercie ma famille et mes proches pour leur soutien constant tout au long de ce parcours.")
doc.add_page_break()

add_section_heading(doc, "Résumé", 1)
add_body(doc, "Ce projet de fin d'études porte sur la conception et le développement d'une plateforme web B2B destinée à Morocco Copper Foundry, présentée sous la marque G-ROD. La solution répond au besoin de disposer d'une vitrine numérique moderne pour valoriser une gamme de produits en cuivre, recevoir les demandes de devis et de documents techniques, puis centraliser leur traitement dans un espace d'administration sécurisé.")
add_body(doc, "La plateforme comprend un site public responsive, un catalogue dynamique, des fiches produits, des aperçus tridimensionnels, un espace documentaire et plusieurs formulaires de contact. L'espace administrateur permet de suivre les demandes dans un pipeline commercial, de gérer les produits, les clients, les documents et les notifications. Le backend est réalisé avec Java 21 et Spring Boot, le frontend avec React et Vite, et les données sont persistées dans MySQL. La sécurité repose notamment sur Spring Security, l'authentification JWT, le chiffrement BCrypt, la limitation de requêtes et une option Passkey/WebAuthn.")
add_body(doc, "La qualité de la solution est vérifiée par des tests unitaires, d'intégration et de bout en bout exécutés avec Maven, H2 et Playwright. Les résultats obtenus montrent une solution fonctionnelle, cohérente et préparée pour un déploiement derrière Nginx, tout en identifiant des perspectives telles que la modularisation avancée du frontend et l'automatisation complète du déploiement.")
p = doc.add_paragraph()
r = p.add_run("Mots-clés : ")
set_font(r, bold=True, color=DARK_GREEN)
r = p.add_run("plateforme B2B, cuivre, React, Spring Boot, MySQL, catalogue, administration, sécurité, visualisation 3D.")
set_font(r)
doc.add_page_break()

add_section_heading(doc, "Abstract", 1)
add_body(doc, "This final-year project focuses on the design and development of a B2B web platform for Morocco Copper Foundry under the G-ROD brand. The solution provides a modern digital showcase for copper products, collects quotation and technical-document requests, and centralizes their processing through a secure administration area.")
add_body(doc, "The platform includes a responsive public website, a dynamic catalog, detailed product pages, three-dimensional previews, a technical-resource area, and business request forms. The administration workspace supports request tracking through a commercial pipeline as well as product, client, document, and notification management. The backend is built with Java 21 and Spring Boot, the frontend uses React and Vite, and business data is stored in MySQL. Security mechanisms include Spring Security, JWT authentication, BCrypt password hashing, rate limiting, and optional Passkey/WebAuthn authentication.")
add_body(doc, "Quality assurance relies on unit, integration, and end-to-end tests executed with Maven, H2, and Playwright. The resulting release candidate is functional and prepared for deployment behind Nginx. Future improvements include further frontend modularization and a fully automated continuous-delivery pipeline.")
p = doc.add_paragraph()
r = p.add_run("Keywords: ")
set_font(r, bold=True, color=DARK_GREEN)
r = p.add_run("B2B platform, copper, React, Spring Boot, MySQL, catalog, administration, security, 3D visualization.")
set_font(r)
doc.add_page_break()

add_section_heading(doc, "Table des matières", 1)
p = doc.add_paragraph()
add_field(p, 'TOC \\o "1-3" \\h \\z \\u', "Mettre à jour la table des matières dans Word avec Ctrl+A puis F9.")
doc.add_page_break()

add_section_heading(doc, "Table des figures", 1)
for item in [
    "Figure 1.1 — Identité visuelle G-ROD",
    "Figure 1.2 — Schéma de production de Morocco Copper Foundry",
    "Figure 1.3 — Illustration de l'environnement industriel",
    "Figure 4.1 — Réception et tri des matières premières",
    "Figure 4.2 — Contrôle en laboratoire",
]:
    add_body(doc, item)
add_placeholder(doc, "Ajouter les captures d'écran finales de l'application et actualiser cette liste.")
doc.add_page_break()

add_section_heading(doc, "Liste des tableaux", 1)
for item in [
    "Tableau 2.1 — Acteurs et responsabilités",
    "Tableau 2.2 — Besoins fonctionnels du site public",
    "Tableau 2.3 — Besoins fonctionnels de l'administration",
    "Tableau 2.4 — Exigences non fonctionnelles",
    "Tableau 2.5 — Planification par phases",
    "Tableau 2.6 — Principaux risques du projet",
    "Tableau 3.1 — Comparaison des choix techniques",
    "Tableau 3.2 — Principaux cas d'utilisation",
    "Tableau 3.3 — Entités métier",
    "Tableau 4.1 — Technologies et outils",
    "Tableau 4.2 — Synthèse des tests",
]:
    add_body(doc, item)
doc.add_page_break()

add_section_heading(doc, "Liste des acronymes", 1)
add_table(doc, ["Acronyme", "Signification"], [
    ("API", "Application Programming Interface"),
    ("B2B", "Business to Business"),
    ("CRUD", "Create, Read, Update, Delete"),
    ("DTO", "Data Transfer Object"),
    ("HTTP", "Hypertext Transfer Protocol"),
    ("JWT", "JSON Web Token"),
    ("MCF", "Morocco Copper Foundry"),
    ("ORM", "Object-Relational Mapping"),
    ("PDF", "Portable Document Format"),
    ("PWA", "Progressive Web Application"),
    ("REST", "Representational State Transfer"),
    ("SPA", "Single Page Application"),
    ("UML", "Unified Modeling Language"),
    ("WebAuthn", "Web Authentication API"),
], [1800, 7273], caption=None)
doc.add_page_break()

add_section_heading(doc, "Introduction générale", 1)
add_body(doc, "La transformation numérique touche désormais l'ensemble des secteurs industriels. Pour une entreprise opérant sur un marché B2B, la qualité de la présence numérique ne se limite plus à présenter une activité : elle doit faciliter l'accès à l'information technique, structurer la prise de contact, accélérer le traitement des demandes et garantir la cohérence des données partagées avec les prospects et les clients.")
add_body(doc, "Morocco Copper Foundry s'inscrit dans une dynamique industrielle fondée sur la valorisation du cuivre recyclé. Dans ce contexte, la marque G-ROD avait besoin d'une plateforme capable de présenter son identité, ses engagements, ses procédés et sa gamme de produits, tout en offrant des parcours concrets de demande de devis et de documentation. Le projet devait également proposer à l'équipe interne un espace unique pour administrer le catalogue et suivre les interactions commerciales.")
add_body(doc, "La problématique centrale peut ainsi être formulée de la manière suivante : comment concevoir une plateforme web moderne, sécurisée et évolutive permettant à G-ROD de valoriser son offre industrielle et de centraliser le cycle de traitement des demandes clients ? La réponse apportée repose sur une application web responsive comprenant un site public et un espace administrateur, reliés à une API métier et à une base de données relationnelle.")
add_body(doc, "Le travail a été conduit de manière itérative : analyse de l'existant, définition des parcours, développement progressif des modules, amélioration de l'expérience utilisateur, renforcement de la sécurité, automatisation des tests et préparation du déploiement. Cette démarche a permis de faire évoluer la solution tout en vérifiant régulièrement son fonctionnement sur plusieurs tailles d'écran.")
add_body(doc, "Le présent rapport est organisé en quatre chapitres. Le premier présente l'entreprise et le contexte industriel. Le deuxième expose la problématique, les besoins et l'organisation du projet. Le troisième décrit l'étude technique et la conception. Enfin, le quatrième détaille la réalisation, les fonctionnalités obtenues, la stratégie de tests et la préparation du déploiement.")

# Chapter 1
add_chapter_title(doc, "1", "Contexte général et environnement du projet", "Présenter Morocco Copper Foundry, son activité et le positionnement de la plateforme G-ROD.")
add_section_heading(doc, "1.1 Présentation de l'entreprise", 1)
add_body(doc, "Morocco Copper Foundry, abrégée MCF, est une entreprise marocaine spécialisée dans la valorisation des métaux non ferreux, avec un positionnement centré sur le cuivre recyclé. La communication institutionnelle de G-ROD présente une ambition industrielle associant performance, innovation, responsabilité environnementale et création de valeur au Maroc.")
add_picture(doc, LOGO, 7.0, "Figure 1.1 — Identité visuelle G-ROD", "Logo de la marque industrielle G-ROD")

add_section_heading(doc, "1.1.1 Historique et implantation", 2)
add_body(doc, "Le projet industriel trouve son origine dans la volonté de structurer une filière nationale de valorisation des métaux non ferreux. La documentation institutionnelle situe la création de MCF en 2020 et son implantation à Youssoufia. L'entreprise vise à transformer une ressource recyclable en produits industriels répondant aux besoins des marchés locaux et internationaux.")
add_body(doc, "La trajectoire présentée par l'entreprise associe une montée en production progressive, le développement de produits issus du cuivre recyclé et une perspective d'extension de capacité. Les informations chiffrées et les échéances futures devront être confirmées par l'encadrant avant la version finale du rapport.")
add_placeholder(doc, "Faire valider par l'entreprise les dates, chiffres d'investissement, capacités et projections avant dépôt final.")

add_section_heading(doc, "1.1.2 Domaine d'activité", 2)
add_body(doc, "MCF intervient dans la transformation et la valorisation du cuivre. Son approche participe à l'économie circulaire en donnant une nouvelle valeur à des matières recyclables et en réduisant le recours aux matières premières vierges. Le cuivre constitue une ressource stratégique pour les réseaux électriques, les énergies renouvelables, les câbles, les équipements industriels, le bâtiment et les infrastructures.")
add_body(doc, "L'activité couvre notamment la réception des matières premières, leur tri, le contrôle du poids, la transformation métallurgique, le contrôle de conformité, le stockage et l'expédition. Cette chaîne industrielle explique l'importance d'une communication technique fiable : les caractéristiques, dimensions, normes, conditionnements et disponibilités doivent être présentés avec prudence et confirmés selon les lots et les demandes.")

add_section_heading(doc, "1.1.3 Gamme de produits", 2)
add_body(doc, "La gamme présentée sur la plateforme comprend huit familles de produits : Copper Rod, Copper Anodes, Copper Bus Bars, Copper Flat Bars, Copper Tubes, Copper Sheets, Copper Wire et Custom Copper Parts. Chaque famille répond à des usages électriques, industriels, métallurgiques ou de fabrication sur mesure.")
add_table(doc, ["Produit", "Positionnement fonctionnel"], [
    ("Copper Rod", "Barres rondes en cuivre destinées aux applications électriques et industrielles."),
    ("Copper Anodes", "Anodes pour procédés électrolytiques et métallurgiques."),
    ("Copper Bus Bars", "Barres conductrices pour tableaux et installations électriques."),
    ("Copper Flat Bars", "Méplats adaptés aux usages électriques et techniques."),
    ("Copper Tubes", "Tubes pour plomberie, climatisation et installations industrielles."),
    ("Copper Sheets", "Feuilles et plaques pour fabrication, revêtement et électricité."),
    ("Copper Wire", "Fil conducteur pour câbles, bobinages et connexions."),
    ("Custom Copper Parts", "Pièces sur mesure réalisées selon un besoin ou un plan technique."),
], [2500, 6573], caption="Tableau 1.1 — Gamme de produits présentée sur la plateforme")

add_section_heading(doc, "1.1.4 Valeurs et positionnement", 2)
add_body(doc, "Le positionnement institutionnel met en avant l'intégrité, l'innovation, la durabilité, l'excellence, l'engagement social et la collaboration. Ces valeurs se traduisent dans la plateforme par une identité visuelle industrielle, une information structurée, des parcours simples et une attention particulière portée à la protection des données transmises par les visiteurs.")

add_section_heading(doc, "1.2 Contexte de transformation numérique", 1)
add_body(doc, "Avant la mise en place d'une plateforme structurée, la présentation commerciale et le traitement des demandes peuvent être dispersés entre des échanges informels, des fichiers et plusieurs canaux de communication. Cette dispersion rend plus difficile la mise à jour du catalogue, la recherche d'une demande, le suivi d'un client et la conservation d'un historique exploitable.")
add_body(doc, "La plateforme G-ROD répond à ce contexte par un point d'entrée public unique et un espace interne dédié. Le site public informe, oriente et collecte. L'espace administrateur centralise, qualifie et traite. Cette séparation des responsabilités améliore la lisibilité de l'expérience et limite l'exposition des fonctions sensibles.")

add_section_heading(doc, "1.3 Positionnement du projet", 1)
add_body(doc, "Le projet se situe à l'intersection de la communication institutionnelle, de la gestion de catalogue et du suivi commercial. Il ne s'agit pas uniquement d'un site vitrine : la solution gère des données métier, des statuts, des documents, des notifications et des accès authentifiés.")
add_bullets(doc, [
    "valoriser l'identité et les engagements industriels de G-ROD ;",
    "rendre le catalogue accessible et compréhensible ;",
    "faciliter les demandes de devis et de documents techniques ;",
    "donner à l'équipe administrative une vision consolidée de l'activité ;",
    "garantir la sécurité et la traçabilité des opérations sensibles ;",
    "préparer une architecture exploitable en environnement de production.",
])

add_section_heading(doc, "1.4 Processus industriel représenté", 1)
add_body(doc, "La plateforme comporte une page consacrée au processus de production. Elle relie l'image institutionnelle au parcours numérique et permet de présenter les grandes étapes allant de la réception des matières à l'expédition des produits finis.")
add_picture(doc, FLOW, 16.0, "Figure 1.2 — Schéma de production de Morocco Copper Foundry", "Schéma des étapes de production du cuivre chez MCF")
add_picture(doc, FACTORY, 15.5, "Figure 1.3 — Illustration de l'environnement industriel", "Vue d'une installation industrielle liée au cuivre")

add_section_heading(doc, "1.5 Apports attendus", 1)
add_body(doc, "Pour l'entreprise, le principal apport réside dans la centralisation : l'information produit, les demandes commerciales, les demandes documentaires et les actions administratives sont regroupées dans une seule solution. Pour les clients, le bénéfice est un accès plus rapide aux produits, aux documents publics et aux formulaires adaptés. Pour le projet de fin d'études, cette plateforme constitue un cas complet mobilisant conception d'interfaces, développement full stack, sécurité, persistance, gestion de fichiers, tests et préparation au déploiement.")
add_chapter_conclusion(doc, "1", "Ce chapitre a présenté l'environnement industriel de G-ROD et les motivations de la transformation numérique. Le chapitre suivant formalise la problématique, les acteurs, les besoins et la démarche de réalisation.")

# Chapter 2
add_chapter_title(doc, "2", "Analyse de l'existant et cadrage du projet", "Transformer le besoin métier en exigences vérifiables et organiser la réalisation.")
add_section_heading(doc, "2.1 Problématique identifiée", 1)
add_body(doc, "L'entreprise doit présenter une offre industrielle comportant plusieurs familles de produits et de nombreuses caractéristiques techniques. Elle doit parallèlement recevoir des demandes provenant de prospects, distinguer les demandes de devis des demandes documentaires, suivre leur statut et conserver un historique par client. L'objectif est donc de concevoir une solution accessible au public sans compromettre les fonctions de gestion réservées à l'administrateur.")
add_body(doc, "La problématique a été décomposée en trois axes : l'expérience publique, le pilotage administratif et la fiabilité technique. L'expérience publique doit être claire sur ordinateur, tablette et mobile. Le pilotage administratif doit rester efficace lorsque le volume de données augmente. La fiabilité technique doit couvrir l'authentification, la validation, les fichiers, les erreurs, les sauvegardes et les tests.")

add_section_heading(doc, "2.2 Analyse de l'existant", 1)
add_body(doc, "L'analyse de l'existant a mis en évidence le besoin d'une présentation plus cohérente des produits, d'une meilleure visibilité sur le statut des demandes et d'un point central pour administrer les contenus. La conception a donc retenu deux espaces complémentaires : un site public orienté visiteurs et un espace administrateur orienté traitement métier.")
add_placeholder(doc, "Décrire ici, avec l'encadrant, l'ancien processus réel : téléphone, courriel, documents Excel, site antérieur ou absence de système.")

add_section_heading(doc, "2.3 Acteurs du système", 1)
add_table(doc, ["Acteur", "Responsabilités principales", "Niveau d'accès"], [
    ("Visiteur", "Consulter les pages publiques, le catalogue, les ressources et le processus.", "Public"),
    ("Prospect / client", "Envoyer une demande de devis ou de document et joindre un plan si nécessaire.", "Public avec validation"),
    ("Administrateur", "Gérer le catalogue, traiter les demandes, consulter les clients, publier les ressources et suivre les notifications.", "Authentifié"),
], [1750, 5123, 2200], caption="Tableau 2.1 — Acteurs et responsabilités")

add_section_heading(doc, "2.4 Besoins fonctionnels", 1)
add_section_heading(doc, "2.4.1 Site public", 2)
add_table(doc, ["Identifiant", "Besoin", "Priorité"], [
    ("FP-01", "Présenter l'entreprise, ses valeurs, son processus et ses partenaires.", "Haute"),
    ("FP-02", "Afficher les produits actifs issus de la base de données.", "Haute"),
    ("FP-03", "Rechercher, filtrer et trier le catalogue.", "Haute"),
    ("FP-04", "Consulter une fiche produit et un aperçu 3D lorsqu'il est disponible.", "Haute"),
    ("FP-05", "Envoyer une demande de devis avec informations et pièce jointe optionnelle.", "Haute"),
    ("FP-06", "Consulter ou demander un document technique.", "Haute"),
    ("FP-07", "Utiliser une recherche rapide fondée sur les pages et données disponibles.", "Moyenne"),
    ("FP-08", "Utiliser la plateforme sur mobile et l'installer comme PWA lorsque le navigateur le permet.", "Moyenne"),
], [1300, 6073, 1700], caption="Tableau 2.2 — Besoins fonctionnels du site public")

add_section_heading(doc, "2.4.2 Espace administrateur", 2)
add_table(doc, ["Identifiant", "Besoin", "Priorité"], [
    ("FA-01", "Authentifier l'administrateur et protéger les routes sensibles.", "Critique"),
    ("FA-02", "Présenter un tableau de bord fondé sur les données réelles.", "Haute"),
    ("FA-03", "Traiter, filtrer et paginer les demandes commerciales.", "Haute"),
    ("FA-04", "Gérer les produits, leurs images, leurs caractéristiques et leur état actif.", "Haute"),
    ("FA-05", "Consulter les clients et leur historique de demandes.", "Haute"),
    ("FA-06", "Traiter les demandes de documents et publier les ressources techniques.", "Haute"),
    ("FA-07", "Afficher des notifications persistantes avec état lu/non lu.", "Haute"),
    ("FA-08", "Gérer le mot de passe, les préférences et l'authentification Passkey.", "Moyenne"),
    ("FA-09", "Adapter la sidebar au desktop et au mobile sans dupliquer la logique.", "Moyenne"),
], [1300, 6073, 1700], caption="Tableau 2.3 — Besoins fonctionnels de l'administration")

add_section_heading(doc, "2.5 Exigences non fonctionnelles", 1)
add_table(doc, ["Catégorie", "Exigence vérifiable"], [
    ("Sécurité", "Authentification, mots de passe chiffrés, autorisations, validation et protection des fichiers."),
    ("Performance", "Pagination côté serveur pour les listes volumineuses et chargement différé des scènes 3D."),
    ("Ergonomie", "Navigation cohérente, feedback d'erreur, filtres lisibles et design responsive."),
    ("Maintenabilité", "Séparation frontend/backend et organisation backend par couches."),
    ("Fiabilité", "Migrations Flyway, initialisation idempotente, sauvegarde et restauration documentées."),
    ("Testabilité", "Tests backend et scénarios navigateur isolés de la base métier."),
    ("Déployabilité", "Build reproductible et modèles Nginx/systemd pour un serveur Linux."),
], [2200, 6873], caption="Tableau 2.4 — Exigences non fonctionnelles")

add_section_heading(doc, "2.6 Périmètre du projet", 1)
add_body(doc, "Le périmètre livré couvre le site web public, l'administration, l'API REST, la base MySQL, la gestion locale des fichiers, les notifications internes, l'envoi externe optionnel par courriel ou SMS, la visualisation 3D, les tests et les éléments de déploiement. La solution n'est pas une application mobile native ; elle est responsive et installable comme application web progressive lorsque les conditions du navigateur sont réunies.")
add_body(doc, "Les fonctions de paiement, de commande en ligne, de facturation, de gestion de stock industriel ou d'intégration avec un ERP ne font pas partie de cette version. Cette délimitation évite de confondre la gestion des demandes commerciales avec un système transactionnel complet.")

add_section_heading(doc, "2.7 Méthodologie de travail", 1)
add_body(doc, "La réalisation a suivi une démarche itérative inspirée des méthodes agiles. Chaque étape a associé observation, correction ciblée et vérification. Les retours visuels ont permis d'améliorer progressivement les pages publiques et administratives, tandis que les recettes techniques ont guidé le renforcement du backend, de la sécurité, de la pagination et du déploiement.")
add_numbered(doc, [
    "Analyser l'existant et identifier les besoins prioritaires.",
    "Mettre en place l'architecture frontend, backend et base de données.",
    "Développer les parcours publics et les fonctions administratives.",
    "Corriger les incohérences fonctionnelles et visuelles observées.",
    "Renforcer la sécurité, la gestion des fichiers et la persistance.",
    "Ajouter des tests automatisés et effectuer une recette responsive.",
    "Préparer la sauvegarde, le déploiement et une Release Candidate.",
])

add_section_heading(doc, "2.8 Planification", 1)
add_table(doc, ["Phase", "Livrables", "Période"], [
    ("1. Cadrage", "Besoins, acteurs, périmètre et architecture initiale.", "[À compléter]"),
    ("2. Site public", "Accueil, catalogue, fiches produits, processus et ressources.", "[À compléter]"),
    ("3. API métier", "Entités, repositories, services, contrôleurs et base MySQL.", "[À compléter]"),
    ("4. Administration", "Dashboard, demandes, clients, produits, documents et ressources.", "[À compléter]"),
    ("5. Fonctions avancées", "Notifications, Passkey, 3D, PWA, recherche et responsive.", "[À compléter]"),
    ("6. Fiabilisation", "Sécurité, pagination, fichiers, tests, sauvegarde et déploiement.", "[À compléter]"),
    ("7. Livraison", "Recette, documentation et Release Candidate.", "[À compléter]"),
], [1900, 5273, 1900], caption="Tableau 2.5 — Planification par phases")
add_placeholder(doc, "Remplacer les périodes par les dates réelles du stage et ajouter le diagramme de Gantt final.")

add_section_heading(doc, "2.9 Gestion des risques et confidentialité", 1)
add_table(doc, ["Risque", "Impact", "Mesure appliquée"], [
    ("Accès non autorisé", "Exposition des données Admin", "Spring Security, JWT et routes protégées."),
    ("Mot de passe compromis", "Usurpation du compte", "BCrypt, changement contrôlé et Passkey optionnelle."),
    ("Upload dangereux", "Fichier invalide ou trop volumineux", "Validation du type, de la taille et stockage contrôlé."),
    ("Surcharge d'un endpoint public", "Dégradation du service", "Rate limiting par IP sur les routes sensibles."),
    ("Perte de données", "Interruption ou perte métier", "Migrations et scripts de sauvegarde/restauration."),
    ("Régression interface", "Fonctionnalité cassée", "Lint, build et scénarios Playwright."),
], [2600, 2473, 4000], caption="Tableau 2.6 — Principaux risques du projet")
add_chapter_conclusion(doc, "2", "Le cadrage a transformé le besoin général en exigences fonctionnelles et non fonctionnelles mesurables. Cette base permet d'aborder la conception technique et les modèles de données avec une séparation claire entre parcours publics et fonctions administratives.")

# Chapter 3
add_chapter_title(doc, "3", "Étude, analyse et conception de la solution", "Justifier les choix techniques et décrire les interactions, les données et la sécurité.")
add_section_heading(doc, "3.1 Critères de choix", 1)
add_body(doc, "Les choix ont été guidés par la capacité à construire rapidement une interface interactive, à exposer une API robuste, à manipuler des données relationnelles et à sécuriser les fonctions administratives. La disponibilité d'un écosystème de tests et la possibilité de préparer un déploiement standard sur Linux ont également été prises en compte.")
add_bullets(doc, [
    "maturité et documentation des technologies ;",
    "compatibilité avec une architecture web séparant frontend et backend ;",
    "prise en charge de la validation, de la sécurité et de la persistance ;",
    "capacité à gérer des composants interactifs et de la 3D ;",
    "possibilité d'automatiser les tests et le build ;",
    "facilité d'exploitation derrière un reverse proxy.",
])

add_section_heading(doc, "3.2 Étude comparative et choix final", 1)
add_table(doc, ["Couche", "Option retenue", "Justification dans G-ROD"], [
    ("Interface", "React 19", "Composants, état interactif, routage SPA et intégration de Three.js."),
    ("Build frontend", "Vite 8", "Serveur de développement rapide et génération d'assets optimisés."),
    ("Backend", "Spring Boot 3.5", "API REST, injection de dépendances, validation et sécurité intégrées."),
    ("Persistance", "Spring Data JPA / Hibernate", "Repositories, modèle relationnel et réduction du code répétitif."),
    ("Base de données", "MySQL", "Persistance transactionnelle adaptée aux entités métier."),
    ("Migrations", "Flyway", "Versionnement reproductible du schéma de base de données."),
    ("3D", "Three.js", "Rendu interactif des modèles GLB dans le navigateur."),
    ("Tests navigateur", "Playwright", "Validation des parcours critiques et des tailles d'écran."),
], [1800, 2400, 4873], caption="Tableau 3.1 — Comparaison des choix techniques")
add_body(doc, "L'architecture retenue est une application web en deux parties : une SPA React communique en HTTP/JSON avec une API Spring Boot. Le backend applique les règles métier et accède à MySQL. Les fichiers administrés sont stockés hors du répertoire web public et servis par des endpoints contrôlés.")
add_code(doc, [
    "Navigateur (React / Vite / PWA)",
    "          │  HTTPS + JSON + fichiers contrôlés",
    "          ▼",
    "Nginx / Reverse proxy",
    "          │  /api/*",
    "          ▼",
    "Spring Boot ── Spring Security ── Services métier",
    "          │                         │",
    "          ├──────── MySQL           └──────── Stockage des uploads",
])

add_section_heading(doc, "3.3 Architecture logique", 1)
add_section_heading(doc, "3.3.1 Organisation du backend", 2)
add_body(doc, "Le backend est structuré par responsabilités. Les contrôleurs reçoivent les requêtes HTTP et exposent des contrats REST. Les services portent les traitements métier. Les repositories assurent l'accès aux données. Les entités représentent le modèle persistant et les DTO limitent les données échangées avec le frontend. Les packages de configuration, de sécurité et de gestion des exceptions regroupent les préoccupations transversales.")
add_code(doc, [
    "controller  →  validation HTTP et endpoints REST",
    "service     →  règles métier et transactions",
    "repository  →  requêtes JPA et pagination",
    "entity      →  modèle relationnel persistant",
    "dto         →  contrats d'entrée et de sortie",
    "security    →  JWT, rate limiting et WebAuthn",
    "config      →  sécurité, CORS, bootstrap et propriétés",
])

add_section_heading(doc, "3.3.2 Organisation du frontend", 2)
add_body(doc, "Le frontend utilise React Router pour les pages publiques et administratives. Les appels à l'API alimentent les vues du catalogue, les formulaires et les tableaux de gestion. Les états de navigation, de thème, de filtres, de pagination et de panneaux responsives sont gérés côté client.")
add_body(doc, "La version actuelle reste fonctionnelle mais concentre encore une grande partie des composants et styles dans les fichiers App.jsx et App.css. Une modularisation en pages, layouts, composants, hooks et services constitue une amélioration de maintenabilité identifiée pour la suite, sans remettre en cause l'architecture fonctionnelle validée.")

add_section_heading(doc, "3.4 Cas d'utilisation", 1)
add_table(doc, ["Cas", "Acteur", "Scénario nominal"], [
    ("Consulter le catalogue", "Visiteur", "Charger les produits actifs, rechercher, filtrer puis ouvrir une fiche."),
    ("Demander un devis", "Prospect", "Renseigner le formulaire, joindre éventuellement un plan et valider."),
    ("Demander un document", "Client", "Choisir un type, préciser le produit et transmettre la demande."),
    ("Traiter une demande", "Administrateur", "Consulter la demande, changer son statut et exporter son PDF."),
    ("Gérer un produit", "Administrateur", "Créer ou modifier les informations, l'image et l'état actif."),
    ("Publier une ressource", "Administrateur", "Téléverser un PDF, définir le type, le produit et la visibilité."),
    ("Consulter les notifications", "Administrateur", "Filtrer, ouvrir l'élément lié et marquer comme lu."),
    ("Se connecter par Passkey", "Administrateur", "Initier le challenge WebAuthn et valider avec l'appareil."),
], [2500, 1900, 4673], caption="Tableau 3.2 — Principaux cas d'utilisation")
add_placeholder(doc, "Insérer le diagramme UML de cas d'utilisation global avec les acteurs Visiteur, Client et Administrateur.")

add_section_heading(doc, "3.5 Diagrammes de séquence", 1)
add_section_heading(doc, "3.5.1 Création d'une demande de devis", 2)
add_numbered(doc, [
    "Le client complète le formulaire public et choisit éventuellement un fichier.",
    "Le frontend valide les données puis envoie le fichier vers la zone temporaire.",
    "L'API valide la requête, crée ou rattache le client et enregistre la demande.",
    "Le fichier est promu vers le stockage définitif après réussite de la transaction.",
    "Une notification métier est créée et l'envoi externe optionnel est tenté.",
    "Le frontend confirme la création sans exposer les détails internes.",
])
add_placeholder(doc, "Insérer le diagramme de séquence UML correspondant.")

add_section_heading(doc, "3.5.2 Authentification administrateur", 2)
add_numbered(doc, [
    "L'administrateur transmet son adresse et son mot de passe sur la route de connexion.",
    "Spring Security charge le compte et compare le mot de passe avec BCrypt.",
    "En cas de succès, le backend génère un JWT signé et limité dans le temps.",
    "Le frontend conserve la session et joint le jeton aux requêtes protégées.",
    "Le filtre JWT vérifie la signature et reconstruit l'identité authentifiée.",
])
add_placeholder(doc, "Insérer le diagramme de séquence de connexion JWT et, séparément, celui de WebAuthn.")

add_section_heading(doc, "3.6 Modèle de données", 1)
add_table(doc, ["Entité", "Rôle métier", "Relations principales"], [
    ("Utilisateur", "Compte administrateur et rôle.", "Passkeys, lectures de notifications."),
    ("Produit", "Catalogue, caractéristiques, image, état et modèle 3D.", "Demandes et documents techniques."),
    ("Client", "Identité issue des interactions commerciales.", "Demandes de devis et historique."),
    ("DemandeDevis", "Besoin commercial, quantités, statut, priorité et pièce jointe.", "Client et produit."),
    ("DemandeDocument", "Demande d'une ressource technique.", "Produit et coordonnées client."),
    ("DocumentTechnique", "PDF public ou privé associé à un type et éventuellement un produit.", "Produit."),
    ("Notification", "Événement métier persistant et cible de navigation.", "Lecture par utilisateur."),
    ("NotificationLecture", "État lu/non lu propre à l'administrateur.", "Utilisateur et notification."),
    ("AdminPasskeyCredential", "Clé publique et compteur WebAuthn.", "Adresse du compte administrateur."),
    ("AppSetting", "Préférences administratives persistantes.", "Clé/valeur de configuration."),
], [2200, 3900, 2973], caption="Tableau 3.3 — Entités métier")
add_placeholder(doc, "Insérer le diagramme de classes ou le modèle relationnel final généré depuis ces entités.")

add_section_heading(doc, "3.7 Conception de la sécurité", 1)
add_body(doc, "La conception applique une défense en profondeur. Les routes publiques sont limitées aux consultations et créations attendues. Les fonctions d'administration exigent une authentification. Les mots de passe ne sont jamais stockés en clair. Les JWT sont signés avec un secret externe au dépôt. Les origines autorisées sont configurées afin de maîtriser les appels depuis le navigateur.")
add_body(doc, "Les endpoints publics sensibles disposent d'une limitation de fréquence par adresse IP. Les fichiers font l'objet de contrôles de type et de taille. Les PDF privés et les plans de devis ne sont pas exposés directement par Nginx : leur téléchargement passe par des contrôleurs qui appliquent les règles d'accès.")
add_body(doc, "L'option Passkey s'appuie sur WebAuthn pour permettre l'utilisation de Face ID, Touch ID ou Windows Hello. En dehors de localhost, ce mécanisme exige HTTPS, un identifiant RP correspondant au domaine et une validation stricte de l'origine. Les challenges étant actuellement conservés en mémoire, le déploiement recommandé reste mono-instance tant qu'un stockage partagé n'est pas ajouté.")

add_section_heading(doc, "3.8 Conception de la montée en charge fonctionnelle", 1)
add_body(doc, "Les listes d'administration ne chargent pas nécessairement toutes les données en une seule fois. Des endpoints dédiés fournissent des pages filtrées et triées pour les demandes, les produits, les documents et les ressources. Le pipeline commercial retourne des colonnes par statut avec des compteurs globaux et un nombre limité de cartes prioritaires. Cette stratégie maintient une interface lisible lorsque le nombre de demandes augmente.")
add_chapter_conclusion(doc, "3", "La conception retenue sépare clairement l'interface, l'API, les règles métier, les données et les fichiers. Les modèles d'interaction et de sécurité définissent le cadre de la réalisation présentée dans le dernier chapitre.")

# Chapter 4
add_chapter_title(doc, "4", "Réalisation et mise en œuvre", "Décrire les fonctionnalités livrées, les contrôles de qualité et la préparation de l'exploitation.")
add_section_heading(doc, "4.1 Environnement technique", 1)
add_table(doc, ["Technologie", "Version observée", "Utilisation"], [
    ("Java", "21", "Langage du backend."),
    ("Spring Boot", "3.5.14", "API REST et configuration applicative."),
    ("Spring Security", "Gérée par Spring Boot", "Authentification, autorisation et BCrypt."),
    ("MySQL", "Configuration projet", "Base relationnelle métier."),
    ("Flyway", "Gérée par Spring Boot", "Migration du schéma."),
    ("React", "19.2.6", "Interface publique et administration."),
    ("React Router", "7.15.1", "Navigation côté client."),
    ("Vite", "8.0.12", "Développement et build frontend."),
    ("Three.js", "0.185.1", "Aperçus 3D des produits."),
    ("Playwright", "1.62.1", "Tests de bout en bout et responsive."),
], [2200, 2200, 4673], caption="Tableau 4.1 — Technologies et outils")

add_section_heading(doc, "4.2 Réalisation du backend", 1)
add_body(doc, "L'API expose des contrôleurs spécialisés pour l'authentification, les produits, les clients, les demandes de devis, les demandes de documents, les ressources techniques, les notifications, les préférences et les Passkeys. Les échanges utilisent des DTO validés afin de limiter les données acceptées et retournées.")
add_body(doc, "Les services métier gèrent notamment la création des demandes, la génération de PDF, la consolidation des clients, les changements de statut, les notifications et le cycle de vie des fichiers. Les repositories Spring Data fournissent les recherches, les agrégations, les compteurs et la pagination nécessaires aux tableaux d'administration.")
add_body(doc, "Le composant d'initialisation crée uniquement les données de référence absentes. Il ne réécrit pas un produit déjà administré. Cette idempotence évite qu'un produit désactivé ou modifié depuis l'administration soit réinitialisé au redémarrage du backend.")

add_section_heading(doc, "4.3 Réalisation du site public", 1)
add_section_heading(doc, "4.3.1 Accueil et identité", 2)
add_body(doc, "La page d'accueil présente G-ROD, les engagements liés au cuivre recyclé, les produits mis en avant et les principaux appels à l'action. La navigation donne accès au catalogue, aux ressources, au processus de production, à la présentation de l'entreprise et au formulaire de devis.")
add_picture(doc, PROCESS_RECEPTION, 15.2, "Figure 4.1 — Réception et tri des matières premières", "Illustration de la réception des matières premières")

add_section_heading(doc, "4.3.2 Catalogue et fiches produits", 2)
add_body(doc, "Le catalogue charge les produits actifs depuis l'API. L'utilisateur peut effectuer une recherche, filtrer selon l'application, limiter l'affichage aux produits actifs et changer le mode de présentation. Un assistant de sélection propose un produit à partir de l'application et du besoin principal lorsqu'une correspondance est disponible.")
add_body(doc, "Chaque fiche produit regroupe l'image, la description, la pureté, les dimensions, les normes, les applications et les documents associés. Les valeurs non disponibles ne sont pas inventées. Les aperçus 3D utilisent des modèles GLB locaux et sont chargés à la demande pour limiter le coût initial.")
add_placeholder(doc, "Insérer une capture du catalogue en mode cartes et une capture d'une fiche produit avec aperçu 3D.")

add_section_heading(doc, "4.3.3 Demande de devis", 2)
add_body(doc, "Le formulaire de devis recueille les coordonnées, le produit, la quantité et les précisions techniques. Il peut inclure un lien vers un plan, un besoin de livraison et une pièce jointe. Les champs obligatoires et les formats sont contrôlés avant l'enregistrement. Une référence unique facilite ensuite le suivi dans l'administration.")
add_placeholder(doc, "Insérer une capture du formulaire de devis et du message de confirmation.")

add_section_heading(doc, "4.3.4 Ressources et demandes documentaires", 2)
add_body(doc, "La page Ressources présente les documents techniques actifs et publics. La recherche s'appuie sur le titre, le type, le produit et les mots-clés disponibles. Lorsqu'un document n'est pas directement accessible, le visiteur peut transmettre une demande en précisant le type et le produit concernés.")
add_picture(doc, PROCESS_LAB, 15.2, "Figure 4.2 — Contrôle en laboratoire", "Illustration du contrôle de qualité en laboratoire")

add_section_heading(doc, "4.3.5 Expérience responsive et PWA", 2)
add_body(doc, "L'interface adapte la navigation, les grilles, les formulaires et les contenus aux formats desktop, tablette et mobile. Un manifeste, un service worker et les icônes nécessaires permettent au navigateur de proposer l'installation de l'application lorsque les critères PWA sont satisfaits. La plateforme reste une application web et non une application mobile native.")
add_body(doc, "Le mode sombre est disponible sur les pages publiques et administratives. Des corrections spécifiques ont été apportées aux contrastes, aux champs, aux cartes et aux tableaux afin de préserver la lisibilité dans les deux thèmes.")

add_section_heading(doc, "4.4 Réalisation de l'espace administrateur", 1)
add_section_heading(doc, "4.4.1 Dashboard commercial", 2)
add_body(doc, "Le dashboard fournit une synthèse des demandes totales, des nouvelles demandes, des documents en attente et des produits actifs. Il affiche également les demandes récentes, l'état du catalogue, des actions rapides, des analyses commerciales et un pipeline par statut. Les compteurs proviennent des données réelles du backend.")
add_body(doc, "Le pipeline distingue les demandes nouvelles, en traitement, traitées et annulées. Chaque colonne affiche un compteur global, tandis que les cartes visibles sont limitées aux demandes les plus prioritaires. Un accès permet d'ouvrir la liste filtrée lorsqu'un volume supérieur doit être consulté.")
add_placeholder(doc, "Insérer une capture du Dashboard commercial et du pipeline.")

add_section_heading(doc, "4.4.2 Gestion des demandes", 2)
add_body(doc, "La page Demandes combine recherche, statut, tri et pagination côté serveur. Les informations essentielles — référence, client, produit, date, quantité, priorité et statut — sont regroupées dans une vue opérationnelle. L'administrateur peut télécharger le PDF, ouvrir une pièce jointe autorisée, changer le statut et supprimer une demande selon le besoin métier.")

add_section_heading(doc, "4.4.3 Gestion des clients", 2)
add_body(doc, "Les clients sont consolidés à partir des demandes réelles. La page affiche les coordonnées, le nombre de demandes, les produits concernés, la dernière interaction et l'état du suivi. Un panneau de détail et une page d'historique permettent d'examiner les demandes rattachées à un même client sans créer de données artificielles.")

add_section_heading(doc, "4.4.4 Gestion des produits", 2)
add_body(doc, "L'administrateur peut créer, modifier, activer ou désactiver un produit, gérer son image et renseigner ses caractéristiques. Les images sont téléversées par un endpoint spécialisé, puis leur chemin est associé au produit. La logique d'initialisation préserve ensuite toutes les modifications administratives lors des redémarrages.")

add_section_heading(doc, "4.4.5 Documents et ressources techniques", 2)
add_body(doc, "Les demandes de documents disposent de leur propre page et de statuts métier. Les ressources techniques sont administrées sous forme de PDF avec un titre, un type, un produit éventuel, une visibilité publique ou privée et un état actif. Les types proposés proviennent de valeurs réellement utilisables afin d'éviter un formulaire bloqué sur une liste vide.")

add_section_heading(doc, "4.4.6 Notifications", 2)
add_body(doc, "La cloche de la topbar et l'entrée de la sidebar utilisent le même compteur de notifications non lues. Le dropdown affiche les événements récents et permet de les marquer comme lus. La page dédiée propose les catégories réellement calculables et des liens vers la demande, le document ou le client associé lorsqu'une navigation valide existe.")
add_body(doc, "L'état lu/non lu est persisté côté backend pour chaque utilisateur via une entité de lecture. Le badge disparaît lorsque le nombre est nul et se met à jour après une action de lecture.")

add_section_heading(doc, "4.4.7 Mon compte et Passkey", 2)
add_body(doc, "La page Mon compte sépare le profil, la sécurité et les préférences. Le paramètre tab de l'URL constitue la source de vérité pour permettre le rafraîchissement direct et la navigation précédent/suivant. La section Sécurité conserve le changement de mot de passe et l'activation d'une Passkey. Les préférences de notification peuvent être enregistrées côté backend sans afficher d'informations fictives.")

add_section_heading(doc, "4.4.8 Sidebar responsive", 2)
add_body(doc, "Sur desktop, la sidebar peut être réduite aux icônes ; son état est conservé localement. Sur mobile et tablette, elle devient un drawer fermé par le bouton, l'overlay ou la navigation. Une seule source d'état au niveau de l'espace Admin évite de reproduire cette logique dans chaque page.")

add_section_heading(doc, "4.5 Gestion des fichiers", 1)
add_body(doc, "Les fichiers de devis sont d'abord placés dans un répertoire temporaire puis déplacés vers leur emplacement définitif uniquement lorsque la création métier réussit. Un nettoyage planifié cible les fichiers temporaires expirés, sans supprimer automatiquement les fichiers définitifs. Un service d'audit peut identifier les fichiers potentiellement orphelins en lecture seule.")
add_body(doc, "En production, les uploads sont placés hors du répertoire public. Les images produits peuvent être relayées de manière contrôlée, tandis que les plans de devis et documents privés nécessitent un endpoint authentifié. Cette organisation réduit le risque de contournement des règles d'accès.")

add_section_heading(doc, "4.6 Tests et recette", 1)
add_body(doc, "La stratégie de qualité combine plusieurs niveaux. Les tests backend utilisent JUnit, Spring Boot Test, Spring Security Test et une base H2 isolée. Les scénarios Playwright démarrent un environnement de test indépendant de la base MySQL métier, avec leurs propres uploads.")
add_table(doc, ["Vérification", "Résultat observé", "Couverture"], [
    ("Tests Maven", "44 tests réussis", "Services, sécurité, migrations, initialisation, fichiers, pagination et pipeline."),
    ("ESLint", "Aucune erreur", "Qualité statique du code frontend."),
    ("Build Vite", "Build réussi", "Production des assets frontend."),
    ("Playwright", "38 scénarios réussis", "Parcours publics/Admin, uploads, responsive, thème sombre, 3D et pagination."),
    ("Recette réelle", "API et pages HTTP accessibles", "Backend MySQL et frontend lancés sur des ports de validation."),
], [2100, 2200, 4773], caption="Tableau 4.2 — Synthèse des tests")
add_body(doc, "La recette couvre notamment la connexion, la gestion des statuts, la persistance des images produits, les notifications, les documents, les ressources, la navigation du compte, la sidebar, les affichages desktop/tablette/mobile et le chargement différé des modèles 3D.")

add_section_heading(doc, "4.7 Préparation du déploiement", 1)
add_body(doc, "L'architecture de production documentée place Nginx devant le frontend statique et l'API Spring Boot. Les requêtes vers /api sont relayées vers le backend lié à l'interface locale du serveur. MySQL et le répertoire d'uploads ne sont pas exposés directement.")
add_code(doc, [
    "Internet → HTTPS Nginx → fichiers React statiques",
    "                      └→ /api/* → Spring Boot (127.0.0.1:8080)",
    "                                      ├→ MySQL",
    "                                      └→ UPLOAD_DIR hors webroot",
])
add_body(doc, "Le dépôt contient des modèles Nginx et systemd, un exemple de variables d'environnement, des scripts de sauvegarde/restauration ainsi qu'une procédure Flyway. Les secrets ne sont pas versionnés. La Release Candidate v1.0.0-rc.2 a été créée et publiée dans le dépôt GitHub configuré après validation des tests.")
add_body(doc, "Il est important de distinguer préparation et déploiement effectif : les fichiers et procédures sont prêts, mais la mise en production finale exige un domaine, un certificat HTTPS, des secrets propres à l'environnement, un compte MySQL dédié et une validation post-déploiement.")

add_section_heading(doc, "4.8 Résultats, limites et enseignements", 1)
add_body(doc, "La solution obtenue répond au périmètre défini : elle présente l'entreprise et ses produits, collecte les demandes et fournit un espace Admin complet pour les traiter. Les données affichées proviennent de l'API et la logique métier est persistée. La plateforme est utilisable sur plusieurs tailles d'écran et peut être installée comme PWA.")
add_body(doc, "La principale limite technique identifiée concerne la taille des fichiers frontend App.jsx et App.css, qui concentrent encore une part importante des pages et styles. La séparation en composants, pages, layouts, hooks et services réduirait le coût de maintenance. Par ailleurs, les challenges WebAuthn et le rate limiting sont adaptés à une instance unique ; un déploiement distribué nécessiterait un stockage partagé, par exemple Redis ou une passerelle d'API.")
add_body(doc, "Le projet a permis de consolider des compétences en analyse fonctionnelle, conception full stack, gestion de données, sécurité web, expérience responsive, tests automatisés, gestion de versions et préparation de l'exploitation.")
add_chapter_conclusion(doc, "4", "La réalisation transforme les besoins étudiés en une plateforme cohérente et vérifiée. Les fonctions publiques et administratives sont reliées à une source de données réelle, tandis que les tests, la sauvegarde et les procédures de déploiement fournissent une base solide pour la suite du projet.")

doc.add_page_break()
add_section_heading(doc, "Conclusion générale et perspectives", 1)
add_body(doc, "Le projet G-ROD avait pour objectif de concevoir une plateforme web B2B capable de valoriser l'activité de Morocco Copper Foundry et de structurer les échanges avec ses prospects et clients. Cet objectif a conduit à la réalisation d'un site public moderne, d'un catalogue dynamique et d'un espace d'administration couvrant le suivi commercial, les clients, les produits, les documents, les ressources et les notifications.")
add_body(doc, "L'architecture retenue associe React, Spring Boot et MySQL dans une séparation claire entre interface, API et persistance. Les fonctionnalités sensibles sont protégées par Spring Security, JWT et BCrypt, avec une option Passkey/WebAuthn. La gestion des fichiers, la limitation de requêtes, les migrations et l'initialisation idempotente renforcent la fiabilité de la solution.")
add_body(doc, "La recette finale confirme le bon fonctionnement des principaux parcours et des affichages responsive. Les tests automatisés, la sauvegarde de la base et la création d'une Release Candidate apportent une traçabilité supplémentaire et facilitent la présentation du projet.")
add_body(doc, "Plusieurs perspectives peuvent prolonger ce travail : modulariser davantage le frontend, automatiser l'intégration et le déploiement continus, utiliser un stockage partagé pour les contrôles distribués, externaliser les fichiers vers un stockage objet, ajouter des indicateurs commerciaux historiques et connecter la plateforme à d'autres outils internes de l'entreprise. Ces évolutions devront être priorisées selon les besoins réels et le contexte d'exploitation.")

doc.add_page_break()
add_section_heading(doc, "Bibliographie et webographie", 1)
sources = [
    "Morocco Copper Foundry — Brochure institutionnelle G-ROD, document interne intégré au projet, 2026.",
    "Documentation du projet G-ROD — README, procédures de déploiement, sauvegarde et migration, version v1.0.0-rc.2.",
    "Spring — Spring Boot Reference Documentation, https://docs.spring.io/spring-boot/ (consulté en septembre 2026).",
    "React — Documentation officielle, https://react.dev/ (consultée en septembre 2026).",
    "MySQL — MySQL 8.0 Reference Manual, https://dev.mysql.com/doc/refman/8.0/en/ (consulté en septembre 2026).",
    "Vite — Guide officiel, https://vite.dev/guide/ (consulté en septembre 2026).",
    "Three.js — Documentation officielle, https://threejs.org/docs/ (consultée en septembre 2026).",
    "Playwright — Documentation officielle, https://playwright.dev/docs/intro (consultée en septembre 2026).",
    "OWASP Foundation — Authentication et JSON Web Token Cheat Sheets, https://cheatsheetseries.owasp.org/.",
]
for source in sources:
    p = doc.add_paragraph(style="List Bullet")
    r = p.add_run(source)
    set_font(r, size=10.5)

doc.add_page_break()
add_section_heading(doc, "Annexes", 1)
add_section_heading(doc, "Annexe A — Principales routes frontend", 2)
add_table(doc, ["Espace", "Routes"], [
    ("Public", "/, /catalogue, /catalogue/:productId, /resources, /processus, /pourquoi-grod, /demande-document, /devis"),
    ("Administration", "/admin/login, /admin/dashboard, /admin/demandes, /admin/clients, /admin/produits, /admin/documents, /admin/ressources, /admin/notifications, /admin/account"),
], [2000, 7073])

add_section_heading(doc, "Annexe B — Principaux groupes d'API", 2)
add_bullets(doc, [
    "/api/auth — connexion et mot de passe ;",
    "/api/passkeys — inscription et connexion WebAuthn ;",
    "/api/produits — catalogue et CRUD produits ;",
    "/api/demandes-devis — demandes commerciales, statuts, PDF et pièces jointes ;",
    "/api/demandes-documents — demandes de ressources ;",
    "/api/documents-techniques — ressources publiques et administration ;",
    "/api/admin — dashboard, pagination et pipeline ;",
    "/api/admin/notifications — liste, compteur et état de lecture ;",
    "/api/uploads — images et documents contrôlés.",
])

add_section_heading(doc, "Annexe C — Lancement local", 2)
add_code(doc, [
    "Backend :",
    "cd grod-platform-backend",
    "set JWT_SECRET=<secret local de 32 caractères minimum>",
    ".\\mvnw.cmd spring-boot:run",
    "",
    "Frontend :",
    "cd grod-platform-frontend",
    "npm.cmd run dev",
    "",
    "Adresse : http://localhost:5173",
])

add_section_heading(doc, "Annexe D — Informations restant à compléter", 2)
add_bullets(doc, [
    "identité de l'étudiant, filière, établissement et année universitaire ;",
    "noms et fonctions des encadrants ;",
    "dates exactes du stage ;",
    "description validée de l'ancien processus métier ;",
    "chronologie réelle et diagramme de Gantt ;",
    "diagrammes UML exportés en haute résolution ;",
    "captures finales des interfaces publiques et administratives ;",
    "validation des chiffres institutionnels et des perspectives par l'entreprise.",
])

# Ask Word/LibreOffice to refresh fields when opening the document.
settings = doc.settings._element
update_fields = settings.find(qn("w:updateFields"))
if update_fields is None:
    update_fields = OxmlElement("w:updateFields")
    settings.append(update_fields)
update_fields.set(qn("w:val"), "true")

core = doc.core_properties
core.title = "Rapport PFE — Plateforme G-ROD"
core.subject = "Conception et développement d'une plateforme web B2B pour Morocco Copper Foundry"
core.author = "[NOM COMPLET]"
core.keywords = "G-ROD, React, Spring Boot, MySQL, PFE"
core.comments = "Version de travail 1 — informations personnelles et figures UML à compléter."

OUT_DIR.mkdir(parents=True, exist_ok=True)
doc.save(OUT_FILE)
print(OUT_FILE)
