# Frontend Benefits MVP

## Identidad de Leandro

- Landing pública: **`/leandro`**, enlazada desde la app bar, el catálogo, el menú y el footer. El catálogo continúa en `/`.
- Paleta propia: azul tinta, terracota y arena, con variantes claras/oscuras. Los colores están centralizados en `src/plugins/themes`; se conserva la preferencia de tema del usuario.
- App bar con monograma LA, navegación responsive, contacto y acceso a operadores; footer con teléfono público, WhatsApp e Instagram.
- Retrato real descargado del perfil público indicado por el cliente. Ilustraciones SVG originales creadas por IA, sin servicios externos ni retratos sintéticos. Fuentes y tratamiento: `src/assets/brand/README.md`.
- Contactos y foto centralizados en `src/modules/brand/brand.ts`; textos ES/EN en `brand-i18n.ts`. No se muestra la marca de la inmobiliaria ni su email corporativo. El enlace de Instagram conserva la URL original sin mostrar su handle.

## MVP de beneficios

- Público: `/` (catálogo, sección de destacados basada en `featured: true` y filtro de categoría), `/benefits/:id` (detalle/emisión) y `/coupons/:token` (cupón, QR local, copiar enlace, guardar PDF/imprimir).
- Administración: `/crud/company`, `/crud/category`, `/crud/benefit` usando CRUD Drax, relaciones y archivos de Drax Media.
- Consulta: `/crud/benefitclaim` requiere `benefitclaim:view`; paginación real de `/api/benefit-claims`, clave de fila `token`, sin create/edit/delete/import/export.
- Operador: `/operator/coupons` requiere `benefitclaim:view`. La cámara usa `BarcodeDetector` con `qr_code` cuando el navegador lo soporta y en contexto seguro (HTTPS/localhost); siempre existe ingreso manual de código/enlace. Escanear solo inspecciona. El canje requiere `benefitclaim:redeem` y confirmación explícita. La cámara se detiene al salir, ocultar la pestaña o completar lectura.
- Dashboard: `/benefits/statistics/overview` requiere `benefits:statistics`. Un único GET `/api/benefit-statistics` devuelve `{claims, redeemed, pending, byBenefit, byCompany}`. Ambos desgloses contienen `{id, name, generated, redeemed}` y se muestran directamente, sin descargar ni paginar cupones. Los pendientes por grupo son `generated - redeemed`; `pending` incluye vencidos. Los grupos históricos sin nombre muestran un texto alternativo.
- Usuarios: `/crud/user` conserva el formulario/validación/password de identidad Drax y añade `company` como relación editable por administradores. Roles/settings mantienen sus pantallas existentes. Los menús dependen de permisos, no de nombres de rol.
- Acceso backoffice: los operadores se crean desde la administración de usuarios, asignando rol y comercio cuando corresponda. El login no ofrece registro público ni acceso con Google; la ruta frontend Drax `Registration` (`/registration`) no se registra. Se mantienen login con contraseña, cambio de contraseña y recuperación de contraseña. Este ajuste del frontend no modifica los endpoints del backend.

### Privacidad y permisos

El QR se genera con `qrcode` dentro del navegador, sin servicios QR externos. Roboto e iconos se sirven localmente con las dependencias existentes, sin solicitudes a Google Fonts. Los cupones y códigos escaneados no se guardan en stores/localStorage ni se registran en consola. El adaptador HTTP de beneficios reutiliza URL base y headers del cliente REST Drax, pero evita su logger de URLs sensibles, usa `cache: no-store`, `referrerPolicy: no-referrer` y no envía el JWT en requests públicos. `index.html` incluye política global `no-referrer`; Vite dev/preview también devuelve `Referrer-Policy: no-referrer`.

**Despliegue:** servir el build como SPA con fallback a `index.html` para las URLs públicas/protegidas. Configurar también `Referrer-Policy: no-referrer` en el servidor/proxy de producción y evitar registrar URLs que contengan tokens (logs de acceso, analítica, reportes externos). El frontend no puede configurar los logs/headers de ese servidor. El enlace de cupón es una credencial y queda necesariamente en la URL/historial del navegador; se advierte al usuario que no lo publique.

MANAGER dispone de `file:upload` y `file:view`, por lo que puede cargar imágenes mediante Drax Media. La UI sigue verificando `file:upload` para habilitar la carga, sin depender del nombre del rol. El selector de imágenes admite únicamente formatos raster PNG, JPEG, WebP y GIF; el backend valida los archivos y rechaza SVG/HTML.

### Validación y build

```sh
npm run vuetsc
npm run test:benefits-api
npm run build
```

`test:benefits-api` usa `node:test` de Node 24 y el Vite existente para cargar el cliente real de Drax; verifica que las peticiones sin cuerpo no envíen `Content-Type`, que el canje conserve autorización y que las consultas públicas no envíen el JWT. No realiza solicitudes externas.

`npm run build` genera la salida en `../out/public` (relativo a `front/`), compatible con el despliegue existente de `Dockerfile` y `build.sh`. `npm run build:local` mantiene su salida en `../build/public`.

## Scaffold Vuetify original

This is the official scaffolding tool for Vuetify, designed to give you a head start in building your new Vuetify application. It sets up a base template with all the necessary configurations and standard directory structure, enabling you to begin development without the hassle of setting up the project from scratch.

## ❗️ Important Links

- 📄 [Docs](https://vuetifyjs.com/)
- 🚨 [Issues](https://issues.vuetifyjs.com/)
- 🏬 [Store](https://store.vuetifyjs.com/)
- 🎮 [Playground](https://play.vuetifyjs.com/)
- 💬 [Discord](https://community.vuetifyjs.com)

## 💿 Install

Set up your project using your preferred package manager. Use the corresponding command to install the dependencies:

| Package Manager                                                | Command        |
|---------------------------------------------------------------|----------------|
| [yarn](https://yarnpkg.com/getting-started)                   | `yarn install` |
| [npm](https://docs.npmjs.com/cli/v7/commands/npm-install)     | `npm install`  |
| [pnpm](https://pnpm.io/installation)                          | `pnpm install` |
| [bun](https://bun.sh/#getting-started)                        | `bun install`  |

After completing the installation, your environment is ready for Vuetify development.

## ✨ Features

- 🖼️ **Optimized Front-End Stack**: Leverage the latest Vue 3 and Vuetify 3 for a modern, reactive UI development experience. [Vue 3](https://v3.vuejs.org/) | [Vuetify 3](https://vuetifyjs.com/en/)
- 🗃️ **State Management**: Integrated with [Pinia](https://pinia.vuejs.org/), the intuitive, modular state management solution for Vue.
- 🚦 **Routing and Layouts**: Utilizes Vue Router for SPA navigation and vite-plugin-vue-layouts for organizing Vue file layouts. [Vue Router](https://router.vuejs.org/) | [vite-plugin-vue-layouts](https://github.com/JohnCampionJr/vite-plugin-vue-layouts)
- 💻 **Enhanced Development Experience**: Benefit from TypeScript's static type checking and the ESLint plugin suite for Vue, ensuring code quality and consistency. [TypeScript](https://www.typescriptlang.org/) | [ESLint Plugin Vue](https://eslint.vuejs.org/)
- ⚡ **Next-Gen Tooling**: Powered by Vite, experience fast cold starts and instant HMR (Hot Module Replacement). [Vite](https://vitejs.dev/)
- 🧩 **Automated Component Importing**: Streamline your workflow with unplugin-vue-components, automatically importing components as you use them. [unplugin-vue-components](https://github.com/antfu/unplugin-vue-components)
- 🛠️ **Strongly-Typed Vue**: Use vue-tsc for type-checking your Vue components, and enjoy a robust development experience. [vue-tsc](https://github.com/johnsoncodehk/volar/tree/master/packages/vue-tsc)

These features are curated to provide a seamless development experience from setup to deployment, ensuring that your Vuetify application is both powerful and maintainable.

## 💡 Usage

This section covers how to start the development server and build your project for production.

### Starting the Development Server

To start the development server with hot-reload, run the following command. The server will be accessible at [http://localhost:3000](http://localhost:3000):

```bash
yarn dev
```

(Repeat for npm, pnpm, and bun with respective commands.)

> Add NODE_OPTIONS='--no-warnings' to suppress the JSON import warnings that happen as part of the Vuetify import mapping. If you are on Node [v21.3.0](https://nodejs.org/en/blog/release/v21.3.0) or higher, you can change this to NODE_OPTIONS='--disable-warning=5401'. If you don't mind the warning, you can remove this from your package.json dev script.

### Building for Production

To build your project for production, use:

```bash
yarn build
```

(Repeat for npm, pnpm, and bun with respective commands.)

Once the build process is completed, your application will be ready for deployment in a production environment.

## 💪 Support Vuetify Development

This project is built with [Vuetify](https://vuetifyjs.com/en/), a UI Library with a comprehensive collection of Vue components. Vuetify is an MIT licensed Open Source project that has been made possible due to the generous contributions by our [sponsors and backers](https://vuetifyjs.com/introduction/sponsors-and-backers/). If you are interested in supporting this project, please consider:

- [Requesting Enterprise Support](https://support.vuetifyjs.com/)
- [Sponsoring John on Github](https://github.com/users/johnleider/sponsorship)
- [Sponsoring Kael on Github](https://github.com/users/kaelwd/sponsorship)
- [Supporting the team on Open Collective](https://opencollective.com/vuetify)
- [Becoming a sponsor on Patreon](https://www.patreon.com/vuetify)
- [Becoming a subscriber on Tidelift](https://tidelift.com/subscription/npm/vuetify)
- [Making a one-time donation with Paypal](https://paypal.me/vuetify)

## 📑 License
[MIT](http://opensource.org/licenses/MIT)

Copyright (c) 2016-present Vuetify, LLC
