# Issue #2 — Drizzle ORM + Supabase Conexión y Schema

**Milestone:** v0.1 — Setup Base
**Branch:** `feat/issue-2-drizzle-schema`
**Depende de:** Issue #1 ✅
**Estado:** ⬜ Pendiente

---

## Historia de Usuario

Como desarrollador backend, quiero configurar Drizzle ORM conectado a Supabase definiendo los 5 esquemas completos, para garantizar tipado estricto desde la base de datos hasta el cliente.

---

## Criterios de Aceptación

- [ ] `apps/web/lib/db/schema.ts` con las 5 tablas: `users`, `projects`, `collaborators`, `diagrams`, `diagram_versions`
- [ ] `drizzle-kit generate` crea archivos SQL de migración con FKs correctas
- [ ] La conexión usa `DATABASE_URL` desde variables de entorno (nunca hardcodeada)

---

## Arquitectura

### Estructura de archivos a crear

```
apps/web/
├── lib/
│   └── db/
│       ├── schema.ts          ← Definición de tablas (única fuente de verdad)
│       ├── index.ts           ← Cliente Drizzle exportado como `db`
│       └── migrations/        ← SQL generado por drizzle-kit (no editar a mano)
├── drizzle.config.ts          ← Configuración de drizzle-kit
└── .env.local                 ← DATABASE_URL (en .gitignore)
```

### Relaciones entre tablas

```
users ──(1:N)── projects        (via owner_id)
users ──(N:M)── projects        (via collaborators)
projects ──(1:N)── diagrams
diagrams ──(1:N)── diagram_versions
```

---

## Patrones y Reglas

### Tipado — Siempre usar tipos inferidos de Drizzle

```typescript
// ✅ CORRECTO — tipos se mantienen sincronizados con el schema automáticamente
type User = typeof users.$inferSelect
type NewUser = typeof users.$inferInsert

// ❌ INCORRECTO — tipo manual que puede desincronizarse
interface User { id: string; email: string; ... }
```

### Cliente Drizzle — Patrón Singleton para desarrollo

En Next.js con hot reload, sin el patrón singleton se crean múltiples conexiones:

```typescript
// lib/db/index.ts
// El globalThis evita múltiples instancias en dev con hot reload
const globalForDb = globalThis as unknown as { connection: postgres.Sql }
const connection = globalForDb.connection ?? postgres(process.env.DATABASE_URL!, { prepare: false })
if (process.env.NODE_ENV !== 'production') globalForDb.connection = connection
export const db = drizzle(connection, { schema })
```

### Variables de entorno — Dos URLs distintas de Supabase

```bash
# .env.local
DATABASE_URL=postgresql://postgres.[ref]:[pass]@aws-0-[region].pooler.supabase.com:6543/postgres
# ↑ Pooler puerto 6543 — OBLIGATORIO para Vercel/Next.js serverless

NEXT_PUBLIC_SUPABASE_URL=https://[ref].supabase.co
# ↑ URL de la API REST de Supabase — NO es la connection string
```

**Estos dos valores son completamente distintos. No los confundas.**

### Constraints de seguridad en el schema

La columna `role` de `collaborators` necesita validación a nivel de base de datos:

```typescript
// Usar check constraint para que PostgreSQL valide el valor
check('role_check', sql`${t.role} IN ('owner', 'editor', 'viewer')`)
```

Esto previene insertar roles inválidos incluso si hay un bug en la app.

---

## Pasos de Implementación

### 1. Instalar dependencias

```bash
pnpm add drizzle-orm postgres --filter web
pnpm add -D drizzle-kit --filter web
```

### 2. Verificar que el schema tiene las 5 tablas con sus relaciones

Orden de creación importa (FK no puede referenciar tabla que no existe):
1. `users` (no tiene FKs)
2. `projects` (FK → users)
3. `collaborators` (FK → projects, FK → users)
4. `diagrams` (FK → projects)
5. `diagram_versions` (FK → diagrams, FK → users)

### 3. Configurar drizzle.config.ts

```typescript
// apps/web/drizzle.config.ts
import type { Config } from 'drizzle-kit'

export default {
  schema: './lib/db/schema.ts',
  out: './lib/db/migrations',
  dialect: 'postgresql',
  dbCredentials: { url: process.env.DATABASE_URL! },
} satisfies Config
```

### 4. Aplicar el schema

```bash
cd apps/web

# Desarrollo (push directo, sin historial de migraciones)
pnpm drizzle-kit push

# Producción (genera SQL + aplica con historial)
pnpm drizzle-kit generate
pnpm drizzle-kit migrate
```

### 5. Verificar en Supabase

Ir a Supabase Dashboard → Table Editor → verificar que las 5 tablas aparecen con sus columnas y FKs.

---

## Seguridad — RLS (Row Level Security)

Después de crear las tablas, **activar RLS en Supabase** para cada tabla:

```sql
-- Ejecutar en Supabase SQL Editor
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagrams ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagram_versions ENABLE ROW LEVEL SECURITY;
```

Sin RLS activo, cualquier usuario autenticado puede leer todos los datos de todos los usuarios.

---

## Errores Comunes y Cómo Evitarlos

| Error | Causa | Solución |
|---|---|---|
| `Connection refused` en puerto 5432 | Usando conexión directa en entorno serverless | Cambiar a pooler puerto 6543 |
| `Column X does not exist` | Schema local desincronizado con Supabase | Ejecutar `drizzle-kit push` de nuevo |
| Tipos `unknown` en consultas | No se pasó `{ schema }` al cliente Drizzle | `drizzle(connection, { schema })` |
| FKs no se crean | Orden incorrecto de tablas en schema.ts | Definir tablas en orden de dependencia |

---

## Verificación Final

```bash
cd apps/web
pnpm drizzle-kit push
# Resultado esperado: "All statements are now applied"

# Volver a la raíz y verificar que el build sigue pasando
cd ../..
pnpm build
```

---

## Diagrama de Secuencia

```mermaid
sequenceDiagram
    actor Dev as Developer
    participant D as Drizzle ORM
    participant S as Supabase (PostgreSQL)

    Dev->>D: Define schema.ts (5 tablas)
    Dev->>D: drizzle-kit push
    D->>S: Ejecuta sentencias DDL (CREATE TABLE)
    S-->>D: Confirmación de esquema creado
    D-->>Dev: Migración exitosa
```
