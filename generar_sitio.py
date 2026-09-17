#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Genera datos.json e index.html desde el Excel fuente sin dependencias externas.

Uso:
  python generar_sitio.py

Por defecto lee:
  datos/Ficha_Informativa_Apoyo_PYMES_Bolivia.xlsx
  hoja: Copia de Mapeo v3

El sitio implementa cuatro vistas:
1) listado de programas
2) ficha de programa + sectores
3) problemas del sector
4) detalle del problema + hipótesis + instrumentos
"""

from pathlib import Path
from collections import defaultdict
import json
import re
import zipfile
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parent
EXCEL = ROOT / "datos" / "Ficha_Informativa_Apoyo_PYMES_Bolivia.xlsx"
SHEET_NAME = "Copia de Mapeo v3"

NS_MAIN = "http://schemas.openxmlformats.org/spreadsheetml/2006/main"
NS_REL = "http://schemas.openxmlformats.org/officeDocument/2006/relationships"
NS_PKGREL = "http://schemas.openxmlformats.org/package/2006/relationships"

def clean(v):
    if v is None:
        return ""
    s = str(v).replace("\r", " ").replace("\n", " ")
    return re.sub(r"\s+", " ", s).strip()

def col_index(cell_ref):
    m = re.match(r"([A-Z]+)", cell_ref)
    letters = m.group(1)
    n = 0
    for ch in letters:
        n = n * 26 + (ord(ch) - 64)
    return n - 1

def read_xlsx_rows(path, sheet_name):
    with zipfile.ZipFile(path) as z:
        shared = []
        if "xl/sharedStrings.xml" in z.namelist():
            root = ET.fromstring(z.read("xl/sharedStrings.xml"))
            for si in root.findall(f"{{{NS_MAIN}}}si"):
                texts = [t.text or "" for t in si.iter(f"{{{NS_MAIN}}}t")]
                shared.append("".join(texts))

        wb = ET.fromstring(z.read("xl/workbook.xml"))
        rels = ET.fromstring(z.read("xl/_rels/workbook.xml.rels"))
        relmap = {r.attrib["Id"]: r.attrib["Target"] for r in rels.findall(f"{{{NS_PKGREL}}}Relationship")}

        target = None
        for sh in wb.find(f"{{{NS_MAIN}}}sheets"):
            if sh.attrib.get("name") == sheet_name:
                rid = sh.attrib.get(f"{{{NS_REL}}}id")
                target = relmap[rid]
                break
        if not target:
            raise SystemExit(f"No se encontró la hoja: {sheet_name}")

        target = target.lstrip("/")
        if not target.startswith("xl/"):
            target = "xl/" + target
        root = ET.fromstring(z.read(target))

        data = {}
        max_row = 0
        max_col = 0
        for c in root.iter(f"{{{NS_MAIN}}}c"):
            ref = c.attrib.get("r")
            if not ref:
                continue
            rnum = int(re.search(r"\d+", ref).group())
            cnum = col_index(ref)
            max_row = max(max_row, rnum)
            max_col = max(max_col, cnum)
            t = c.attrib.get("t")
            value = ""
            if t == "inlineStr":
                texts = [x.text or "" for x in c.iter(f"{{{NS_MAIN}}}t")]
                value = "".join(texts)
            else:
                v = c.find(f"{{{NS_MAIN}}}v")
                raw = v.text if v is not None else ""
                if t == "s" and raw != "":
                    value = shared[int(raw)]
                else:
                    value = raw
            data[(rnum, cnum)] = value

        rows = []
        for r in range(1, max_row + 1):
            rows.append([data.get((r, c), "") for c in range(max_col + 1)])
        return rows

def split_instrument(text):
    text = clean(text)
    if not text:
        return "", ""
    if ":" in text:
        a, b = text.split(":", 1)
        return a.strip(" ."), b.strip(" .")
    return text.strip(" ."), ""

def parse_programs(rows):
    if not rows:
        return []

    headers = [clean(x) for x in rows[0]]
    wanted = {
        "Nombre del programa o instrumento": "programa",
        "Período de implementación": "periodo",
        "Descripción": "descripcion",
        "Objetivo general": "objetivo",
        "Categoría principal de intervención": "categoria",
        "Categoría(s) secundaria(s) de intervención": "categorias_sec",
        "Problema (genérico) que busca resolver": "gproblema",
        "Hipótesis (genérica)": "ghipotesis",
        "Instrumentos o herramientas": "ginstrumento",
        "Sector económico": "sector",
        "Problema (específico del sector)": "sproblema",
        "Hipótesis": "shipotesis",
        "Instrumento o herramienta": "sinstrumento",
        "Descripción de intrumento o herramienta": "sdescripcion",
    }
    idx = {}
    for i, h in enumerate(headers):
        if h in wanted:
            idx[wanted[h]] = i

    required = ["programa", "periodo", "descripcion", "categoria", "gproblema", "ghipotesis", "ginstrumento"]
    missing = [k for k in required if k not in idx]
    if missing:
        raise SystemExit(f"Faltan columnas requeridas: {missing}")

    def val(row, key):
        i = idx.get(key)
        return clean(row[i]) if i is not None and i < len(row) else ""

    programs = []
    current = None
    for row in rows[1:]:
        name = val(row, "programa")
        if name:
            current = {
                "nombre": name,
                "periodo": val(row, "periodo"),
                "descripcion": val(row, "descripcion"),
                "objetivo": val(row, "objetivo"),
                "categoria": val(row, "categoria"),
                "categorias_sec": val(row, "categorias_sec"),
                "_rows": [],
            }
            programs.append(current)
        if current:
            current["_rows"].append(row)

    for p in programs:
        sector_order = []
        seen = set()
        current_sector = ""
        for row in p["_rows"]:
            if val(row, "sector"):
                current_sector = val(row, "sector")
            if current_sector and current_sector not in seen:
                seen.add(current_sector)
                sector_order.append(current_sector)
        if not sector_order:
            sector_order = ["Sector no especificado en la base"]

        specific_by = defaultdict(list)
        specific_lookup = {}
        current_sector = ""
        current_problem = ""
        for row in p["_rows"]:
            if val(row, "sector"):
                current_sector = val(row, "sector")
            if not current_sector:
                current_sector = "Sector no especificado en la base"

            problem = val(row, "sproblema")
            hypothesis = val(row, "shipotesis")
            inst_name = val(row, "sinstrumento")
            inst_desc = val(row, "sdescripcion")

            if problem:
                current_problem = problem
                key = (current_sector, current_problem)
                if key not in specific_lookup:
                    obj = {"texto": current_problem, "hipotesis": hypothesis, "instrumentos": []}
                    specific_lookup[key] = obj
                    specific_by[current_sector].append(obj)
            if inst_name and current_problem:
                key = (current_sector, current_problem)
                if key in specific_lookup:
                    inst = {"nombre": inst_name.strip(" ."), "descripcion": inst_desc}
                    if inst not in specific_lookup[key]["instrumentos"]:
                        specific_lookup[key]["instrumentos"].append(inst)

        generic_by = defaultdict(list)
        generic_lookup = {}
        current_sector = ""
        current_problem = ""
        for row in p["_rows"]:
            if val(row, "sector"):
                current_sector = val(row, "sector")
            if not current_sector:
                current_sector = "Sector no especificado en la base"

            problem = val(row, "gproblema")
            hypothesis = val(row, "ghipotesis")
            instrument = val(row, "ginstrumento")

            if problem:
                current_problem = problem
                key = (current_sector, current_problem)
                if key not in generic_lookup:
                    obj = {"texto": current_problem, "hipotesis": hypothesis, "instrumentos": []}
                    generic_lookup[key] = obj
                    generic_by[current_sector].append(obj)
            if instrument and current_problem:
                key = (current_sector, current_problem)
                if key in generic_lookup:
                    name, desc = split_instrument(instrument)
                    inst = {"nombre": name, "descripcion": desc}
                    if inst not in generic_lookup[key]["instrumentos"]:
                        generic_lookup[key]["instrumentos"].append(inst)

        sectors = []
        already = set()
        for sector in sector_order:
            # Si existen problemas específicos para ese sector, se priorizan.
            # Si no, se usa el nivel genérico como respaldo sin inventar contenido.
            problems = specific_by.get(sector) or generic_by.get(sector) or []
            sectors.append({"nombre": sector, "problemas": problems})
            already.add(sector)

        for sector in list(specific_by) + list(generic_by):
            if sector not in already:
                sectors.append({
                    "nombre": sector,
                    "problemas": specific_by.get(sector) or generic_by.get(sector) or []
                })

        p["sectores"] = sectors
        del p["_rows"]

    return programs

def main():
    rows = read_xlsx_rows(EXCEL, SHEET_NAME)
    programs = parse_programs(rows)
    (ROOT / "datos.json").write_text(
        json.dumps(programs, ensure_ascii=False, indent=2),
        encoding="utf-8"
    )

    index_path = ROOT / "index.html"
    html_text = index_path.read_text(encoding="utf-8")
    start = html_text.index("const PROGRAMAS = ") + len("const PROGRAMAS = ")
    end = html_text.index(";\n\nconst app =", start)
    updated = html_text[:start] + json.dumps(programs, ensure_ascii=False) + html_text[end:]
    index_path.write_text(updated, encoding="utf-8")
    print(f"OK: {len(programs)} programas procesados")
    for p in programs:
        n_sector = len(p["sectores"])
        n_problem = sum(len(s["problemas"]) for s in p["sectores"])
        print(f"- {p['nombre']}: {n_sector} sector(es), {n_problem} problema(s)")

if __name__ == "__main__":
    main()
