# Mapeo Institucional — Programas de apoyo a PYMES en Bolivia

Este repositorio publica el mapeo en GitHub Pages con una navegación de cuatro niveles:

1. **Inicio:** tarjetas de programas.
2. **Programa:** descripción, categoría principal y sectores económicos.
3. **Sector:** problemas asociados al sector.
4. **Problema:** detalle, hipótesis de solución e instrumentos/herramientas.

## Archivos principales

```text
.
├── index.html
├── datos.json
├── generar_sitio.py
├── datos/
│   └── Ficha_Informativa_Apoyo_PYMES_Bolivia.xlsx
└── .github/
    └── workflows/
        └── actualizar-sitio.yml
```

## Primera actualización del repositorio

Sube/reemplaza estos archivos en la rama `main`, en la raíz del repositorio.  
Si GitHub Pages ya está configurado en **Settings → Pages → Deploy from a branch → main / (root)**, no necesitas cambiar esa configuración.

## Actualizaciones futuras

Mantén este nombre y ubicación para el Excel:

```text
datos/Ficha_Informativa_Apoyo_PYMES_Bolivia.xlsx
```

Cuando reemplaces ese Excel y hagas commit, el workflow de GitHub Actions ejecutará:

```bash
python generar_sitio.py
```

y actualizará automáticamente `datos.json` e `index.html`.

## Hoja esperada

El generador lee la hoja:

```text
Copia de Mapeo v3
```

## Lógica de lectura

El sitio usa estas columnas del Excel:

- Nombre del programa o instrumento
- Período de implementación
- Descripción
- Categoría principal de intervención
- Sector económico
- Problema (específico del sector)
- Hipótesis
- Instrumento o herramienta
- Descripción de intrumento o herramienta

Cuando un sector no tiene información específica, el generador usa el problema/hipótesis/instrumentos del nivel genérico como respaldo. No inventa información faltante.

Si un programa no tiene sector económico registrado, se muestra:

```text
Sector no especificado en la base
```

## Probar localmente

Puedes abrir `index.html` directamente en el navegador. Los datos están embebidos para que funcione incluso sin un servidor local.

Si modificas el Excel localmente:

```bash
python generar_sitio.py
```

y vuelve a abrir `index.html`.
