# Red de Beneficios — Leandro Alvarez

MVP sobre Drax: catálogo público, cupones individuales sin registro y backoffice para administrar comercios, categorías, beneficios y canjes.

## Uso del MVP

- `/`: catálogo vigente y destacados, con filtro por categoría.
- `/benefits/:id`: detalle y obtención de cupón.
- `/coupons/:token`: enlace privado del cupón, QR local, copia e impresión.
- El menú del backoffice muestra las pantallas según los permisos de ADMIN, MANAGER o MERCHANT.
- Para un operador MERCHANT, asignar su comercio en el ABM de usuarios. El backend restringe consultas y canjes a ese comercio.
- El setup existente inicializa los roles al iniciar el backend. Utilizar MongoDB; el flujo de canje atómico y las estadísticas del MVP están implementados para ese motor.

Contrato, permisos, límites y seguridad: [back/BENEFITS_API.md](back/BENEFITS_API.md). Detalles de frontend y despliegue: [front/README.md](front/README.md).

### Node y PM2 en producción

Usar Node 24 tanto para desarrollo como para producción, igual que en el Dockerfile. La versión está declarada en `.nvmrc` y en `back/package.json`; este último se copia al build.

Si aparece `ERR_MODULE_NOT_FOUND: Cannot find package 'stream'` desde `StreamFileStore.js`, comprobar la versión de Node que ejecuta PM2 con `pm2 describe LEANDRO-ALVAREZ`. Drax importa `stream/promises`, un módulo nativo disponible desde Node 15; no se soluciona instalando el paquete `stream` de npm. Un daemon antiguo puede seguir usando otro Node aunque `node -v` en la consola muestre una versión actual.

En el servidor, desde la raíz del proyecto y con nvm instalado:

```bash
nvm install 24
nvm use 24
node -v
npm install -g pm2@6.0.14
pm2 update
```

`pm2 update` actualiza el daemon y restaura los procesos guardados, por lo que puede reiniciar otras aplicaciones administradas por ese mismo PM2. Antes de reiniciar esta aplicación, configurar `interpreter: process.execPath` en su entrada de `ecosystem.config.cjs`, como en el archivo de ejemplo. En modo cluster también debe estar actualizado el Node del daemon.

Si `out/` ya contiene el despliegue, reinstalar las dependencias con Node 24 para actualizar también los módulos nativos y reiniciar:

```bash
cd out
npm install --omit=dev
npm rebuild --omit=dev
cd ..
pm2 restart ecosystem.config.cjs --only LEANDRO-ALVAREZ --update-env
pm2 describe LEANDRO-ALVAREZ
pm2 logs LEANDRO-ALVAREZ --lines 50 --nostream
pm2 save
```

Verificar que `node.js version` en `pm2 describe` indique 24.x. Si PM2 arranca mediante un servicio del sistema, regenerarlo después de cambiar Node con `pm2 unstartup` y `pm2 startup`, siguiendo las instrucciones que imprimen estos comandos, y ejecutar `pm2 save` nuevamente.

Referencias: [streams nativos de Node](https://nodejs.org/api/stream.html#streams-promises-api) y [actualización de PM2 y Node](https://pm2.keymetrics.io/docs/usage/update-pm2/).

### Verificación

Desde `back/`: `npm run typecheck`, `npm run test:benefits` y `npm run build`.
Desde `front/`: `npm run build` (incluye `vue-tsc` y genera `out/public`).

La suite nueva usa `node:test` y MongoInMemory. La ejecución general `npm test` también descubre tests anteriores de Vitest incompatibles con ese runner; no fueron modificados.

Los schemas declarativos están en `arch/src/schemas/benefits`. `npm run build` y `npm run copy:safe` desde `arch/` regeneran el scaffold sin sobrescribir las personalizaciones existentes. `arch/output/` es una salida regenerable no versionada.

## Scaffold Drax

El proyecto reutiliza el scaffold y los módulos existentes de Drax Framework.

El repositorio esta organizado como monorepo con tres paquetes principales:

- `front/`: aplicacion frontend con Vue 3 y Vuetify.
- `back/`: API backend con Fastify, MongoDB, Zod y Vitest.
- `arch/`: paquete de arquitectura y generacion basado en `@drax/arch`.

## AI skills

Este scaffold usa `.agent` como submodulo Git para compartir los skills de agentes entre proyectos Drax.

El submodulo apunta a:

```text
https://github.com/draxjs/ai-skills.git
```

La carpeta `.agent` no es una copia local de archivos versionados por este repositorio. Es un puntero a un commit especifico del repositorio compartido de skills.

## Clonar el scaffold

Para clonar el proyecto con los skills ya descargados:

```bash
git clone --recurse-submodules <repo-url>
```

Si el proyecto ya fue clonado sin submodulos, inicializar `.agent` con:

```bash
git submodule update --init --recursive
```

## Sincronizar skills

Para configurar el submodulo en un proyecto viejo que todavia tiene `.agent` como carpeta local:

```bash
./init-agent-skills.sh
```

Ese script revisa si `.agent` ya esta configurado como submodulo. Si no lo esta, mueve la carpeta local existente a un backup `.agent.local-backup-<timestamp>` y agrega `https://github.com/draxjs/ai-skills.git` como submodulo en `.agent`.

Para inicializar o sincronizar `.agent` con la ultima version del repositorio compartido:

```bash
./update-agent-skills.sh
```

El script:

- inicializa `.agent` si todavia no fue descargado;
- sincroniza la configuracion del submodulo;
- actualiza `.agent` desde la rama `main` de `draxjs/ai-skills`;
- deja staged el nuevo puntero del submodulo cuando hay cambios.

Luego de sincronizar, commitear el puntero actualizado:

```bash
git commit -m "Update shared AI skills"
```

Tambien se puede pedir al script que cree el commit:

```bash
./update-agent-skills.sh --commit
```

Para usar otro mensaje:

```bash
./update-agent-skills.sh --commit --message "Update Drax AI skills"
```

## Comandos utiles

Ver el commit actual del submodulo:

```bash
git submodule status .agent
```

Actualizar manualmente sin script:

```bash
git submodule update --remote .agent
git add .agent
git commit -m "Update shared AI skills"
```

## Actualizar dependencias Drax

El scaffold incluye un script para actualizar dependencias `@drax/*` en:

- `arch/package.json`
- `back/package.json`
- `front/package.json`

El script consulta npm para cada dependencia que empieza con `@drax/` y actualiza el `package.json` a la ultima version disponible solo si la version mayor no cambia. Por ejemplo, puede actualizar de `^3.60.0` a `^3.61.2`, pero no de `^3.60.0` a `4.0.0`.

Despues de modificar los `package.json`, ejecuta `npm install` en cada paquete actualizado para regenerar el `package-lock.json`.

Ejecutar:

```bash
./update-drax-dependencies.mjs
```

Para revisar que cambios haria sin modificar archivos ni ejecutar `npm install`:

```bash
./update-drax-dependencies.mjs --dry-run
```

Para actualizar solo los `package.json` sin correr `npm install`:

```bash
./update-drax-dependencies.mjs --no-install
```
