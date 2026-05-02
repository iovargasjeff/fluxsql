# OVERVIEW.md — Arquitectura Técnica de FluxSQL

> Documento de arquitectura del sistema para el proyecto SI-783 Base de Datos II.
> Universidad Privada de Tacna (UPT) — 2026-I

***

## 1. Visión del Sistema

FluxSQL es una plataforma web colaborativa para diseñar, visualizar y versionar esquemas de bases de datos relacionales y NoSQL. Su característica principal es la **bidireccionalidad código ↔ diagrama**: el usuario escribe DDL (SQL) o JSON Schema en un editor de código y el sistema transforma ese texto en un diagrama entidad-relación interactivo en tiempo real, sin arrastrar nada manualmente.

### Problema que Resuelve

Los estudiantes y desarrolladores trabajan con herramientas separadas: escriben SQL en un editor y luego dibujan diagramas en draw.io o Lucidchart. Esto genera inconsistencias, doble trabajo y diagramas desactualizados. FluxSQL unifica ambas superficies en una sola interfaz colaborativa.

### Usuarios Objetivo

- Estudiantes de Ingeniería de Sistemas que trabajan con múltiples motores de BD (PostgreSQL, MySQL, SQL Server)
- Equipos que necesitan colaborar en tiempo real sobre el esquema de su base de datos
- Desarrolladores que documentan su diseño como código (diagrams-as-code)

***

## 2. Stack Tecnológico

| Capa | Tecnología | Versión | Justificación |
|---|---|---|---|
| Framework | Next.js App Router | 16.x | SSR nativo, Server Actions, routing por archivos |
| Lenguaje | TypeScript strict | 6.x | Tipado end-to-end desde DB hasta el cliente |
| Monorepo | pnpm + Turborepo | pnpm 10 / turbo 2.x | Caché inteligente, workspaces aislados |
| UI Base | shadcn/ui + Tailwind CSS | v4 | Sin vendor lock-in, customizable, dark mode nativo |
| Canvas | React Flow (@xyflow/react) | v12+ | Motor de grafos más maduro para React |
| Editor | Monaco Editor | v0.52+ | Motor de VS Code, soporte SQL nativo |
| Estado global | Zustand | v5+ | Estado del canvas (nodos, edges, viewport) |
| Base de Datos | Supabase PostgreSQL | — | Auth + Realtime + BD en un solo proveedor |
| ORM | Drizzle ORM | v0.40+ | 100% TypeScript, sin reflection, migraciones seguras |
| Realtime | Supabase Realtime | — | Cursores colaborativos, sync de nodos |
| Animaciones | Framer Motion | v12+ | Transiciones de UI |
| Testing E2E | Playwright | v1.50+ | Tests en Chromium |
| CI/CD | GitHub Actions | — | Build, Lint, Snyk, SonarQube |
| Hosting | Vercel | — | Deploy desde main, Edge Network |

***

## 3. Arquitectura del Monorepo

Se usa **pnpm workspaces + Turborepo** para gestionar múltiples paquetes en un solo repositorio.

**Ventajas de esta decisión:**
- Los tipos TypeScript del parser se comparten con la app web sin duplicar definiciones
- La lógica de parseo (pura) está aislada del framework web y es testeable independientemente
- Turborepo cachea los builds: si `@fluxsql/parsers` no cambió, no se recompila

### Grafo de dependencias
```
apps/web
  ├── @fluxsql/parsers  (lógica pura de SQL → nodos)
  └── @fluxsql/ui       (componentes compartidos)

@fluxsql/parsers        (sin dependencias internas)
@fluxsql/ui             (shadcn/ui + tailwind)
```

***

## 4. Esquema de Base de Datos

### Las 5 tablas principales

```
users (1) ─────────── (N) collaborators (N) ──── (1) projects
                                                        │
                                                      (N) diagrams
                                                        │
                                                      (N) diagram_versions
```

#### `users`
| Columna | Tipo | Notas |
|---|---|---|
| id | UUID PK | Generado automáticamente |
| auth_id | UUID UNIQUE | FK a `auth.users` de Supabase |
| email | TEXT UNIQUE | |
| name | TEXT | Nombre de perfil |
| avatar_url | TEXT | URL de imagen |
| created_at | TIMESTAMPTZ | |

#### `projects`
| Columna | Tipo | Notas |
|---|---|---|
| id | UUID PK | |
| name | TEXT | Nombre del proyecto |
| description | TEXT | |
| owner_id | UUID FK | → `users.id` ON DELETE CASCADE |
| created_at / updated_at | TIMESTAMPTZ | |

#### `collaborators`
| Columna | Tipo | Notas |
|---|---|---|
| id | UUID PK | |
| project_id | UUID FK | → `projects.id` |
| user_id | UUID FK | → `users.id` |
| role | TEXT | `'owner'` \| `'editor'` \| `'viewer'` |
| joined_at | TIMESTAMPTZ | |
| UNIQUE | (project_id, user_id) | Un usuario no puede estar dos veces en el mismo proyecto |

#### `diagrams`
| Columna | Tipo | Notas |
|---|---|---|
| id | UUID PK | |
| project_id | UUID FK | → `projects.id` |
| name | TEXT | |
| source_code | TEXT | DDL SQL o JSON Schema |
| dialect | TEXT | `'postgresql'` \| `'mysql'` \| `'sqlserver'` \| `'json'` |
| flow_json | JSONB | Estado serializado de React Flow `{nodes, edges, viewport}` |
| mermaid_string | TEXT | Representación `erDiagram` de Mermaid |
| is_public | BOOLEAN | Si es `true`, accesible sin auth |
| created_at / updated_at | TIMESTAMPTZ | |

#### `diagram_versions`
| Columna | Tipo | Notas |
|---|---|---|
| id | UUID PK | |
| diagram_id | UUID FK | → `diagrams.id` |
| source_code | TEXT | Snapshot del código en ese momento |
| flow_json | JSONB | Snapshot del estado React Flow |
| commit_msg | TEXT | Mensaje descriptivo del commit |
| author_id | UUID FK | → `users.id` |
| created_at | TIMESTAMPTZ | |

### Políticas RLS

Todas las tablas tienen RLS activo en Supabase:
- **users:** Cada usuario solo ve y edita su propio perfil
- **projects:** Solo visible para colaboradores (join con `collaborators`)
- **diagrams:** Acceso si eres colaborador del proyecto, O si `is_public = true`
- **diagram_versions:** Mismo acceso que el diagrama padre

***

## 5. Arquitectura del Parser (@fluxsql/parsers)

El parser es el núcleo del sistema. Transforma texto DDL en estructuras que React Flow renderiza.

### Pipeline
```
String SQL/JSON → Tokenizer/Regex → Extracción de tablas → Extracción de FKs → { nodes[], edges[] }
```

### Contrato de la API pública
```typescript
// Entrada
parseSQL(ddl: string, dialect: 'postgresql' | 'mysql' | 'sqlserver'): ParseResult
parseJSON(jsonSchema: string): ParseResult

// Salida siempre garantizada (nunca lanza excepciones)
interface ParseResult {
  nodes: FlowNode[]    // Compatibles con @xyflow/react
  edges: FlowEdge[]
  errors: ParseError[] // Si hay errores de sintaxis, van aquí
}
```

### Dialectos soportados
| Dialecto | Características especiales |
|---|---|
| `postgresql` | UUID, JSONB, SERIAL, tipos nativos de Postgres |
| `mysql` | AUTO_INCREMENT, backtick identifiers, ENGINE= |
| `sqlserver` | IDENTITY, T-SQL, ALTER TABLE para FKs, esquema `dbo.` |
| `json` | JSON Schema Draft-07, objetos anidados como sub-nodos |

***

## 6. Flujo de Datos del Editor

```
Monaco Editor (onChange)
       │
       ▼ cada keystroke
  useDebounce(300ms)
       │
       ▼ solo cuando el usuario para de escribir
  @fluxsql/parsers.parseSQL()
       │
       ▼
  Zustand Store → setNodes(), setEdges()
       │
       ▼
  React Flow Canvas (re-render automático)
```

**Por qué 300ms de debounce:** Evita que el parser se ejecute en cada tecla. A 300ms, el usuario siente el feedback como instantáneo pero el parser solo corre cuando hay una pausa natural en la escritura.

**Por qué el parser corre en el cliente y no en el servidor:** El parsing necesita ser en tiempo real. Una petición al servidor por cada pausa de 300ms introduciría latencia de red (~100-200ms) que rompería la experiencia de feedback instantáneo.

***

## 7. Arquitectura de Colaboración en Tiempo Real

Se usan dos canales distintos de Supabase Realtime:

| Canal | Protocolo | Uso | Frecuencia |
|---|---|---|---|
| `room-{diagram_id}-presence` | Presence | Cursores del mouse | Throttle 50ms |
| `room-{diagram_id}-nodes` | Broadcast | Cambios de posición de nodos | Debounce 200ms |

**Por qué dos canales separados:**
- **Presence** mantiene estado: cuando un usuario se desconecta, Supabase elimina su entrada automáticamente. Ideal para cursores.
- **Broadcast** es stateless y de alta frecuencia. Ideal para eventos que no necesitan persistencia.

***

## 8. Estructura de Rutas (Next.js App Router)

```
app/
├── (public)/
│   ├── page.tsx              → Landing page de FluxSQL
│   ├── login/page.tsx        → Formulario de login
│   └── register/page.tsx     → Formulario de registro
│
├── (protected)/              → Middleware verifica sesión antes de renderizar
│   ├── dashboard/
│   │   └── page.tsx          → Lista de proyectos del usuario
│   └── editor/
│       └── [id]/
│           └── page.tsx      → Editor principal: Canvas + Monaco
│
└── api/                      → Reservado para webhooks externos
```

***

## 9. Decisiones de Arquitectura (ADRs)

### ADR-001: Monorepo sobre multi-repo
**Decisión:** pnpm workspaces con Turborepo.
**Razón:** El parser necesita ser compartido entre la app y los tests. Un multi-repo requeriría publicar a npm o usar path aliases frágiles.

### ADR-002: Drizzle ORM sobre Prisma
**Decisión:** Drizzle ORM para la capa de datos.
**Razón:** Drizzle genera tipos TypeScript directamente desde el schema sin reflection en runtime. Es más liviano y compatible con Server Components de Next.js 16+. Prisma tiene problemas conocidos con el edge runtime de Vercel.

### ADR-003: Supabase Realtime sobre WebSockets custom
**Decisión:** Usar Presence + Broadcast de Supabase.
**Razón:** Evita mantener un servidor WebSocket separado. Supabase maneja el escalado, autenticación y gestión de salas automáticamente, integrado con el mismo proveedor de auth.

### ADR-004: Parser client-side
**Decisión:** El parser corre en el browser, no en el servidor.
**Razón:** Necesita ejecutarse en tiempo real (debounce 300ms) mientras el usuario escribe. Una petición al servidor por cada cambio introduciría latencia inaceptable. El parser es TypeScript puro y funciona perfectamente en el browser.

### ADR-005: Zustand para estado del canvas
**Decisión:** Zustand en lugar de React Context o Redux.
**Razón:** El canvas tiene estado complejo (nodos, edges, viewport, selección) que cambia con alta frecuencia. Zustand evita re-renders innecesarios con su sistema de suscripciones selectivas.