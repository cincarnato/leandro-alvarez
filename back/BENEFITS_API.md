# Benefits MVP — contrato backend/frontend

Implementado exclusivamente en `back/`, con MongoDB y Drax instalado. No requiere dependencias nuevas.

## Endpoints del MVP

Todos los éxitos devuelven **HTTP 200**. Los endpoints públicos y la emisión no requieren autenticación. Los protegidos utilizan el JWT/API key y RBAC existentes de Drax.

| Método | URL | Entrada | Respuesta | Permiso |
| --- | --- | --- | --- | --- |
| GET | `/api/public/benefits` | `?category=<ObjectId>` opcional | `{items: PublicBenefit[]}` | Público |
| GET | `/api/public/benefits/:id` | ObjectId del beneficio | `PublicBenefit` | Público |
| GET | `/api/public/categories` | Sin parámetros | `{items: [{_id, name}]}` | Público |
| POST | `/api/benefits/:id/claim` | ObjectId del beneficio; sin body | `Coupon` | Público |
| GET | `/api/public/benefit-claims/:token` | Token hexadecimal de 64 caracteres | `Coupon` | Público |
| GET | `/api/benefit-claims` | Paginación Drax | `{page, limit, total, items: Coupon[]}` | `benefitclaim:view` |
| GET | `/api/benefit-claims/:token/inspect` | Token | `Coupon` | `benefitclaim:view` |
| POST | `/api/benefit-claims/:token/redeem` | Token; sin body | `Coupon` actualizado | `benefitclaim:redeem` |
| GET | `/api/benefit-statistics` | Sin parámetros | `{claims, redeemed, pending, byBenefit, byCompany}` | `benefits:statistics`; nunca MERCHANT |

Las respuestas de generación, lectura pública, listado protegido, inspección y canje de cupones incluyen `Cache-Control: no-store` y `Referrer-Policy: no-referrer`, también en errores y rate limiting. Estas cabeceras se aplican asimismo al catálogo, categorías y estadísticas en el plugin MVP.

Las rutas desconocidas `/api` y `/api/...` devuelven **404 JSON** para cualquier método; nunca se resuelven al HTML de la SPA. El fallback SPA se conserva fuera de ese namespace.

### Formato de cupón

```ts
type PublicBenefit = {
  _id: string
  title: string
  description?: string
  image?: string
  startDate: string // ISO date-time
  endDate: string   // ISO date-time
  conditions: string
  active?: boolean
  featured: boolean // Incluido también en catálogo y detalle; false en registros legacy sin flag.
  company: {_id: string; name: string; logo?: string; active?: boolean} | null
  category: {_id: string; name: string} | null
}

type Coupon = {
  token: string
  createdAt: string // ISO date-time
  redeemedAt: string | null // ISO date-time si fue canjeado
  benefit: PublicBenefit | null
}
```

- Ni los cupones ni el catálogo devuelven contactos, CUIT, datos de usuario, `redeemedBy` ni campos internos. El operador de canje se conserva únicamente en el registro privado.
- Campos opcionales no cargados pueden estar ausentes. Las relaciones eliminadas mediante ABM se representan con `null` en cupones históricos; estos no pueden canjearse. El catálogo y el detalle público excluyen relaciones faltantes.
- Usar `token` como clave de fila del listado de cupones; su respuesta no incluye el `_id` interno del claim.
- El catálogo no está paginado en este MVP y ordena por `featured` descendente. Solo incluye beneficios con `active=true`, empresa activa y `startDate <= ahora <= endDate`.
- Categorías devuelve todas las categorías, ordenadas por nombre. El filtro `category` usa el `_id`, no el nombre.
- El detalle público de un beneficio no disponible devuelve 404.
- Cada emisión genera un cupón nuevo con `randomBytes(32)` y token protegido por un índice Mongo único.
- Un cupón existente sigue siendo legible/inspeccionable después de vencer o desactivarse el beneficio/empresa; la emisión y el canje se rechazan con 404.
- El canje es atómico: actualización Mongo condicionada a `redeemedAt: null`. Un segundo canje, incluso concurrente, devuelve 400 sin cambiar fecha ni operador.
- `pending = claims - redeemed`: cuenta todos los cupones no canjeados, incluidos los que ya no están vigentes.

### Estadísticas server-side

```ts
type StatisticsBreakdown = {
  id: string
  name: string
  generated: number
  redeemed: number
}
type BenefitStatistics = {
  claims: number
  redeemed: number
  pending: number
  byBenefit: StatisticsBreakdown[]
  byCompany: StatisticsBreakdown[]
}
```

- Un único GET `/api/benefit-statistics` devuelve los totales y ambos breakdowns mediante una agregación Mongo en `BenefitClaimMongoRepository`. **No recorrer ni paginar todos los cupones en frontend para calcular estadísticas.**
- `byBenefit.id` es el ID del beneficio y `name` su título; `byCompany.id` es el ID de la empresa y `name` su nombre. `generated` cuenta emisiones; `redeemed` cuenta canjes. Solo aparecen grupos con emisiones, ordenados por `name` y luego `id`.
- Sin claims, los totales son cero y ambos arrays están vacíos. Los claims históricos siguen contando aunque el beneficio o empresa se desactiven o eliminen: los nombres no disponibles son `""`, y la empresa no identificable tras eliminar un beneficio se agrupa con `id: ""` y `name: ""`.
- No devuelve tokens, cupones, contactos ni operadores. Los nombres/relaciones son los actuales, no un snapshot histórico.
- Revisado `front/src/modules/benefits/providers/BenefitsApi.ts`: ya consulta este endpoint directamente; su `BenefitStatistics` actual solo declara los tres totales y su `PublicBenefit` todavía no declara `featured`. Sin modificar frontend, las claves exactas ampliadas quedan documentadas aquí para extender esos tipos cuando corresponda.

### Paginación protegida

```text
GET /api/benefit-claims?page=1&limit=10&orderBy=createdAt&order=desc
GET /api/benefit-claims?filters=redeemedAt;empty;
```

`page` es entero >= 1. `limit` es entero entre 1 y 100; defaults Drax: `page=1`, `limit=10`. Admite `search`, `orderBy`, `order` y `filters` del CRUD Drax. Los filtros del MERCHANT se añaden en backend como condiciones AND y no pueden ampliarse con filtros/OR del cliente. El total también queda restringido a su empresa.

## ABMs generados registrados

Se conservaron los nombres **singulares** generados; no confundirlos con `/api/benefits/:id/claim`:

| Entidad | Base real | Permisos existentes |
| --- | --- | --- |
| Company | `/api/company` | `company:create/update/delete/view/manage` |
| Category | `/api/category` | `category:create/update/delete/view/manage` |
| Benefit | `/api/benefit` | `benefit:create/update/delete/view/manage` |

Cada base expone GET paginado, POST create; `/:id` GET/PUT/PATCH/DELETE; y las acciones generadas `/find`, `/find-one`, `/search`, `/group-by`, `/export` (GET) y `/import` (POST).

- Company: `name` requerido; `description`, `logo`, `cuit`, `contactName`, `contactEmail`, `contactPhone`, `active` opcionales. Create sin `active` utiliza `true`.
- Category: `name` requerido; `description` opcional.
- Benefit: `title`, `company`, `category`, `startDate`, `endDate`, `conditions` requeridos; `description`, `image`, `active`, `featured` opcionales. Relaciones de entrada son ObjectId strings; de salida, objetos poblados. Create sin flags utiliza `active=true`, `featured=false`.
- `endDate >= startDate` se valida en create/PUT/PATCH. PATCH valida la combinación del registro persistido con el payload y no introduce defaults en campos ausentes.
- No existe CRUD genérico de claims: ni POST/PUT/PATCH/DELETE, import/export, búsqueda genérica ni el antiguo `/api/benefitclaim`. Devuelven 404.

## Upload de logos/imágenes con Media Drax

El setup aplica un límite de upload de **5 MiB** si `DRAX_MAX_UPLOAD_SIZE` no está configurado, evitando el fallback de 1 byte del StoreManager instalado. El upload HTTP queda acotado a **5 MiB máximo**, tanto en la configuración multipart del servidor como por petición; se respeta un límite configurado menor. El buffer de validación se obtiene con `toBuffer()` bajo ese límite, nunca mediante una lectura ilimitada.

El MANAGER recibe exclusivamente `file:upload` (MediaPermissions.UploadFile) y `file:view` (FilePermissions.View). No recibe `file:viewAll`, `file:manage`, `file:create`, `file:update`, `file:delete` ni variantes globales.

- POST `/api/file/:dir`, por ejemplo `/api/file/company` para logos o `/api/file/benefit` para imágenes: multipart con un único archivo y autenticación Drax. Devuelve `{filename, filepath, size, mimetype, url}`. Guardar `url` en `Company.logo` o `Benefit.image` mediante su ABM.
- Todos los uploads por esta ruta, **incluidos ADMIN**, admiten únicamente PNG (`image/png`, `.png`), JPEG (`image/jpeg`, `.jpg`/`.jpeg`), WebP (`image/webp`, `.webp`) y GIF (`image/gif`, `.gif`). MIME, extensión y firma binaria/estructura básica deben coincidir; no basta con renombrar un HTML/SVG como PNG. Se rechazan vacíos, formatos no permitidos, firmas falsas y truncamientos detectables antes de llamar a `MediaService` de Drax. La validación no es un decoder completo ni transcodifica imágenes; no agrega dependencias ni modifica `node_modules`.
- HTML y SVG dejan de estar permitidos en este endpoint. Los rechazos de tipo/contenido devuelven 400; sobrepasar el límite multipart devuelve 413. Los rechazos no crean archivos ni metadatos.
- GET `/api/file` y GET `/api/file/:id`: lectura de metadatos restringida a archivos propios (`createdBy.id`). Una extensión local corrige el chequeo de dueño anidado del detalle GET/HEAD instalado en Drax; el listado conserva sus filtros de usuario. No se concede acceso a la biblioteca global.
- GET `/api/file/:dir/:year/:month/:filename`: descarga pública existente de Drax; no requiere permisos adicionales para mostrar logos/imágenes en el catálogo. GET/HEAD incluyen `X-Content-Type-Options: nosniff` y `Content-Security-Policy: default-src 'none'; sandbox` para evitar sniffing/ejecución same-origin, también como defensa para archivos antiguos. No se eliminan ni convierten archivos previos: revisar los HTML/SVG existentes al desplegar.
- Las mutaciones genéricas de archivos y DELETE de la imagen siguen denegadas para MANAGER. MERCHANT no tiene upload ni lectura administrativa de archivos.

## Roles y extensión de User

| Rol | Acceso |
| --- | --- |
| ADMIN | Todos los permisos cargados del sistema |
| MANAGER | CRUD company/category/benefit, view/redeem claims, estadísticas y upload/lectura propia de imágenes; sin permisos user/role/settings ni administración de archivos |
| MERCHANT | Solo view/redeem claims de su empresa; sin estadísticas |

El setup crea/actualiza estos roles. Se mantiene el `Admin` histórico y el usuario root existentes para compatibilidad; `ADMIN` también dispone de todos los permisos.

La extensión de User utiliza el schema Mongo exportado y el servicio/factory de Drax, sin editar `node_modules` ni el JWT:

- POST `/api/users` y PUT `/api/users/:id` aceptan `company: ObjectId | null` junto con sus campos Drax existentes.
- Solo usuarios con los permisos de administración de usuarios existentes pueden asignarla; MANAGER/MERCHANT no pueden hacerlo.
- Un User con rol MERCHANT debe tener una empresa existente. IDs inválidos, inexistentes o empresa faltante devuelven 422.
- Los responses Drax de User y `/api/auth/me` incluyen `company` como ID o null.
- Para listado/inspect/redeem del MERCHANT se consulta su User persistido por el servicio de identidad en cada petición. No se confía en una empresa suministrada por payload, query o JWT; una reasignación aplica aunque conserve su token anterior. Un MERCHANT inactivo o sin empresa recibe 403.
- No hay registro de visitantes: POST `/api/users/register` devuelve **404 JSON** con `Cache-Control: no-store`, incluso con datos válidos o sesión administrativa, y no crea usuarios. La ruta queda oculta en Swagger.
- Google no se registra en el factory MVP: POST `/api/google/login` y POST `/api/google/logout` devuelven **404 JSON**; el módulo fuente se conserva sin cambios. No existe autoalta Google de operadores.
- Los operadores se crean únicamente desde administración mediante POST `/api/users`, con los permisos de creación de usuarios de ADMIN. Se conserva el ABM administrativo y el login de usuarios existentes por POST `/api/auth/login`; MANAGER/MERCHANT no pueden crear operadores. Los visitantes utilizan catálogo y cupones sin cuenta.
- Las rutas administrativas existentes `/api/settings`, `/api/settings/grouped`, `/api/settings/:key` y PATCH `/api/settings/:id` exigen los permisos de settings correspondientes a usuarios autenticados; MANAGER/MERCHANT reciben 403. Se conservan las lecturas anónimas de settings explícitamente públicos que Drax ya filtraba; grouped y PATCH siempre requieren permisos.

## Logs de acceso

Los serializers `req` y `res` de `FastifyServer` utilizan `redactLogUrl`:

- `/api/public/benefit-claims/:token` → `/api/public/benefit-claims/[REDACTED]`.
- `/api/benefit-claims/:token/inspect|redeem` → segmento token `[REDACTED]`.
- También se oculta el token en `/coupons/:token`, cuando el backend sirve la SPA.
- También oculta tokens inválidos o percent-encoded. La redacción no depende del formato hexadecimal válido.
- Se oculta **toda la query** (`?[REDACTED]`), no solo una lista de claves: `filters`, URLs anidadas o nombres de parámetros inesperados también pueden contener secretos.
- Se prueba el helper y la salida real de Pino/Fastify tanto en logs de petición como de respuesta.
- Los errores inesperados de `BenefitsController` registran únicamente un mensaje estático y `errorName` de una lista permitida (fallback `Error`). Nunca registran el error original, mensaje, stack, cause, `keyValue`, body ni parámetros; la respuesta es 500 `{error: 'error.server'}`.

## Errores y límites

- 401: falta autenticación en endpoint protegido (se mantienen también los errores JWT de Drax).
- 403: permiso insuficiente, empresa ajena o MERCHANT sin asignación válida.
- 404: recurso/token inexistente o beneficio no disponible para detalle/emisión/canje.
- 400: cupón ya canjeado; `limit` superior al máximo Drax; upload no raster, con MIME/extensión/firma incompatibles o multipart no válido.
- 413: imagen que excede el límite de upload.
- 422: validación Zod, rango de fechas inválido, relación inexistente, token/ID inválido en endpoints MVP o paginación no válida.
- 429: límite por IP, con `Retry-After` cuando se agotó la ventana de una IP.

Ventana fija de 60 segundos, por proceso: lecturas públicas comparten 60 requests/IP; emisión 10/IP; canje 30/IP. Mapas limitados a 10.000 IPs cada uno y limpieza perezosa de entradas vencidas, sin timer ni dependencia adicional. No se confía en `X-Forwarded-For`; tras un proxy, el despliegue debe ajustar conscientemente el manejo de IP. En múltiples procesos/instancias los límites son independientes (no distribuidos).

## Validación

```sh
npm run typecheck
npm run test:benefits
```

Suite `node:test` + `MongoInMemory` con rutas, login y RBAC reales de Drax: defaults/PATCH, fechas combinadas, relaciones, catálogo, privacidad, tokens únicos, vigencia, canje concurrente, permisos, scopes por empresa, reasignación de User.company, ABMs, ausencia de rutas peligrosas, estadísticas, rate limiting, redacción real de logs, upload/descarga raster y rechazo de HTML/SVG/spoofs/truncados/sobredimensionados sin persistencia.

`npm test` también descubre los cinco archivos previos que importan `vitest`; esos archivos fallan bajo el runner `node:test` configurado originalmente (`Vitest failed to access its internal state`). No se modificaron los tests ajenos al MVP.
