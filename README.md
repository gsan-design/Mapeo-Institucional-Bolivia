# Fichas de programas

Genera una ficha HTML por programa a partir del Excel de mapeo, lista para publicarse
con GitHub Pages.

## Estructura del repositorio

```
.
├── datos/SAT_prueba.xlsx     # el Excel fuente
├── generar_fichas.py         # script generador
├── datos.json                # salida intermedia (útil para revisar el mapeo)
└── index.html                # la página publicada
```

## Regenerar las fichas

```bash
pip install openpyxl
python generar_fichas.py datos/SAT_prueba.xlsx --hoja "Mapeo v3" --salida index.html
```

Luego `git add index.html datos.json && git commit && git push`.

## Publicar en GitHub Pages

En el repo: **Settings → Pages → Source: Deploy from a branch → `main` / `(root)`**.
La ficha queda en `https://<usuario>.github.io/<repo>/`.

## Cómo lee el Excel

| Columna | Rol en la ficha |
|---|---|
| A · Nombre del programa | Título de la ficha |
| B · Período de implementación | Va entre paréntesis en el título |
| C · Descripción | "Descripción breve" |
| D · Categoría principal de intervención | Campo de la portada |
| F · Problema (genérico) | Un botón "Problema N" por bloque |
| G · Hipótesis (genérica) | "Hipótesis de solución" (vista expandida) |
| H · Instrumentos o herramientas | Un chip por fila, dentro del problema |

Reglas de agrupación:

- Una **celda combinada** propaga su valor a todas sus filas.
- Una **celda vacía** hereda el valor de la fila de arriba (dentro del mismo programa).
- Un nombre de programa nuevo en la columna A abre una ficha nueva.
- En la columna H, el texto antes de los **dos puntos** se usa como nombre del
  instrumento y lo que sigue como su descripción:
  `Sistema de Bonos subsidiados: Vouchers emitidos por el Estado para...`

Para agregar un programa basta con seguir escribiendo filas debajo en la misma hoja y
volver a correr el script: no hay que tocar el HTML.

## Actualización automática (opcional)

`.github/workflows/fichas.yml`:

```yaml
name: Generar fichas
on:
  push:
    paths: ["datos/**.xlsx", "generar_fichas.py"]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: "3.12" }
      - run: pip install openpyxl
      - run: python generar_fichas.py datos/SAT_prueba.xlsx --hoja "Mapeo v3"
      - uses: stefanzweifel/git-auto-commit-action@v5
        with:
          commit_message: "Regenerar fichas desde el Excel"
```

Con esto, cada vez que subas una versión nueva del Excel, la página se reconstruye sola.
