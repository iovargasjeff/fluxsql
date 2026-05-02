# Issue #15 — Guardar Diagrama en Supabase

**Milestone:** v0.2 — Canvas + Editor
**Branch:** `feat/issue-15-save-diagram`
**Depende de:** Issue #13 ✅
**Estado:** ⬜ Pendiente

---

## Historia de Usuario

Como estudiante, quiero guardar mi diagrama con un clic para no perder mi trabajo y retomarlo desde otro equipo.

---

## Criterios de Aceptación

- [ ] Botón "Guardar" en la barra superior del editor
- [ ] Server Action `saveDiagramAction` hace UPDATE en tabla `diagrams`
- [ ] Persiste: código SQL, `flow_json` con posiciones X/Y, `mermaid_string`
- [ ] Toast de éxito o error con shadcn

---

## Arquitectura

### Tabla `diagrams` en Supabase — verificar que existe

```sql
-- Debe existir en el schema (Issue #2)
-- Si no existe, agregar migración:
CREATE TABLE IF NOT EXISTS diagrams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  sql_content TEXT DEFAULT '',
  flow_json JSONB DEFAULT '{}',
  mermaid_string TEXT DEFAULT '',
  dialect TEXT DEFAULT 'postgresql',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Estructura de archivos

```
apps/web/
├── actions/diagrams/
│   ├── save.ts           ← NUEVO — Server Action UPDATE
│   └── load.ts           ← ya existe o crear para Issue #16
└── components/editor/
    └── EditorToolbar.tsx ← NUEVO — barra superior con botón Guardar
```

---

## Patrones y Reglas

### Server Action save.ts

```typescript
// actions/diagrams/save.ts
"use server"
import { createClient } from "@/lib/supabase/server"
import { db } from "@/lib/db"
import { diagrams } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

interface SaveDiagramInput {
  projectId: string
  sqlContent: string
  flowJson: object
  mermaidString?: string
  dialect: string
}

export async function saveDiagramAction(input: SaveDiagramInput) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { error: "No autenticado" }

  try {
    // Buscar si ya existe un diagrama para este proyecto
    const existing = await db.query.diagrams.findFirst({
      where: eq(diagrams.projectId, input.projectId)
    })

    if (existing) {
      await db.update(diagrams)
        .set({
          sqlContent: input.sqlContent,
          flowJson: input.flowJson,
          mermaidString: input.mermaidString ?? "",
          dialect: input.dialect,
          updatedAt: new Date(),
        })
        .where(eq(diagrams.projectId, input.projectId))
    } else {
      await db.insert(diagrams).values({
        projectId: input.projectId,
        sqlContent: input.sqlContent,
        flowJson: input.flowJson,
        mermaidString: input.mermaidString ?? "",
        dialect: input.dialect,
      })
    }

    revalidatePath(`/editor/${input.projectId}`)
    return { success: true }
  } catch (err) {
    return { error: "Error al guardar el diagrama" }
  }
}
```

### EditorToolbar con botón Guardar y Toast

```tsx
// components/editor/EditorToolbar.tsx
"use client"
import { useState } from "react"
import { useReactFlow } from "@xyflow/react"
import { useEditorStore } from "@/store/useEditorStore"
import { saveDiagramAction } from "@/actions/diagrams/save"
import { toast } from "sonner"  // shadcn usa sonner para toasts

interface EditorToolbarProps {
  projectId: string
  projectName: string
  dialect: string
}

export function EditorToolbar({ projectId, projectName, dialect }: EditorToolbarProps) {
  const [saving, setSaving] = useState(false)
  const { sqlValue } = useEditorStore()
  const { toObject } = useReactFlow()

  async function handleSave() {
    setSaving(true)
    const flowJson = toObject()  // Serializa nodos, edges y viewport

    const result = await saveDiagramAction({
      projectId,
      sqlContent: sqlValue,
      flowJson,
      dialect,
    })

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success("Diagrama guardado correctamente")
    }
    setSaving(false)
  }

  return (
    <header className="flex items-center justify-between px-4 py-2 bg-[#111827] border-b border-[#1E2A45]">
      <span className="text-white text-sm font-medium">{projectName}</span>
      <button
        onClick={handleSave}
        disabled={saving}
        className="px-3 py-1.5 bg-[#1A6CF6] hover:bg-blue-700 disabled:opacity-50 text-white text-xs rounded transition-colors"
      >
        {saving ? "Guardando..." : "Guardar"}
      </button>
    </header>
  )
}
```

### Instalar sonner (toasts de shadcn)

```bash
pnpm dlx shadcn@latest add sonner --filter web
# Añadir <Toaster /> en app/layout.tsx
```

---

## Errores Comunes y Cómo Evitarlos

| Error | Causa | Solución |
|---|---|---|
| `toObject()` undefined | `useReactFlow()` usado fuera del contexto de `<ReactFlow>` | `EditorToolbar` debe estar dentro del árbol de `<ReactFlowProvider>` o dentro de `Canvas.tsx` |
| `diagrams` tabla no existe | No se creó en la migración de Issue #2 | Ejecutar la migración SQL arriba antes de probar |
| Toast no aparece | `<Toaster />` no añadido al layout | Añadir `<Toaster />` en `app/layout.tsx` |

---

## Verificación Final

1. Crear un proyecto desde el dashboard
2. Ir al editor y escribir SQL con 2-3 tablas
3. Clic en "Guardar" → Toast "Diagrama guardado correctamente" ✅
4. Verificar en Supabase → Table Editor → tabla `diagrams` tiene el registro ✅
5. Cerrar el navegador, volver al editor → (Issue #16 cargará los datos)

```bash
pnpm build  # Sin errores
```
