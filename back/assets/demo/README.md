# Recursos del catálogo de demostración

8 categorías, 10 comercios ficticios y 12 beneficios. No hay afiliaciones con marcas reales ni ofertas con validez comercial.

Los prefijos `Demo · ` se conservan en la base para preservar la identidad y la repetibilidad del seed, y para distinguir registros reales con nombres similares. La interfaz pública los oculta y muestra un aviso general cuando el catálogo contiene demostraciones. El detalle mantiene el aviso y las condiciones explicitan la simulación.

## Identidades

`logos/`: diez monogramas originales, tipografía geométrica y paleta navy/cyan/violeta. PNG 480 × 480, sin marcas de terceros. Los logos y las fotografías tienen funciones y archivos separados.

## Fotografía

`photos/`: fotografías de stock de Unsplash, descargadas y distribuidas localmente (1200 × 800 JPEG). Las URLs originales están en `photos/sources.json`. Licencia: https://unsplash.com/license (consultada el 20/11/2026). Las fotografías ambientan categorías y productos; no representan locales ni productos reales de estos comercios ficticios. No implican afiliación de las marcas visibles con la red.

El seed valida todos los archivos antes de escribir, sube las imágenes mediante Media y reutiliza las URLs en ejecuciones sucesivas. Los doce beneficios comparten diez fotografías según el comercio. Los logos anteriores usados como fotografía se reemplazan en la próxima ejecución del seed. No ejecutar contra producción para actualizar exclusivamente la presentación: el seed también renueva vigencias por 90 días.

## Forzar la recarga de imágenes

Si el seed se ejecutó con una URL incorrecta, corregir `DRAX_BASE_URL` en el `.env` del backend y ejecutar desde `back/` (o desde el backend compilado actualizado):

```sh
npm run seed:demo -- --overwrite
```

`--overwrite` vuelve a subir los diez logos y las diez fotografías y actualiza sus URLs en los comercios y beneficios del seed. Conserva IDs y cupones, y mantiene el comportamiento habitual de renovación de vigencias por 90 días. Las categorías y las descripciones de comercios existentes siguen reutilizándose. Sin el parámetro, las imágenes se reutilizan como antes.

Los archivos anteriores se conservan para no romper referencias existentes; cada ejecución con `--overwrite` genera nuevas cargas. El comando utiliza la base y el almacenamiento configurados en el entorno donde se ejecuta.
