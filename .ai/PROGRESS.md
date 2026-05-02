# PROGRESS.md — Estado del Proyecto FluxSQL

> Este archivo es actualizado automáticamente por el agente de IA al completar cada issue.
> Sirve como memoria del proyecto: qué se hizo, qué decisiones se tomaron, qué hay que tener en cuenta.

**Última actualización:** 2026-05-02
**Issues completadas:** 5 / 38

***

## Resumen General

| Milestone | Issues | Completadas | Estado |
|---|---|---|---|
| v0.1 — Setup Base | #1 al #8 | 5/8 | 🔄 En progreso |
| v0.2 — Canvas + Editor | #9 al #18 | 0/10 | ⬜ Pendiente |
| v0.3 — Realtime + Versiones | #19 al #28 | 0/10 | ⬜ Pendiente |
| v0.4 — UI/UX Polish | #29 al #38 | 0/10 | ⬜ Pendiente |

***

## Milestone v0.1 — Setup Base

### ✅ Issue #1 — Setup Monorepo Next.js + pnpm + Turborepo
**Branch:** `chore/issue-1-setup-monorepo`
**Completada:** 2026-05-01

**Lo que se hizo:**
- Inicializado monorepo con pnpm workspaces y Turborepo 2.9.7
- Creado `pnpm-workspace.yaml` con `apps/*` y `packages/*`
- Configurado `turbo.json` con tareas: build, dev, lint, test, clean
- Agregados scripts en `package.json` raíz: `build`, `dev`, `lint`
- Next.js 16.2.4 con Turbopack funcionando en `apps/web`
- Paquetes registrados en el monorepo: `parsers`, `ui`, `web`

**Notas importantes para el futuro:**
- `pnpm build` ejecuta exitosamente los 3 packages
- El flag `-w` es necesario para instalar dependencias en la raíz del monorepo: `pnpm add <pkg> -w`
- Para instalar en un workspace específico: `pnpm add <pkg> --filter web`
- `DATABASE_URL` debe usar el pooler de Supabase (puerto 6543), NO el puerto directo (5432)

***

### ✅ Issue #2 — Drizzle ORM + Supabase Schema
**Branch:** `feat/issue-2-drizzle-schema`
**Completada:** 2026-05-02

**Lo que se hizo:**
- Creado `apps/web/lib/db/schema.ts` definiendo las tablas `users`, `projects`, `collaborators`, `diagrams` y `diagram_versions`.
- Implementado el singleton de conexión a DB con `postgres.js` en `apps/web/lib/db/index.ts`.
- Configurado `apps/web/drizzle.config.ts`.
- Agregadas las dependencias de `drizzle-orm` y `drizzle-kit`.
- Ejecutado `pnpm drizzle-kit generate` para generar `0000_happy_fat_cobra.sql`.
- Agregado archivo `.env.local` de muestra.

**Notas importantes para el futuro:**
- ✅ La conexión usa el paquete `drizzle-orm/postgres-js` con `postgres.js`, no `drizzle-orm/postgres`
- ✅ La tabla `collaborators` tiene un constraint `unique('collaborators_project_id_user_id_unique').on(table.projectId, table.userId)`
- ✅ `drizzle.config.ts` utiliza el config con variables inyectadas de `.env.local`
- ❌ No se realizó push directo a la BD por falta de conexión configurada (solo generate)

***

### ✅ Issue #3 — Auth: Registro de Usuario
**Branch:** `feat/issue-3-auth-register`
**Completada:** 2026-05-02

**Lo que se hizo:**
- Creados clientes de Supabase para SSR: `lib/supabase/client.ts` (para Client Components) y `lib/supabase/server.ts` (para Server Components/Actions con manejo de cookies).
- Implementado el Server Action en `actions/auth/register.ts` con validación Zod, registro en Supabase Auth y sincronización manual en `public.users` usando Drizzle.
- Creado componente `RegisterForm.tsx` utilizando shadcn (`Input`, `Button`, `Label`, `Card`) adaptado a la paleta de FluxSQL.
- Creada la ruta pública `app/(public)/register/page.tsx`.
- Se gestiona la redirección fuera del bloque `try/catch` de acuerdo a los requerimientos de Next.js.
- Añadidas librerías Zod y los correspondientes componentes shadcn.

**Notas importantes para el futuro:**
- ✅ Se maneja el error de forma limpia retornando `{ error: string }`, sin relanzar la excepción para evitar pantallas de error no controladas en Next.js.
- ✅ El rollback ante fallos en la BD `public.users` se efectúa en un bloque `catch` invocando el admin de Supabase para eliminar el registro de Auth, utilizando para ello el `SUPABASE_SERVICE_ROLE_KEY` si se encuentra presente o su variante.
- ✅ La validación en el Server Action utiliza `result.error.issues[0].message` en lugar de `errors[0]` dado que `ZodError` expone primariamente el arreglo `issues`.

***

### ✅ Issue #4 — Auth: Login y Sesión
**Branch:** `feat/issue-4-auth-login`
**Completada:** 2026-05-02

**Lo que se hizo:**
- Creado `middleware.ts` en la raíz de `apps/web/` con el patrón `@supabase/ssr` (`setAll`), validación con `getUser()` y exclusión de rutas estáticas en el matcher.
- Implementado Server Action `login.ts` mapeando errores genéricos de Supabase a español.
- Implementado Server Action `logout.ts` para limpieza de cookies de sesión.
- Creado componente cliente `LoginForm.tsx` y su ruta pública `app/(public)/login/page.tsx`.
- Creada página placeholder protegida en `app/(protected)/dashboard/page.tsx`.

**Notas importantes para el futuro:**
- ✅ El middleware de Next.js verifica la sesión invocando `getUser()` en lugar de `getSession()` para asegurar validación del servidor contra el backend de Supabase.
- ✅ Al invocar `setAll` en el middleware, es fundamental actualizar `request.cookies.set()` y `supabaseResponse.cookies.set()` tal cual fue documentado.
- ✅ La redirección `redirect()` en las Server Actions debe ubicarse fuera de los bloques `try/catch`.

***

### ✅ Issue #5 — Crear y Listar Proyectos
**Branch:** `feat/issue-5-crud-projects`
**Completada:** 2026-05-02

**Lo que se hizo:**
- Creada función `getProjectsByUser` en `actions/projects/list.ts` que consulta proyectos uniendo las tablas `projects` y `collaborators` filtrando estrictamente por el `userId` local (obtenido desde `users` mapeando el `auth.id`).
- Implementado el Server Action `createProjectAction` en `actions/projects/create.ts` que efectúa un INSERT transaccional (`db.transaction`) tanto en la tabla `projects` como en `collaborators` (asignando el rol `owner`).
- Reemplazado el placeholder en `app/(protected)/dashboard/page.tsx` por un Server Component real que inyecta la cabecera completa y pasa los proyectos a `ProjectList`.
- Desarrollados componentes de cliente en `components/dashboard/`: `ProjectList`, `ProjectCard`, `EmptyState` y `CreateProjectModal`.
- Añadidos componentes base de UI usando `shadcn`: `Dialog`, `Textarea` y `Badge`.

**Notas importantes para el futuro:**
- ✅ Siempre se debe mapear primero el `auth.id` que provee `supabase.auth.getUser()` con la tabla `users` para obtener el ID de registro de la base local, garantizando integridad en las llaves foráneas.
- ✅ Los `INSERT` en tablas lógicamente acopladas (como `projects` y `collaborators`) DEBEN englobarse en transacciones `db.transaction()` para evitar proyectos huérfanos si un `INSERT` falla a medias.
- ✅ Para actualizar instantáneamente la vista luego de Server Actions como creaciones o modificaciones, la llamada a `revalidatePath()` es esencial y suficiente en Next.js App Router.

***

### ⬜ Issue #6 — Parser SQL PostgreSQL → Nodos React Flow
**Branch:** `feat/issue-6-parser-postgresql`
**Completada:** —

**Criterios pendientes:**
- [ ] Función `parseSQL(ddl, 'postgresql')` en `@fluxsql/parsers`
- [ ] Detecta tablas, columnas, tipos, PKs
- [ ] Detecta FKs (REFERENCES) y genera edges

***

### ⬜ Issue #7 — Parser T-SQL Server + MySQL
**Branch:** `feat/issue-7-parser-sqlserver-mysql`
**Completada:** —

**Criterios pendientes:**
- [ ] Parser acepta parámetro `dialect`
- [ ] Soporte de tipos especiales (AUTO_INCREMENT, IDENTITY)
- [ ] FKs via `ALTER TABLE ... ADD CONSTRAINT`

***

### ⬜ Issue #8 — GitHub Actions CI + Snyk
**Branch:** `chore/issue-8-ci-snyk`
**Completada:** —

**Criterios pendientes:**
- [ ] `.github/workflows/ci.yml` con build + lint
- [ ] `.github/workflows/snyk.yml` con token de Snyk
- [ ] Workflows en Push y PR a `main`

***

## Milestone v0.2 — Canvas + Editor

### ⬜ Issue #9 — Canvas React Flow con nodos arrastrables
**Branch:** `feat/issue-9-react-flow-canvas` | **Completada:** —

### ⬜ Issue #10 — Nodos de tabla personalizados (columnas, tipos, PK/FK)
**Branch:** `feat/issue-10-custom-nodes` | **Completada:** —

### ⬜ Issue #11 — Edges de relaciones FK con cardinalidad
**Branch:** `feat/issue-11-custom-edges` | **Completada:** —

### ⬜ Issue #12 — Monaco Editor con syntax highlighting SQL
**Branch:** `feat/issue-12-monaco-editor` | **Completada:** —

### ⬜ Issue #13 — Sync editor ↔ canvas en tiempo real (debounce 300ms)
**Branch:** `feat/issue-13-realtime-sync` | **Completada:** —

### ⬜ Issue #14 — Soporte JSON Schema → nodos NoSQL
**Branch:** `feat/issue-14-parser-json-schema` | **Completada:** —

### ⬜ Issue #15 — Guardar diagrama en Supabase
**Branch:** `feat/issue-15-save-diagram` | **Completada:** —

### ⬜ Issue #16 — Cargar diagrama existente
**Branch:** `feat/issue-16-load-diagram` | **Completada:** —

### ⬜ Issue #17 — Export PNG y SVG
**Branch:** `feat/issue-17-export-images` | **Completada:** —

### ⬜ Issue #18 — Export Mermaid .mmd
**Branch:** `feat/issue-18-export-mermaid` | **Completada:** —

***

## Milestone v0.3 — Realtime + Versiones

### ⬜ Issue #19 — Invitar colaborador al proyecto
**Branch:** `feat/issue-19-invite-collaborator` | **Completada:** —

### ⬜ Issue #20 — Realtime: cursores de colaboradores
**Branch:** `feat/issue-20-realtime-cursors` | **Completada:** —

### ⬜ Issue #21 — Sync de posición de nodos en tiempo real
**Branch:** `feat/issue-21-realtime-nodes` | **Completada:** —

### ⬜ Issue #22 — Version control: commit con mensaje
**Branch:** `feat/issue-22-version-commit` | **Completada:** —

### ⬜ Issue #23 — Historial de versiones (sidebar)
**Branch:** `feat/issue-23-version-history` | **Completada:** —

### ⬜ Issue #24 — Restaurar versión anterior
**Branch:** `feat/issue-24-version-restore` | **Completada:** —

### ⬜ Issue #25 — Comparar 2 versiones (Diff Editor)
**Branch:** `feat/issue-25-version-diff` | **Completada:** —

### ⬜ Issue #26 — Link público de solo lectura
**Branch:** `feat/issue-26-public-link` | **Completada:** —

### ⬜ Issue #27 — Búsqueda de tablas (Command Palette Ctrl+K)
**Branch:** `feat/issue-27-command-palette` | **Completada:** —

### ⬜ Issue #28 — Tests E2E con Playwright
**Branch:** `feat/issue-28-e2e-playwright` | **Completada:** —

***

## Milestone v0.4 — UI/UX Polish

### ⬜ Issue #29 — Landing Hero con demo animada
**Branch:** `feat/issue-29-landing-hero` | **Completada:** —

### ⬜ Issue #30 — Landing sección features
**Branch:** `feat/issue-30-landing-features` | **Completada:** —

### ⬜ Issue #31 — Landing pricing + footer
**Branch:** `feat/issue-31-landing-pricing` | **Completada:** —

### ⬜ Issue #32 — Dashboard en grid con tarjetas
**Branch:** `feat/issue-32-dashboard-grid` | **Completada:** —

### ⬜ Issue #33 — Tema oscuro/claro con next-themes
**Branch:** `feat/issue-33-dark-mode` | **Completada:** —

### ⬜ Issue #34 — Toolbar del editor con tooltips
**Branch:** `feat/issue-34-toolbar` | **Completada:** —

### ⬜ Issue #35 — Responsive tablet 768px+
**Branch:** `feat/issue-35-responsive` | **Completada:** —

### ⬜ Issue #36 — Onboarding tour (primera vez)
**Branch:** `feat/issue-36-onboarding` | **Completada:** —

### ⬜ Issue #37 — Animaciones con Framer Motion
**Branch:** `feat/issue-37-animations` | **Completada:** —

### ⬜ Issue #38 — SonarQube workflow + Quality Gate
**Branch:** `feat/issue-38-sonarqube` | **Completada:** —

***

## Instrucciones para el Agente

Al completar una issue, actualiza este archivo así:

1. Cambia `⬜` por `✅` en el título de la issue
2. Agrega la fecha en `**Completada:**`
3. Llena la sección `**Lo que se hizo:**` con un resumen de los archivos creados/modificados
4. Llena `**Notas importantes para el futuro:**` con cualquier decisión técnica, gotcha, o contexto que sea útil para las issues siguientes
5. Actualiza el contador en la tabla de Resumen General

**Formato de notas (sé específico, no genérico):**
- ✅ "El `DATABASE_URL` debe usar puerto 6543 (pooler) no 5432"
- ❌ "Se configuró la base de datos correctamente"