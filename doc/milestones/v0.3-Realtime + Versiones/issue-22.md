# Issue #22 — Version Control: Hacer Commit con Mensaje

**Milestone:** v0.3 — Realtime + Versiones
**Branch:** `feat/issue-22-version-commit`
**Depende de:** Issue #15 ✅ (guardar diagrama)
**Estado:** ⬜ Pendiente

---

## Historia de Usuario

Como arquitecto del proyecto, quiero guardar snapshots del diagrama con un mensaje descriptivo para congelar estados estables.

---

## Criterios de Aceptación

- [ ] Botón "Commit" en la toolbar que abre un modal
- [ ] INSERT en `diagram_versions` con versión autoincremental, `flow_json`, mensaje y `user_id`
- [ ] Guardar normal (Issue #15) independiente de los commits

---

## Arquitectura

### Tabla diagram_versions — añadir al schema

```typescript
// lib/db/schema.ts — añadir si no existe
export const diagramVersions = pgTable('diagram_versions', {
  id: uuid('id').primaryKey().defaultRandom(),
  diagramId: uuid('diagram_id').notNull().references(() => diagrams.id, { onDelete: 'cascade' }),
  versionNumber: integer('version_number').notNull(),
  flowJson: jsonb('flow_json').notNull(),
  sqlContent: text('sql_content').default(''),
  message: text('message').notNull(),
  userId: uuid('user_id').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
})
```

Ejecutar migración: `pnpm db:push --filter web`

### Estructura de archivos

```
apps/web/
├── actions/versions/
│   └── create.ts                ← NUEVO
└── components/editor/
    └── CommitModal.tsx           ← NUEVO
```

---

## Patrones y Reglas

### Server Action create.ts

```typescript
// actions/versions/create.ts
"use server"
import { createClient } from "@/lib/supabase/server"
import { db } from "@/lib/db"
import { diagramVersions, diagrams } from "@/lib/db/schema"
import { eq, max } from "drizzle-orm"

export async function createVersionAction(
  diagramId: string,
  flowJson: object,
  sqlContent: string,
  message: string
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "No autenticado" }

  // Calcular el número de versión autoincremental
  const result = await db
    .select({ maxVersion: max(diagramVersions.versionNumber) })
    .from(diagramVersions)
    .where(eq(diagramVersions.diagramId, diagramId))

  const nextVersion = (result[0]?.maxVersion ?? 0) + 1

  await db.insert(diagramVersions).values({
    diagramId,
    versionNumber: nextVersion,
    flowJson,
    sqlContent,
    message,
    userId: user.id,
  })

  return { success: true, versionNumber: nextVersion }
}
```

### CommitModal.tsx

```tsx
// components/editor/CommitModal.tsx
"use client"
import { useState } from "react"
import { useReactFlow } from "@xyflow/react"
import { useEditorStore } from "@/store/useEditorStore"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { createVersionAction } from "@/actions/versions/create"
import { toast } from "sonner"

interface Props {
  diagramId: string
}

export function CommitModal({ diagramId }: Props) {
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const { toObject } = useReactFlow()
  const { sqlValue } = useEditorStore()

  async function handleCommit(e: React.FormEvent) {
    e.preventDefault()
    if (!message.trim()) return
    setLoading(true)

    const flowJson = toObject()
    const result = await createVersionAction(diagramId, flowJson, sqlValue, message.trim())

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(`Versión v${result.versionNumber} guardada correctamente`)
      setMessage("")
      setOpen(false)
    }
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="px-3 py-1.5 bg-[#1E2A45] hover:bg-[#2A3A55] text-white text-xs rounded transition-colors">
          Commit
        </button>
      </DialogTrigger>
      <DialogContent className="bg-[#111827] border-[#1E2A45]">
        <DialogHeader>
          <DialogTitle className="text-white">Guardar versión</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleCommit} className="flex flex-col gap-3 mt-2">
          <input
            type="text"
            placeholder="ej. Agregado módulo de pagos"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={100}
            required
            className="bg-[#1E2A45] border border-[#2A3A55] text-white placeholder-[#6B7280] px-3 py-2 rounded text-sm focus:outline-none focus:border-[#1A6CF6]"
          />
          <button
            type="submit"
            disabled={loading || !message.trim()}
            className="bg-[#1A6CF6] hover:bg-blue-700 disabled:opacity-50 text-white py-2 rounded text-sm transition-colors"
          >
            {loading ? "Guardando..." : "Guardar versión"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
```

---

## Errores Comunes y Cómo Evitarlos

| Error | Causa | Solución |
|---|---|---|
| Botón habilitado con mensaje vacío | Validación solo en submit | Añadir `disabled={!message.trim()}` al botón |
| Versiones duplicadas con mismo número | Race condition en concurrencia | Usar transacción o `MAX() + 1` dentro de una transacción DB |
| `toObject()` fuera del provider | `CommitModal` renderizado fuera del `ReactFlowProvider` | Asegurar que `CommitModal` está dentro del árbol del `ReactFlowProvider` en `EditorLayout` |

---

## Verificación Final

1. Clic "Commit" → modal abre ✅
2. Botón deshabilitado sin mensaje ✅
3. Escribir mensaje y confirmar → Toast "Versión v1 guardada" ✅
4. Verificar en Supabase → tabla `diagram_versions` tiene el registro ✅

```bash
pnpm build  # Sin errores
```
