# Dashboard – Mapeo Institucional de Apoyo a PYMES

Versión en escala de grises preparada para GitHub Pages.

## Archivos
- `index.html`: dashboard principal.
- `data.js`: datos derivados del Excel.
- `script.js`: interacción del dashboard.
- `categoria.html` + `categoria.js`: detalle de problemas y soluciones por categoría.
- `instrumento.html` + `instrumento.js`: detalle por tipo de instrumento.
- `styles.css`: estilos en blanco, negro y grises.

## Cambios de esta versión
- La evolución se muestra como una línea de tiempo por programa, desde inicio hasta finalización o 2026 cuando sigue vigente.
- En recurrencia, los números de problemas y soluciones son clicables y abren el detalle de la categoría.
- Se eliminó la columna “Cobertura” y se reemplazó por “Soluciones”.
- El nivel de confianza AACODS muestra explícitamente 100% cuando corresponde e incluye una nota sobre evaluaciones de impacto aún no revisadas.
- Problemas prioritarios está ordenado de mayor a menor porcentaje.
- Todas las barras de recurrencia de instrumentos utilizan el mismo color.
- La interfaz completa usa escala de grises.

## Publicación
Sube todos los archivos a la raíz del repositorio y deja GitHub Pages configurado en `main` + `/(root)`.
