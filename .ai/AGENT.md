# AGENT.md — Instrucciones para el Agente de IA (FluxSQL)

> Lee este archivo completo antes de escribir cualquier línea de código.
> Este documento define CÓMO debes codear en este repositorio. No es documentación para humanos, es tu manual de operación.

***

## 1. ¿Qué es FluxSQL?

FluxSQL es una herramienta web colaborativa para diseñar, visualizar y versionar esquemas de bases de datos. El usuario pega DDL (SQL) o JSON Schema en un editor y el sistema genera automáticamente un diagrama entidad-relación interactivo en tiempo real.

**Identidad visual:** Fondo oscuro `#0A0F1E`, acento azul eléctrico `#1A6CF6`, cian `#00D4FF` para conexiones y highlights. Siempre respetar esta paleta en cualquier componente nuevo.

***

## 2. Estructura del Monorepo

```
/
├── .ia/                        ← Archivos de contexto para el agente (este directorio)
│   ├── AGENT.md
│   ├── OVERVIEW.md
│   └── PROGRESS.md
│
├── apps/
│   └── web/                    ← App principal Next.js (App Router)
│       ├── app/                ← Rutas, layouts, páginas
│       │   ├── (public)/       ← Rutas sin autenticación: /, /login, /register
│       │   └── (protected)/    ← Rutas con auth: /dashboard, /editor/[id]
│       ├── components/
│       │   ├── ui/             ← Componentes base de shadcn/ui (NO modificar directamente)
│       │   ├── canvas/         ← Todo lo relacionado a React Flow (siempre "use client")
│       │   └── editor/         ← Todo lo relacionado a Monaco Editor (siempre "use client")
│       ├── lib/
│       │   ├── db/             ← Schema de Drizzle, cliente db, migraciones
│       │   └── supabase/       ← client.ts (browser) y server.ts (SSR)
│       ├── hooks/              ← Custom React hooks (useDebounce, useRealtimeCanvas, etc.)
│       ├── actions/            ← Server Actions de Next.js (mutations)
│       └── middleware.ts       ← Protección de rutas con Supabase Auth
│
├── packages/
│   ├── parsers/                ← @fluxsql/parsers — lógica pura sin deps del browser
│   └── ui/                     ← @fluxsql/ui — componentes compartidos
│
└── docs/
    └── milestones/             ← Documentación detallada por issue
        ├── v0.1-setup-base/
        ├── v0.2-canvas-editor/
        ├── v0.3-realtime-versiones/
        └── v0.4-ui-polish/
```

***

## 3. Stack Tecnológico

| Tecnología | Versión | Cuándo usarla |
|---|---|---|
| Next.js App Router | 16.x | Framework base — SIEMPRE |
| TypeScript strict | 6.x | TODO el código — sin excepciones |
| Tailwind CSS | v4 | Todos los estilos — NUNCA CSS inline |
| shadcn/ui | latest | Componentes base (botones, inputs, modales, toasts) |
| Drizzle ORM | v0.40+ | TODAS las consultas a la base de datos |
| Supabase | — | Auth, Realtime, PostgreSQL |
| React Flow (@xyflow/react) | v12+ | Canvas interactivo de diagramas |
| Monaco Editor | v0.52+ | Editor de código SQL/JSON |
| Zustand | v5+ | Estado global del canvas (nodos, edges) |
| Framer Motion | v12+ | Animaciones de UI |
| next-themes | latest | Dark/light mode |

***

## 4. Reglas de Arquitectura — NUNCA las rompas

### 4.1 Server vs Client Components

**Regla de oro:** Todo es Server Component por defecto. Solo añade `"use client"` cuando sea estrictamente necesario.

| Situación | Patrón correcto |
|---|---|
| Leer datos de la DB en una página | Server Component con Drizzle directo |
| Formulario con estado | Client Component con Server Action |
| Canvas de React Flow | Client Component (`"use client"`) |
| Monaco Editor | Client Component (`"use client"`) |
| Navbar con sesión | Server Component (lee cookie) |
| Toast/notificación | Client Component |

**Antipatrón crítico:** Nunca hagas `fetch('/api/...')` desde un Server Component hacia tu propia API. Llama a Drizzle directamente.

### 4.2 Mutations — Solo Server Actions

Todas las operaciones de escritura (INSERT, UPDATE, DELETE) van en Server Actions:

```
actions/
├── auth/
│   ├── register.ts    → registerAction(formData)
│   └── login.ts       → loginAction(formData)
├── projects/
│   ├── create.ts      → createProjectAction(name, description)
│   └── delete.ts      → deleteProjectAction(projectId)
├── diagrams/
│   ├── save.ts        → saveDiagramAction(id, sourceCode, flowJson)
│   └── version.ts     → createVersionAction(diagramId, commitMsg)
└── collaborators/
    └── invite.ts      → inviteCollaboratorAction(email, projectId)
```

Cada Server Action debe:
1. Verificar sesión del usuario con `createClient()` de Supabase
2. Validar inputs antes de tocar la base de datos
3. Llamar `revalidatePath()` si la mutación afecta una página
4. Retornar `{ error: string }` en fallo, nunca lanzar excepciones sin capturar

### 4.3 Base de Datos — Solo Drizzle

- Usa siempre los tipos inferidos: `typeof tabla.$inferSelect` y `typeof tabla.$inferInsert`
- Las consultas van en Server Components o Server Actions, NUNCA en Client Components
- Nunca escribas SQL crudo con `db.execute(sql`...`)` salvo en migraciones documentadas
- Los schemas están en `apps/web/lib/db/schema.ts` — no disperses definiciones

### 4.4 Autenticación — Dos clientes, dos contextos

| Contexto | Archivo | Cuándo usar |
|---|---|---|
| Browser (Client Components) | `lib/supabase/client.ts` | Hooks, event handlers |
| Servidor (Server Components/Actions) | `lib/supabase/server.ts` | Leer sesión, mutations seguras |

El `SUPABASE_SERVICE_ROLE_KEY` solo se usa en Server Actions cuando necesitas bypasear RLS. NUNCA lo expongas al cliente con `NEXT_PUBLIC_`.

### 4.5 El Paquete @fluxsql/parsers

- Es TypeScript puro — sin imports de React, Next.js, Node.js APIs del browser
- Todas las funciones deben ser **puras**: mismo input → mismo output, sin side effects
- Firma obligatoria de la función principal:
  ```
  parseSQL(ddl: string, dialect: 'postgresql' | 'mysql' | 'sqlserver'): ParseResult
  parseJSON(jsonSchema: string): ParseResult
  ```
- `ParseResult` siempre retorna `{ nodes[], edges[], errors[] }` — nunca lanza excepciones

***

## 5. Reglas de Código

### 5.1 TypeScript
- `strict: true` en todos los tsconfig — obligatorio
- Nunca uses `any`. Alternativas: `unknown` con type guard, o define el tipo
- Nunca uses `// @ts-ignore` sin un comentario explicando por qué
- Exporta los tipos desde el módulo donde se definen, no los redefinas

### 5.2 Componentes React
- Siempre componentes funcionales con arrow functions: `const MyComponent = () => {}`
- Nunca Class Components
- Props siempre tipadas con `interface Props {}`
- Si un componente supera 150 líneas, es señal de que debe dividirse

### 5.3 Estilos
- Solo Tailwind CSS v4 — nunca estilos inline, nunca CSS modules
- Usa `cn()` de `lib/utils.ts` para clases condicionales
- Respeta la paleta de FluxSQL: primario `#1A6CF6`, cian `#00D4FF`, fondo `#0A0F1E`
- Los componentes de shadcn/ui van en `components/ui/` — no los modifiques directamente, extiéndelos

### 5.4 Nombrado

| Elemento | Convención | Ejemplo |
|---|---|---|
| Archivos de componentes | PascalCase | `TableNode.tsx` |
| Archivos de hooks/utils | camelCase | `useDebounce.ts` |
| Archivos de Server Actions | camelCase | `createProject.ts` |
| Variables y funciones | camelCase | `projectId`, `handleSave` |
| Tipos e interfaces | PascalCase | `DiagramData`, `ParseResult` |
| Constantes globales | SCREAMING_SNAKE_CASE | `DEBOUNCE_DELAY_MS` |
| Ramas de Git | kebab-case con prefijo | `feat/issue-9-react-flow-canvas` |

### 5.5 Variables de Entorno

```bash
# Públicas (accesibles en el cliente)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_APP_URL=

# Privadas (solo servidor)
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=               # PostgreSQL connection string (pooler puerto 6543 para Vercel)
```

Regla: Si no empieza con `NEXT_PUBLIC_`, nunca la uses en un Client Component.

***

## 6. Patrones de UI — Identidad Visual FluxSQL

### Paleta de colores
```
Fondo principal:    #0A0F1E
Superficie:         #111827
Borde:              #1E2A45
Primario:           #1A6CF6  (botones CTA, links activos)
Acento cian:        #00D4FF  (conexiones FK, highlights, hover states)
Texto principal:    #E2E8F0
Texto secundario:   #94A3B8
Error:              #EF4444
Éxito:              #22C55E
```

### Componentes clave del canvas
- **TableNode:** Tarjeta con header azul oscuro, filas de columnas con icono PK (🔑 dorado) y FK (🔗 cian)
- **Edges:** Líneas tipo `smoothstep`, color `#00D4FF`, con marcador de flecha en el extremo destino
- **Minimap:** Esquina inferior derecha, colores coinciden con el tema
- **Toolbar:** Barra superior fija con: Deshacer/Rehacer | Vista previa | Compartir | Exportar (dropdown) | Toggle tema

### Sidebar izquierdo (navegación)
- Diagrama, Tablas, Vistas, Relaciones, SQL Preview, Documentación, Historial
- Fondo `#111827`, ítem activo con borde izquierdo `#1A6CF6`

### Panel derecho (propiedades)
- Tabs: "Tabla" / "Relación"
- Muestra: nombre, descripción, columnas, índices, notas
- Aparece al seleccionar un nodo en el canvas

***

## 7. Seguridad — Reglas No Negociables

1. **Row Level Security (RLS) activo** en todas las tablas de Supabase — nunca desactivar
2. **Nunca confíes en el `user_id` que viene del cliente** — siempre extráelo de la sesión del servidor
3. **Validar inputs** en Server Actions antes de cualquier operación DB (usa `zod`)
4. **El `service_role_key`** solo en Server Actions cuando sea estrictamente necesario para bypassear RLS
5. **Variables de entorno privadas** nunca en Client Components ni en archivos con `"use client"`
6. **Sanitizar** cualquier string que llegue al parser antes de procesarlo

***

## 8. Flujo de Trabajo por Issue

1. Leer el archivo de la issue en `docs/milestones/vX.X-nombre/issue-N.md`
2. Crear la rama: `git checkout -b feat/issue-N-descripcion`
3. Implementar siguiendo las reglas de este AGENT.md
4. Verificar: `pnpm build` pasa sin errores en todo el monorepo
5. Verificar: `pnpm lint` sin warnings
6. Actualizar `PROGRESS.md` marcando la issue como completada con notas relevantes
7. Hacer commit y PR a `main`

***

## 9. Checklist antes de cada commit

- [ ] `pnpm build` pasa en el monorepo completo
- [ ] `pnpm lint` sin errores
- [ ] Sin `console.log()` de debug
- [ ] Sin `any` en TypeScript
- [ ] Variables de entorno privadas no expuestas al cliente
- [ ] `PROGRESS.md` actualizado si se completó una issue