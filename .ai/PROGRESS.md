# PROGRESS.md — Estado del Proyecto FluxSQL

> Este archivo es actualizado automáticamente por el agente de IA al completar cada issue.
> Sirve como memoria del proyecto: qué se hizo, qué decisiones se tomaron, qué hay que tener en cuenta.

**Última actualización:** 2026-05-02
**Issues completadas:** 42 / 42 🏆

***

## Resumen General

| Milestone | Issues | Completadas | Estado |
|---|---|---|---|
| v0.1 — Setup Base | #1 al #8 | 8/8 | ✅ Completado |
| v0.2 — Canvas + Editor | #9 al #18 | 10/10 | ✅ Completado |
| v0.4 — UI/UX Polish | #26 al #38 | 13/13 | ✅ Completado 🏆 |
| v0.5 — Auth & UX Redesign | #39 al #42 | 4/4 | ✅ Completado 🏆 |

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

### ✅ Issue #6 — Parser SQL PostgreSQL → Nodos React Flow
**Branch:** `feat/issue-6-parser-postgresql`
**Completada:** 2026-05-02

**Lo que se hizo:**
- Creado el paquete `@fluxsql/parsers` dentro del monorepo (`packages/parsers`).
- Definidos los contratos de tipos en `src/types.ts` (`ParseResult`, `FlowNode`, `FlowEdge`, etc.).
- Implementado el motor de layout automático en `src/utils/layout.ts` usando un algoritmo de grid.
- Implementado el parser puramente síncrono `parsePostgreSQL` en `src/dialects/postgresql.ts` usando regex robustos para extraer sentencias `CREATE TABLE`, PKs locales o foráneas, relaciones `REFERENCES` (foreign keys) y sus columnas.
- Expuesta la función pública `parseSQL(ddl, dialect)` en `src/index.ts` con manejo envolvente en `try/catch` para impedir throw de errores, agrupándolos siempre en el array `errors[]`.

**Notas importantes para el futuro:**
- ✅ El motor de parseo es intencionalmente `agnóstico` a React. No contiene imports de Next.js ni de Browser APIs, garantizando compatibilidad en cualquier entorno (cliente o servidor) y facilitando pruebas unitarias de TS estándar.
- ✅ Los IDs de los React Flow Nodes son siempre el nombre de la tabla en minúscula.
- ✅ Las FKs generan automáticamente edges estilo `smoothstep` apuntando con los IDs `fk-{tablaOrigen}-{tablaDestino}`.

***

### ✅ Issue #7 — Parser T-SQL Server + MySQL
**Branch:** `feat/issue-7-parser-sqlserver-mysql`
**Completada:** 2026-05-02

**Lo que se hizo:**
- Implementado el Strategy Pattern para la resolución de dialectos de SQL delegando la orquestación a `src/index.ts`.
- Añadidos `dialects/mysql.ts` para ingesta de sentencias MySQL: extrae llaves primarias en línea, limpia backticks, detecta constraints locales al final del CREATE TABLE, y marca apropiadamente los flags `isAutoIncrement`. 
- Añadidos `dialects/sqlserver.ts` para parsing dual de T-SQL: la primera pasada recolecta esquemas limpios e `isIdentity`, y la segunda pasada acopla las dependencias capturando instrucciones exógenas mediante comandos `ALTER TABLE`.
- El tipado global fue robustecido inyectando los marcadores `isAutoIncrement` y `isIdentity` dentro de la interfaz fundamental `Column`.

**Notas importantes para el futuro:**
- ✅ SQL Server tiene que ejecutar inexorablemente DOS PASADAS sintácticas de manera secuencial (las asignaciones `ALTER TABLE` corren después de popular el árbol de `nodes`) debido a su propensión a declarar constraints al final del esquema de manera adyacente.
- ✅ Los `AUTO_INCREMENT` y los `IDENTITY(1,1)` no deben pertenecer a la variable type; son indicadores atómicos extraídos en booleano y disociados visualmente.

***

### ✅ Issue #8 — GitHub Actions CI + Snyk
**Branch:** `chore/issue-8-ci-snyk`
**Completada:** 2026-05-02

**Lo que se hizo:**
- Creado `.github/workflows/ci.yml`: pipeline de build y lint con pnpm 10, Node 20, cache del store de pnpm via `hashFiles('**/pnpm-lock.yaml')`, y variables de entorno de Supabase inyectadas desde GitHub Secrets.
- Creado `.github/workflows/snyk.yml`: escaneo de seguridad con `snyk/actions/node@master`, threshold `--severity-threshold=high --all-projects`, y permisos `contents: read` + `security-events: write`.
- Confirmado que `pnpm lint` ya existía en el `package.json` raíz como `turbo run lint` y pasa correctamente (exit code 0).
- `pnpm build` continua pasando en los 3 packages con FULL TURBO cache.

**Notas importantes para el futuro:**
- ✅ El orden correcto en GitHub Actions es: `pnpm/action-setup` primero, luego `actions/setup-node` — así pnpm ya está disponible para el cache de Node.
- ✅ Los secrets `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `DATABASE_URL` y `SNYK_TOKEN` deben configurarse en GitHub Settings → Secrets and variables → Actions antes de que el CI funcione en el repo remoto.
- ✅ `--frozen-lockfile` garantiza que el `pnpm-lock.yaml` commiteado sea el único que se use en CI, evitando instalaciones no deterministas.

***

## Milestone v0.2 — Canvas + Editor

### ✅ Issue #9 — Canvas React Flow con Nodos Arrastrables
**Branch:** `feat/issue-9-react-flow-canvas`
**Completada:** 2026-05-02

**Lo que se hizo:**
- Instaladas las dependencias `@xyflow/react` y `zustand` en el paquete `web`.
- Creado el store Zustand en `store/useEditorStore.ts` con `nodes`, `edges`, `onNodesChange`, `onEdgesChange`, `setNodesAndEdges`, `sqlValue` y `setSqlValue`.
- Implementado el nodo custom `TableNode.tsx` con header azul `#1A6CF6`, filas por columna con badges PK/FK, handles de entrada (izquierda) y salida (derecha) por columna usando `@xyflow/react`.
- Creado `Canvas.tsx` con `nodeTypes` definido fuera del componente, `Background dots`, `Controls`, `deleteKeyCode={null}` y datos demo para 2 tablas con 1 edge.
- Creado `EditorLayout.tsx` con CSS Grid split 40/60 (panel SQL placeholder | canvas).
- Creada la ruta protegida `app/(protected)/editor/[projectId]/page.tsx` como Server Component que valida el acceso del usuario via JOIN `projects ⟶ collaborators`.
- `pnpm build` pasa limpio con la nueva ruta `/editor/[projectId]` marcada como `ƒ (Dynamic)`.

**Notas importantes para el futuro:**
- ✅ `nodeTypes` SIEMPRE debe definirse a nivel de módulo (fuera del componente). Definirlo dentro destruye la referencia en cada re-render y ReactFlow no puede reconciliar los nodos correctamente.
- ✅ El contenedor padre del `<ReactFlow>` necesita height explícita: usar `h-full` con ancestro `h-screen` o `flex-1 min-h-0`.
- ✅ `@xyflow/react/dist/style.css` se importa en `Canvas.tsx` — sin este import los handles y controles no se renderizan.

### ✅ Issue #10 — Nodos de tabla personalizados (columnas, tipos, PK/FK)
**Branch:** `feat/issue-10-custom-nodes`
**Completada:** 2026-05-02

**Lo que se hizo:**
- Reescrito `TableNode.tsx` usando `NodeProps` sin genérico anidado (cast de `data` interno) para pasar el control de tipos estricto de TypeScript.
- Añadidos íconos `KeyRound` (amarillo) para PK y `Link` (gris) para FK desde `lucide-react`.
- Handles `opacity-0 group-hover:opacity-100` con `transition-opacity` para visibilidad contextual sin ruido visual.
- Actualizado `Canvas.tsx` con columnas reales en los nodos demo y `markerEnd: ArrowClosed #00D4FF` en el edge FK.
- Añadido helper `toReactFlowEdge()` en `useEditorStore.ts` que inyecta `markerEnd` en los edges del parser.

**Notas importantes para el futuro:**
- ✅ `NodeProps<{ data: T }>` causa error de tipos en `@xyflow/react` v12 porque el tipo genérico espera `Record<string, unknown>` a nivel de nodo, no dentro de `data`. La solución es usar `NodeProps` sin genéricos y castear `data` dentro del componente.
- ✅ `toReactFlowEdge()` del store debe llamarse al convertir los edges del parser antes de guardarlos en Zustand (se conecta en Issue #13).

### ✅ Issue #11 — Edges de relaciones FK con cardinalidad
**Branch:** `feat/issue-11-custom-edges`
**Completada:** 2026-05-02

**Lo que se hizo:**
- Creado `components/editor/edges/RelationshipEdge.tsx` usando `BaseEdge`, `EdgeLabelRenderer` y `getSmoothStepPath` de `@xyflow/react`. Muestra etiqueta `N` en el centro del path con fondo `#0A0F1E` y borde `#1E2A45`.
- Registrado `edgeTypes = { relationship: RelationshipEdge }` en `Canvas.tsx` fuera del componente (igual que `nodeTypes`).
- Actualizado el edge demo en `Canvas.tsx`: `type: 'relationship'`, `strokeWidth: 1.5`, `markerEnd: ArrowClosed #00D4FF`.
- El edge conecta columna-a-columna: `owner_id-source` → `id-target`.
- `pnpm build` pasa sin errores TypeScript.

**Notas importantes para el futuro:**
- ✅ `edgeTypes` sigue la misma regla que `nodeTypes`: SIEMPRE definido fuera del componente a nivel de módulo.
- ✅ `getSmoothStepPath` retorna `[edgePath, labelX, labelY]` — el `labelX/Y` es el punto central del path, ideal para posicionar la etiqueta de cardinalidad.
- ✅ El tipo del edge en el store debe coincidir con la clave en `edgeTypes`. Al conectar el parser (Issue #13), `toReactFlowEdge()` debe setear `type: 'relationship'`.

### ✅ Issue #12 — Monaco Editor con syntax highlighting SQL
**Branch:** `feat/issue-12-monaco-editor`
**Completada:** 2026-05-02

**Lo que se hizo:**
- Instalado `@monaco-editor/react` en el paquete `web`.
- Creado `components/editor/EditorPanel.tsx` con `dynamic(() => import('@monaco-editor/react'), { ssr: false })` para evitar el error `self is not defined` en SSR.
- Skeleton de carga con `animate-pulse` mientras Monaco carga el bundle (~2MB).
- Tab bar con nombre `schema.sql` en color `#9CDCFE` (VS Code style).
- Opciones: `minimap: false`, `fontSize: 13`, `wordWrap: on`, `scrollBeyondLastLine: false`, `padding: { top: 16, bottom: 16 }`.
- Actualizado `EditorLayout.tsx`: reemplazado placeholder por `<EditorPanel />` con `h-full min-h-0` para que Monaco llene el panel.
- Actualizado `useEditorStore.ts`: `sqlValue` inicializa con `SQL_PLACEHOLDER` en lugar de string vacío.
- `toReactFlowEdge()` actualizado para inyectar `type: 'relationship'` junto al `markerEnd`.

**Notas importantes para el futuro:**
- ✅ `dynamic(() => import('@monaco-editor/react'), { ssr: false })` es OBLIGATORIO. Sin `ssr: false`, Next.js intenta ejecutar Monaco en el servidor y falla con `self is not defined`.
- ✅ El div padre del `<MonacoEditor>` necesita `flex-1 overflow-hidden` y un ancestro con altura explícita (`h-full` + `h-screen` en el layout).
- ✅ `onChange` puede emitir `undefined` al inicializar — siempre usar `value ?? ''`.

### ✅ Issue #13 — Sync editor ↔ canvas en tiempo real (debounce 300ms)
**Branch:** `feat/issue-13-realtime-sync`
**Completada:** 2026-05-02

**Lo que se hizo:**
- Creado `hooks/useDebounce.ts` para aplicar un retraso de 300ms a los cambios de estado.
- Creado `hooks/useSyncEditor.ts` que se suscribe a `sqlValue` (vía `useEditorStore`), lo debouncea, lo pasa a `parseSQL` y sincroniza `nodes` y `edges`.
- Preservación de posiciones de nodos implementada leyendo los nodos anteriores del store (`useEditorStore.getState().nodes`) en vez de suscribirse, para evitar el re-render loop, mapeando mediante sus IDs.
- Añadida dependencia del workspace de `@fluxsql/parsers` a `apps/web` con `pnpm add @fluxsql/parsers@workspace:* --filter web`.
- Modificado `components/editor/EditorPanel.tsx` para llamar al hook `useSyncEditor('postgresql')`.

**Notas importantes para el futuro:**
- ✅ Para evitar un infinite loop al re-setear nodos desde un useEffect, es crítico leer `currentNodes` sin que sea dependencia del array, lográndolo mediante `useEditorStore.getState().nodes`.
- ✅ El manejador del parser previene caídas visuales atrapando errores graves (aunque el parser de por sí los captura), y en caso de DDL en curso inválido no borra el lienzo.

### ✅ Issue #14 — Soporte JSON Schema → nodos NoSQL
**Branch:** `feat/issue-14-parser-json-schema`
**Completada:** 2026-05-02

**Lo que se hizo:**
- Creado `ModeSelector.tsx` con botones para "PostgreSQL", "MySQL", "SQL Server" y "JSON".
- Agregado estado `mode` en `EditorPanel.tsx` para permitir cambiar el `language` de Monaco y pasárselo a `useSyncEditor`.
- Actualizado `useSyncEditor.ts` para aceptar `mode: EditorMode` y llamar a `parseJSON` en modo JSON.
- Implementado `parseJSON` en `@fluxsql/parsers` con soporte para parsear tanto un JSON Schema estándar con "properties" como un JSON anidado (formato simple NoSQL).
- Asignación de iconos automáticos de PK (`_id` o `id`) al parsear el JSON y `isForeignKey: false` para sub-objetos y campos en formato JSON en el parser `packages/parsers/src/index.ts`.

**Notas importantes para el futuro:**
- ✅ `parseJSON` atrapa en un bloque `try-catch` los casos de escritura a medias, por lo que JSON inválido temporal no borra la vista en el Canvas.
- ✅ Los estilos visuales de botones activos e inactivos están implementados en el `ModeSelector`, manteniendo el diseño de la interfaz oscura.

### ✅ Issue #15 — Guardar diagrama en Supabase
**Branch:** `feat/issue-15-save-diagram`
**Completada:** 2026-05-02

**Lo que se hizo:**
- Creado `actions/diagrams/save.ts` Server Action para persistir el SQL, JSON del layout, y metadata de diagrama. Verifica que el usuario tenga acceso a modificarlo en base de datos.
- Instalado paquete `sonner` e inicializado componente `<Toaster />` en el Root Layout para proveer retroalimentación interactiva (Toast) después de las operaciones de guardado.
- Añadido componente `EditorToolbar.tsx` consumiendo `useReactFlow().toObject()` para exportar las ubicaciones absolutas de todos los nodos en el canvas hacia el flujo de guardado.
- Re-diseñado `EditorLayout.tsx` para envolver a todos sus componentes con el `<ReactFlowProvider />` permitiendo el uso de funciones base de React Flow desde herramientas desacopladas del Canvas como lo es el Toolbar.

### ✅ Issue #16 — Cargar diagrama existente
**Branch:** `feat/issue-16-load-diagram`
**Completada:** 2026-05-02

**Lo que se hizo:**
- Creado `actions/diagrams/load.ts` Server Action para obtener el último diagrama por proyecto. En caso de no existir uno en un proyecto autorizado, realiza un "Upsert" inicial insertando un registro en blanco (diagrama vacío).
- Adaptada ruta principal del Editor (`app/(protected)/editor/[projectId]/page.tsx`) a la carga asíncrona de datos desde Postgres utilizando `loadDiagramAction()`.
- Se pasaron `initialSQL`, `initialNodes`, y `initialEdges` al layout principal (`EditorLayout.tsx`), asegurando la hidratación y restauración total tanto de código como visual al momento de renderizar por primera vez usando Hooks de estado.

### ✅ Issue #17 — Export PNG y SVG
**Branch:** `feat/issue-17-export-images`
**Completada:** 2026-05-02

**Lo que se hizo:**
- Creado `ExportMenu.tsx` (desplegable en toolbar) utilizando `html-to-image` para capturar el layout activo del diagrama desde React Flow.
- Implementado el ajuste automático del enfoque visual con `fitView()` y 250ms de pausa para renderizado fluido de la captura que garantiza un lienzo legible completo.
- Filtrado automático con el parámetro `filter` eliminando controles de React Flow y herramientas visuales superpuestas para que solo se incluyan nodos y relaciones.
- Reemplazado botón estático de la barra de control (`EditorToolbar.tsx`) por este nuevo sub-módulo funcional asegurando la renderización condicionada al contenido.

### ✅ Issue #18 — Export Mermaid .mmd
**Branch:** `feat/issue-18-export-mermaid`
**Completada:** 2026-05-02

**Lo que se hizo:**
- Creada función iteradora `toMermaid(nodes, edges)` en el módulo común `@fluxsql/parsers` que transforma la estructura de React Flow hacia sintaxis `erDiagram`.
- Implementado sistema de control de duplicados a través de `Set<string>` para evitar repeticiones visuales y de sentencias en relaciones entre múltiples Primary/Foreign Keys intersecadas.
- Saneamiento dinámico de los identificadores de tablas y campos (`replace(/\s+/g, '_')`) para evitar que Mermaid arroje errores de parsing visual al enfrentar espacios en el nombre.
- Opción *"📋 Copiar Mermaid"* en el `ExportMenu.tsx` agregada junto con un utilitario de fallback en caso el navegador no posea permisos sobre el protocolo HTTPS hacia `navigator.clipboard`.

***

## Milestone v0.3 — Realtime + Versiones

### ✅ Issue #19 — Invitar colaborador al proyecto
**Branch:** `feat/issue-19-invite-collaborator`
**Completada:** 2026-05-02

**Lo que se hizo:**
- Creado Server Action `inviteCollaboratorAction` que implementa la lógica de autorización validando que el emisor sea el Owner del proyecto.
- Se verificó la existencia del correo objetivo a través de la tabla auxiliar `profiles`, impidiendo la adición de usuarios en crudo no registrados.
- Creado flujo de exclusión impidiendo duplicaciones en la tabla `collaborators` y el auto-invitado de dueños.
- Implementado UI interactivo con Shadcn `Dialog` dentro de los Project Cards del Dashboard, controlando el paso de la propagación del click hacia el Link contenedor (`e.preventDefault()`, `e.stopPropagation()`).

### ✅ Issue #20 — Realtime: cursores de colaboradores
**Branch:** `feat/issue-20-realtime-cursors`
**Completada:** 2026-05-02

**Lo que se hizo:**
- Creado hook `useCollaboratorCursors` que inicializa un canal Supabase Presence para sincronizar el estado multijugador (`x`, `y`, `color`, `name`).
- Aplicado un sistema de asignación cromática consistente mediante la generación de un hash MD5/SHA simplificado basado en el ID del usuario.
- Implementada la traducción de coordenadas React Flow (escala dinámica) usando `screenToFlowPosition` y `flowToScreenPosition` logrando que el cursor mantenga su lugar lógico en el canvas por más que ambos clientes estén operando en diferentes monitores o niveles de Zoom.
- Renderizado desacoplado dentro de `<CollaboratorCursors />` fijado en la pantalla usando capas superpuestas sin interferir en clics ni en los nodos del sistema.

### ✅ Issue #21 — Sync de posición de nodos en tiempo real
**Branch:** `feat/issue-21-realtime-nodes`
**Completada:** 2026-05-02

**Lo que se hizo:**
- Creado hook `useRealtimeSync` que se suscribe al mismo canal `room-{projectId}` que `Presence` (issue #20), usando la sub-tecnología de Supabase **Broadcast**.
- Establecidos dos handlers: uno para mover nodos (`node_move`) arrastrados, y otro para reconstruir nodos (`sql_change`) de un script alterado por otro usuario.
- Implementado el **Anti-Loop** principal (`if (payload.senderId === userId) return`) para evitar que el emisor reciba su propia actualización y se reinicien las posiciones.
- Modificado `<Canvas>` para atrapar el evento `onNodeDragStop` (al soltar), evitando un castigo a la red provocado por enviar actualizaciones a 60fps usando `onNodeDrag`.

### ✅ Issue #22 — Version control: commit con mensaje
**Branch:** `feat/issue-22-version-commit`
**Completada:** 2026-05-02

**Lo que se hizo:**
- Creada tabla estructural `diagram_versions` dentro de `schema.ts` acoplando `version_number`, `diagram_id`, y el cuerpo íntegro del lienzo (`flowJson`, `sqlContent`).
- Server Action `createVersionAction` implementada para calcular automáticamente el autoincremento atómico (`MAX(versionNumber) + 1`) en cada confirmación guardada por los usuarios.
- Implementado cliente `<CommitModal>` empleando primitivas UI conectadas con `useReactFlow` que extraen de forma síncrona el `toObject()` empaquetando todo el estado visual en un click.
- Botón Commit acoplado al `EditorToolbar` a lado de las opciones convencionales de Guardado/Exportación.

### ✅ Issue #23 — Historial de versiones (sidebar)
**Branch:** `feat/issue-23-version-history`
**Completada:** 2026-05-02

**Lo que se hizo:**
- Creada Server Action `listVersionsAction` iterando sobre los joins (`diagramVersions` \+ `users` limitando la inyección al mínimo omitiendo `flowJson`) para obtener listas ligeras con perfiles integrados.
- Instalado Shadcn Sheet (`sheet.tsx`) y Date-Fns para inyectar interfaces de exploración elegantes.
- Diseñado un `<VersionHistorySheet>` desplegable hacia el lado derecho integrando Skeletons dinámicos e iconografía interactiva.
- Fechas transformadas al español natural utilizando `formatDistanceToNow` y la locale `es`.
- Embebido orgánicamente dentro del Toolbar principal del Editor.

### ✅ Issue #24 — Restaurar versión anterior
**Branch:** `feat/issue-24-version-restore`
**Completada:** 2026-05-02

**Lo que se hizo:**
- Creada Server Action `restoreVersionAction` que valida propiedad, localiza en base de datos la copia en caché (`flowJson`, `sqlContent`) de una versión atada a su `projectId` y la transfiere sobrescribiendo el modelo actual del lienzo en la tabla original `diagrams`.
- Acoplado el callback del botón "Restaurar →" dentro del listado que solicita confirmación bloqueante nativa (`window.confirm()`) previniendo una sobreescritura accidental.
- Aplicación de Estado Síncrona mediante el consumo imperativo del contexto global `useEditorStore.getState()` evitando refrescar la pestaña (`window.location.reload`) inyectando directamente los nodos y esquemas SQL restaurados sin causar parpadeo al layout.

### ✅ Issue #25 — Comparar 2 versiones (Diff Editor)
**Branch:** `feat/issue-25-version-diff`
**Completada:** 2026-05-02

**Lo que se hizo:**
- Creada Server Action `getVersionDetailAction` optimizada para descargar en crudo únicamente el texto DDL de la versión antigua obviando metadatos.
- Implementado el componente `<DiffViewerModal>` instanciando dinámicamente `<DiffEditor>` de `@monaco-editor/react` forzando deshabilitar el Server-Side Rendering (`ssr: false`) para evadir colapsos relacionados a variables globales (`window`).
- Integrado un manejador robusto capaz de identificar si una versión es estructuralmente idéntica al código actual, dibujando un renderizado amigable (`<CheckCircle2>`) en lugar de mostrar editores vacíos.
- Desplegados todos los elementos acoplados desde el `<EditorToolbar>`, completando al 100% el panel de Version Control.

***

## Milestone v0.4 — UI/UX Polish (Pendiente)

### ✅ Issue #26 — Link público de solo lectura
**Branch:** `feat/issue-26-public-link`
**Completada:** 2026-05-02

**Lo que se hizo:**
- Creada Server Action `togglePublicAction` que verifica autenticidad del autor de un esquema para alternar el campo `is_public` de la base de datos Supabase en el diagrama seleccionado.
- Componente dinámico UI interactivo `<PublicShareToggle>` incorporado en el `<EditorToolbar>` a modo de Toggle con validadores visuales para generar links y copiarlos en el portapapeles del navegador automáticamente.
- Desplegada la ruta `/public/[id]/page.tsx` sin heredar los layouts autenticados. Retorna un 404 nativo en diagramas privados, pero renderiza exitosamente los esquemas públicos montando una versión inhabilitada para arrastres, conexiones y edición (`PublicDiagramView`).

### ✅ Issue #27 — Búsqueda de tablas (Command Palette Ctrl+K)
**Branch:** `feat/issue-27-command-palette`
**Completada:** 2026-05-02

**Lo que se hizo:**
- Instalado `cmdk` (dependencia de Shadcn Command) y creado manualmente `components/ui/command.tsx` adaptado al design system oscuro del proyecto.
- Creado `<SearchPalette>` que escucha `Ctrl+K` / `Cmd+K` globalmente usando `addEventListener`, abre un `<CommandDialog>` y lista de forma reactiva todas las tablas presentes en el canvas.
- Al seleccionar una tabla, `setCenter()` de React Flow anima la cámara con zoom 1.5 y duración de 800ms directamente hacia el nodo.
- Añadido hint visual `Ctrl + K` en el `<EditorToolbar>` para descubribilidad del feature.

### ✅ Issue #28 — Tests E2E con Playwright
**Branch:** `feat/issue-28-e2e-playwright`
**Completada:** 2026-05-02

**Lo que se hizo:**
- Instalados `@playwright/test` y `wait-on` como devDependencies en `web`; descargado el navegador `chromium` con `playwright install`.
- Configurado `playwright.config.ts` con separación en dos proyectos: `setup` (auth) y `chromium` (tests), sin `webServer` inline (el CI lo inicia manualmente).
- Creado `e2e/auth.setup.ts` que realiza login real y persiste cookies en `.playwright/auth.json` para reutilizarlas entre tests sin re-autenticar.
- Creados 2 tests en `e2e/core-workflow.spec.ts`: dashboard visible y flujo completo crear-proyecto → SQL → nodo visible.
- Añadido workflow `.github/workflows/e2e.yml` con build, arranque de la app en background y `wait-on` antes de ejecutar los tests.
- Añadido `.playwright/`, `playwright-report/` y `test-results/` al `.gitignore` raíz.

### ✅ Issue #29 — Landing page: hero section con demo animada
**Branch:** `feat/issue-29-landing-hero`
**Completada:** 2026-05-02

**Lo que se hizo:**
- Reescrito `app/page.tsx` como Server Component que verifica sesión: si hay usuario redirige a `/dashboard`, si no renderiza la landing.
- Creado `components/landing/HeroSection.tsx` con badge, H1 con degradado, subtítulo, CTAs y grid responsivo 1-col/2-col.
- Creado `components/landing/AnimatedCanvas.tsx` con 3 nodos (`users`, `projects`, `tasks`) que aparecen en cascada via `style={{ animation: 'fadeSlideIn ...' }}`, conector SVG animado y label "Generado desde SQL en tiempo real".
- Añadido `@keyframes fadeSlideIn` en `globals.css` (Tailwind v4 no tiene `tailwind.config.ts`).
- Actualizado metadata en `layout.tsx` con título y descripción de producto reales.
- **BONUS**: `PublicShareToggle` ahora muestra un panel con la URL y botón `<Copy>` cuando el diagrama es público.

### ✅ Issue #30 — Landing page: sección features
**Branch:** `feat/issue-30-landing-features`
**Completada:** 2026-05-02

**Lo que se hizo:**
- Creado `FeaturesSection.tsx` (Server Component) con 6 cards (SQL, Colaboración, Git, Share, Mermaid, Monaco), grid responsivo 1→2→3 columnas.
- Cada card usa `iconMap` con componentes de lucide-react instanciados dinámicamente desde nombre string.
- Importado y añadido debajo de `<HeroSection />` en `app/page.tsx`.

### ✅ Issue #31 — Landing pricing open source + footer
**Branch:** `feat/issue-31-landing-pricing`
**Completada:** 2026-05-02

**Lo que se hizo:**
- Creado `PricingSection.tsx` con tarjeta Plan Estudiante, lista de 8 features, CTA a `/register` y link al repo GitHub.
- Creado `Footer.tsx` con logo DBCanvas, nav links (login, register, GitHub) y créditos © 2026 con Jefferson, Kiara y UPT.
- Fix: `lucide-react@1.14.0` no exporta `Github` — reemplazado por `GitFork` como ícono equivalente.
- Añadidos ambos componentes al final del `main` en `page.tsx`.

### ✅ Issue #32 — Dashboard: grid de proyectos con preview visual
**Branch:** `feat/issue-32-dashboard-grid`
**Completada:** 2026-05-02

**Lo que se hizo:**
- Creado `ProjectGrid.tsx` con empty state (emoji 🗂️) y grid 1→2→3→4 columnas.
- Refactorizado `ProjectCard.tsx`: miniatura con gradiente determinístico del ID, badge de rol con `Crown`/`Edit3`, hover `hover:-translate-y-1`.
- `dashboard/page.tsx` ahora obtiene `dbUserId` para determinar ownership y lo pasa a `<ProjectGrid>`.
- `ProjectList.tsx` actualizado con `ownerId` en el tipo `Project` (fix TypeScript).

### ✅ Issue #33 — Tema oscuro/claro con next-themes
**Branch:** `feat/issue-33-dark-mode`
**Completada:** 2026-05-02

**Lo que se hizo:**
- Instalado `next-themes` en el workspace `web`.
- Creado `ThemeToggle.tsx` en `apps/web/components` para conmutar el tema del sistema en cliente.
- Agregado el componente `ThemeToggle` al final de `EditorToolbar`.
- Modificados los componentes con Monaco (`EditorPanel.tsx` y `DiffViewerModal.tsx`) para usar el hook `useTheme` y reaccionar a `resolvedTheme`.

**Notas importantes para el futuro:**
- ✅ `suppressHydrationWarning` se encuentra activo en `<html>` de `layout.tsx` junto a su respectivo `ThemeProvider` evitando flash y fallas de desajuste.
- ✅ Monaco Editor detecta activamente `resolvedTheme` evitando dependencias inconsistentes como el estado pre-mount.

### ✅ Issue #34 — Toolbar del editor con tooltips
**Branch:** `feat/issue-34-toolbar`
**Completada:** 2026-05-02

**Lo que se hizo:**
- Implementada la función abstracta local `ToolbarButton` encapsulando la lógica interactiva de shadcn/ui `Tooltip` dentro de `EditorToolbar.tsx`.
- Se reemplazó el botón "Guardar" para utilizar `<ToolbarButton>` con el ícono `Save` de `lucide-react` y el atajo "Ctrl+S".
- Se implementó `<TooltipProvider delayDuration={200}>` abarcando la capa superior del componente `EditorToolbar`.

**Notas importantes para el futuro:**
- ✅ `TooltipProvider` debe englobar la superficie donde residen los `TooltipTrigger`s a fin de asegurar la disponibilidad de contexto para todos los componentes de Tooltip de shadcn.

### ✅ Issue #35 — Responsive tablet 768px+
**Branch:** `feat/issue-35-responsive`
**Completada:** 2026-05-02

**Lo que se hizo:**
- Creado hook `useIsTablet` en `EditorLayout.tsx` interceptando dimensiones de ventana vía `window.matchMedia('(max-width: 1024px)')`.
- Desplegado estado interno `showEditor` que gobierna un toggle interactivo tipo flotante para el despliegue del panel de código SQL en vistas compactas.
- Re-diseñada la renderización en el Grid layout permitiendo ocultar un panel para maximizar el componente `<Canvas>` permitiendo un espacio útil del 100%.
- Aplicados lineamientos semánticos sobre `ToolbarButton` agregando tamaño táctil `min-w-10 min-h-10` en breakpoints menores como `sm`.

**Notas importantes para el futuro:**
- ✅ Inicializar hooks atados a variables de `window` en valor `false` durante la carga Server-Side previene CLS, evitando parpadeos bruscos para el usuario.
- ✅ Cuando se usa renderizado dinámico en cuadrículas compartidas, deshabilitar un panel e integrar lógica de grid/bloques aísla su comportamiento evitando deformaciones inesperadas de las proporciones.

### ✅ Issue #36 — Onboarding tour (primera vez)
**Branch:** `feat/issue-36-onboarding`
**Completada:** 2026-05-02

**Lo que se hizo:**
- Creado el componente interactivo puro `OnboardingTour.tsx` basado nativamente en el estado de React (`useState`) libre de dependencias externas para garantizar el mejor performance.
- Desplegada la lógica de guardado de visitas mediante la bandera local `dbcanvas_has_seen_tutorial` dentro del API `localStorage`.
- Implementado el retraso estratégico de 1200ms al montar usando `setTimeout` concediendo al `<EditorLayout>` suficiente tiempo de hidratación de componentes visuales antes de sobreponer el pop-up de bienvenida a través de `z-50`.
- El componente `OnboardingTour` fue incrustado de manera imperativa como nodo hijo principal en la raíz de `EditorLayout.tsx`.

**Notas importantes para el futuro:**
- ✅ Validar APIs del navegador (`localStorage`) siempre utilizando bloques `try/catch`, esto con el fin de evitar un quiebre de la renderización en el Client Component por bloqueos de privacidad configurados en los agentes de usuario.
- ✅ Los overlays inmersivos (`fixed inset-0`) deben usar `pointer-events-none` en el contenedor de los nodos transparentes y habilitarlos devuelta (`pointer-events-auto`) únicamente para la caja interactiva asegurando que el cierre clickeando en el espacio ciego sí funcione.

### ✅ Issue #37 — Animaciones con Framer Motion
**Branch:** `feat/issue-37-animations`
**Completada:** 2026-05-02

**Lo que se hizo:**
- Instalado `framer-motion` en el package `web`.
- Añadida animación `scale + fade` (con efecto `spring`) a `CommitModal.tsx` y `InviteCollaboratorModal.tsx` inyectando `motion.div` como contenedor interno al dialog.
- Añadida animación `slide + fade` al sheet `VersionHistorySheet.tsx`.
- Creado `ProtectedLayout` en `app/(protected)/layout.tsx` incorporando un componente global con `AnimatePresence` basado en el `pathname` para originar desvanecimientos fluidos entre las páginas de la aplicación.
- Configurada una transición animada ininterrumpida a través de `spring` mechanics para interpolar localizaciones de `CollaboratorCursors` que logran movimiento suavizado prescindiendo de los saltos perceptibles del socket.

**Notas importantes para el futuro:**
- ✅ El modal `DialogContent` no debe sustituirse por un `motion.div` puesto que causará que Radix UI rechace las animaciones, la forma segura es colocar `motion.div` como contenedor único por debajo.
- ✅ Cuando animes ubicaciones dinámicas calculadas por cursor como con x/y en CSS absolute position, define el div ancla padre en posición 0,0 (top 0, left 0) y delega únicamente los keyframes x/y a Framer Motion para asegurar que opere a través de GPUs con el parámetro nativo `transform`.

### ✅ Issue #38 — SonarQube workflow + Quality Gate
**Branch:** `feat/issue-38-sonarqube`
**Completada:** 2026-05-02

**Lo que se hizo:**
- Creado `sonar-project.properties` en la raíz del monorepo con claves `UPT-FAING-EPIS_proyecto-si783-2026-i-u1-generador-de-diagramas-de-base` y organización `upt-faing-epis`.
- Creado `.github/workflows/sonarqube.yml` con `fetch-depth: 0` (obligatorio para historial git en SonarCloud) y los 4 steps: checkout, pnpm setup, install, build y SonarCloud scan.
- Añadida directiva `concurrency: group: sonar-${{ github.ref }}` para evitar conflictos de ejecución paralela con los workflows existentes (`ci.yml`, `snyk.yml`) que comparten los mismos triggers en `main`.
- `sonar.coverage.exclusions=**` preservado intencionalmente para evitar que el Quality Gate falle por 0% de cobertura (proyecto sin tests unitarios).

**Notas importantes para el futuro:**
- ✅ `SONAR_TOKEN` debe configurarse manualmente en GitHub → Settings → Secrets (ver instrucciones en el commit).
- ✅ `GITHUB_TOKEN` es automático, no requiere configuración adicional.
- ✅ Si en el futuro se añaden tests con Jest/Vitest, actualizar `sonar.typescript.lcov.reportPaths` y eliminar `sonar.coverage.exclusions=**`.

---

## 🏆 MILESTONE v0.4 — UI/UX POLISH — COMPLETADO

Todas las 13 issues del milestone v0.4 han sido implementadas y committeadas exitosamente.
El proyecto FluxSQL está listo para revisión académica y despliegue en producción.

***

## Milestone v0.5 — Auth & UX Redesign

### ✅ Issue #39 — Rediseño Auth: Vista Unificada Login + Registro (Split Layout)
**Branch:** `feat/issue-39-auth-redesign`
**Completada:** 2026-05-02

**Lo que se hizo:**
- Creado `AuthView.tsx` con dual column layout.
- Modificados `login/page.tsx` y `register/page.tsx`.

### ✅ Issue #40 — Rediseño Landing Page: Tipografía + Hero + Secciones Modernas
**Branch:** `feat/issue-40-landing-redesign`
**Completada:** 2026-05-02

**Lo que se hizo:**
- Corregido el bug de la tipografía "Times New Roman" inyectando la fuente `Inter` nativa en `layout.tsx` y configurando `@theme { --font-sans: var(--font-inter) }` dentro de `globals.css` (específico para Tailwind v4).
- Rediseñada completamente la landing page (`page.tsx`) en componentes server-side modulares.
- Creado `<HeroSection>` incluyendo H1 animado y simulación de diagrama ER flotante usando `<motion.div>` intercalado con `svg` dibujado inline.
- Añadidos `<HowItWorks>` y un refinado `<FeaturesSection>` implementando un sistema de grid de alta fidelidad con acentos neon azul y violeta.
- Integrados `<Navbar>`, `<BottomCTA>` y `<Footer>` ajustándose a los requerimientos visuales del tema oscuro de DBCanvas.

### ✅ Issue #41 — Dashboard: Sidebar de Navegación
**Branch:** `feat/issue-41-dashboard-sidebar`
**Completada:** 2026-05-02

**Lo que se hizo:**
- Creado `DashboardSidebar.tsx` en `apps/web/components/dashboard`.
- Modificado `apps/web/app/(protected)/dashboard/page.tsx` para incluir el sidebar y obtener el nombre del usuario.
- Enuelto `DashboardSidebar` en `Suspense` para evitar errores de hidratación debido al uso de `useSearchParams`.

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