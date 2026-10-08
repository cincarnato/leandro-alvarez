# Recursos de beneficios demo

El dataset `../../src/setup/data/benefits-demo.ts` exporta `demoCategories` (8 categorías), `demoCompanies` (10 comercios) y `demoBenefits` (12 beneficios, 4 destacados). Es únicamente información estática tipada: no ejecuta seeds ni escribe en la base de datos.

Todos los comercios y las ofertas son ficticios y están destinados exclusivamente a demostraciones. Los nombres de categorías y comercios y los títulos de beneficios comienzan con `Demo · ` para diferenciarlos de datos reales. Las descripciones y condiciones identifican la simulación; los descuentos no tienen validez comercial ni son acumulables. No se incluyen CUIT, correos electrónicos ni teléfonos inventados.

## Logos originales

Los 10 logos fueron diseñados originalmente para este demo mediante formas geométricas y tipografía, sin reutilizar logos, marcas corporativas ni imágenes externas. Se generaron localmente con Python y Pillow ya instalado, utilizando las fuentes del sistema Lato y DejaVu Serif. No se utilizó red ni se descargaron recursos externos.

Cada archivo es un PNG raster RGB de **480 × 480 píxeles**, con bordes suavizados mediante renderizado a triple resolución. La paleta combina azul marino, terracota, verde salvia y crema. Incluyen el nombre comercial y una identificación `DEMO`.

| Archivo en `logos/` | Comercio ficticio | Motivo original |
| --- | --- | --- |
| `casa-nativa.png` | Casa Nativa | Casa y arco de entrada |
| `rumbo-mudanzas.png` | Rumbo Mudanzas | Furgón y flecha de traslado |
| `base-materiales.png` | Base Materiales | Ladrillos escalonados |
| `trazo-deco.png` | Trazo Deco | Lámpara de mesa en marco arqueado |
| `verde-patio.png` | Verde Patio | Hojas curvas y tallos |
| `manos-a-casa.png` | Manos a Casa | Martillo y llave cruzados |
| `nodo-tecnologia.png` | Nodo Tecnología | Red de nodos conectados |
| `pausa-bienestar.png` | Pausa Bienestar | Flor de ocho pétalos |
| `luz-de-casa.png` | Luz de Casa | Lámpara de pie y destello |
| `taller-roble.png` | Taller Roble | Sección de madera con anillos |

El campo `logo` del dataset contiene solamente el nombre de archivo, siempre `<company.key>.png`. Las relaciones de beneficios usan las claves `company` y `category`, no identificadores de base de datos.

Los PNG se entregan pregenerados como archivos del repositorio. No se necesita Python, Pillow ni generación de imágenes durante el build o en runtime. Este directorio no incorpora scripts de generación, dependencias ni un runner de seed.
