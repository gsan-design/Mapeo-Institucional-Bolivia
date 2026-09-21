# Dashboard de Mapeo Institucional de Apoyo a PYMES

Sitio estático preparado para **GitHub Pages** con apariencia inspirada en el PDF de referencia y contenido tomado del archivo **Ficha Informativa Final- Apoyo a PYMES Bolivia (3).xlsx**.

## Archivos incluidos
- `index.html`: dashboard principal.
- `instrumento.html`: página de detalle por tipo de instrumento.
- `styles.css`: estilos del dashboard.
- `script.js`: lógica del dashboard principal.
- `instrumento.js`: lógica de la página de detalle.
- `data/dashboard_data.json`: datos procesados desde Excel.

## Publicación en GitHub Pages
1. Crea un repositorio en GitHub.
2. Sube todos los archivos de esta carpeta respetando la estructura.
3. Ve a **Settings → Pages**.
4. En **Build and deployment**, selecciona `Deploy from a branch`.
5. Usa la rama `main` y la carpeta `/root`.
6. Guarda los cambios y espera a que GitHub publique la URL.

## Observaciones metodológicas
- La evolución usa el inicio del período de implementación y, cuando falta el año en esa columna, usa `Año de creación` como respaldo.
- La calidad y confianza de la información se calcula con **AACODS Checklist**.
- El archivo actual de calidad reporta `Sí` en todos los criterios cargados; por eso el dashboard muestra un nivel alto.
