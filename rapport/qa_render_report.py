import json
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / ".codex_deps"))

import fitz
from PIL import Image, ImageDraw


PDF = ROOT / "rapport" / "RAPPORT_PFE_GROD_FINAL_EMSI.pdf"
OUTPUT = ROOT / "rapport" / "rendered-final"


def main():
    OUTPUT.mkdir(parents=True, exist_ok=True)
    doc = fitz.open(PDF)
    page_summaries = []
    images = []
    for index, page in enumerate(doc):
        text = " ".join(page.get_text().split())
        drawings = len(page.get_drawings())
        embedded = len(page.get_images(full=True))
        pix = page.get_pixmap(matrix=fitz.Matrix(1.15, 1.15), alpha=False)
        page_path = OUTPUT / f"page-{index + 1:03d}.png"
        pix.save(page_path)
        images.append(page_path)
        page_summaries.append({
            "physical_page": index + 1,
            "text_chars": len(text),
            "images": embedded,
            "drawings": drawings,
            "head": text[:160],
        })

    sheets = []
    thumb_w, thumb_h = 238, 337
    margin, label_h = 14, 22
    cols, rows = 4, 3
    per_sheet = cols * rows
    for sheet_index in range(0, len(images), per_sheet):
        batch = images[sheet_index:sheet_index + per_sheet]
        sheet = Image.new("RGB", (cols * (thumb_w + margin) + margin, rows * (thumb_h + label_h + margin) + margin), "#d9dedb")
        draw = ImageDraw.Draw(sheet)
        for slot, image_path in enumerate(batch):
            page_no = sheet_index + slot + 1
            img = Image.open(image_path).convert("RGB")
            img.thumbnail((thumb_w, thumb_h))
            col, row = slot % cols, slot // cols
            x = margin + col * (thumb_w + margin)
            y = margin + row * (thumb_h + label_h + margin)
            sheet.paste(img, (x + (thumb_w - img.width) // 2, y))
            draw.text((x, y + thumb_h + 3), f"Page physique {page_no}", fill="#111111")
        sheet_path = OUTPUT / f"contact-{sheet_index // per_sheet + 1:02d}.png"
        sheet.save(sheet_path, quality=92)
        sheets.append(str(sheet_path))

    all_text = "\n".join(page.get_text() for page in doc)
    checks = {
        "page_count": doc.page_count,
        "blank_pages": [p["physical_page"] for p in page_summaries if p["text_chars"] < 40 and p["images"] == 0 and p["drawings"] < 3],
        "low_content_pages": [p["physical_page"] for p in page_summaries if p["text_chars"] < 120],
        "contains_toc_placeholder": "Mettre à jour la table des matières" in all_text,
        "contains_figures_placeholder": "Mettre à jour la table des figures" in all_text,
        "contains_tables_placeholder": "Mettre à jour la liste des tableaux" in all_text,
        "contains_a_completer": "À COMPLÉTER" in all_text.upper(),
        "contains_old_router": "7.15.1" in all_text,
        "contains_old_vite": "8.0.12" in all_text,
        "contains_old_playwright": "38 scénarios réussis" in all_text and "37/38 scénarios réussis" not in all_text,
        "contains_new_router": "7.18.2" in all_text,
        "contains_new_vite": "8.2.1" in all_text,
        "contains_playwright_37": "37/38 scénarios réussis" in all_text,
        "contact_sheets": sheets,
        "pages": page_summaries,
    }
    (OUTPUT / "qa-summary.json").write_text(json.dumps(checks, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps({key: value for key, value in checks.items() if key not in {"pages", "contact_sheets"}}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
