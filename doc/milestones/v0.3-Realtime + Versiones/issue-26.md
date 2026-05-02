# Issue #26 — Compartir Diagrama como Link Público (Solo Lectura)

**Milestone:** v0.3 — Realtime + Versiones
**Branch:** `feat/issue-26-public-link`
**Depende de:** Issue #15 ✅ (diagrama guardado)
**Estado:** ⬜ Pendiente

---

## Historia de Usuario

Como estudiante, quiero generar un enlace público de mi diagrama para que el profesor Patrick pueda verlo sin registrarse.

---

## Criterios de Aceptación

- [ ] Switch "Hacer público" en ajustes del proyecto
- [ ] Campo `is_public` en tabla `diagrams`
- [ ] Ruta `/public/[id]` accesible sin sesión → React Flow solo lectura
- [ ] Monaco Editor oculto o `readOnly: true` en vista pública

---

## Arquitectura

### Migración — añadir is_public a diagrams

```sql
-- Ejecutar en Supabase SQL Editor si no existe
ALTER TABLE public.diagrams ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false;

-- Política RLS: permitir SELECT público si is_public = true
CREATE POLICY "Diagrams públicos visibles sin autenticación"
  ON public.diagrams FOR SELECT
  USING (is_public = true);
```

En `lib/db/schema.ts` añadir el campo:
```typescript
isPublic: boolean('is_public').default(false),
```

### Estructura de archivos

```
apps/web/
├── app/
│   └── public/
│       └── [id]/
│           └── page.tsx          ← NUEVO — Server Component sin auth
├── actions/projects/
│   └── togglePublic.ts           ← NUEVO — toggle is_public
└── components/editor/
    └── PublicShareToggle.tsx      ← NUEVO — switch en ajustes
```

---

## Patrones y Reglas

### Server Component /public/[id]/page.tsx

```tsx
// app/public/[id]/page.tsx
// IMPORTANTE: NO importar createClient de server aquí
// Esta ruta es pública — usar el cliente anon de Supabase directamente

import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { PublicDiagramView } from "@/components/public/PublicDiagramView"

export default async function PublicDiagramPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()  // cliente anon — RLS permite SELECT si is_public=true

  const { data: diagram } = await supabase
    .from('diagrams')
    .select('id, flow_json, name')
    .eq('id', id)
    .eq('is_public', true)
    .single()

  if (!diagram) notFound()

  return (
    <div className="w-screen h-screen bg-[#0A0F1E] flex flex-col">
      {/* Header mínimo — sin botones de edición */}
      <header className="h-12 bg-[#111827] border-b border-[#1E2A45] flex items-center px-4 gap-3">
        <span className="text-white text-sm font-medium">{diagram.name}</span>
        <span className="text-xs bg-[#1E2A45] text-[#6B7280] px-2 py-0.5 rounded">Solo lectura</span>
      </header>
      <main className="flex-1 overflow-hidden">
        <PublicDiagramView flowJson={diagram.flow_json} />
      </main>
    </div>
  )
}
```

### PublicDiagramView.tsx — React Flow bloqueado

```tsx
// components/public/PublicDiagramView.tsx
"use client"
import { ReactFlow, Background, Controls, ReactFlowProvider } from "@xyflow/react"
import { TableNode } from "@/components/editor/nodes/TableNode"
import type { FlowJson } from "@/types"

const nodeTypes = { tableNode: TableNode }

export function PublicDiagramView({ flowJson }: { flowJson: FlowJson }) {
  const { nodes = [], edges = [] } = flowJson

  return (
    <ReactFlowProvider>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        // ← SOLO LECTURA: deshabilitar toda interacción
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        zoomOnDoubleClick={false}
        panOnDrag={true}   // permitir paneo para explorar
        zoomOnScroll={true} // permitir zoom para inspeccionar
      >
        <Background />
        <Controls showInteractiveButton={false} />
      </ReactFlow>
    </ReactFlowProvider>
  )
}
```

### Server Action togglePublic.ts

```typescript
// actions/projects/togglePublic.ts
"use server"
import { createClient } from "@/lib/supabase/server"
import { db } from "@/lib/db"
import { diagrams, projects } from "@/lib/db/schema"
import { and, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export async function togglePublicAction(diagramId: string, isPublic: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "No autenticado" }

  // Verificar ownership
  const diagram = await db.query.diagrams.findFirst({
    where: eq(diagrams.id, diagramId),
    with: { project: true }
  })
  if (!diagram || diagram.project.ownerId !== user.id) {
    return { error: "No tienes permisos para cambiar la visibilidad" }
  }

  await db.update(diagrams)
    .set({ isPublic })
    .where(eq(diagrams.id, diagramId))

  revalidatePath(`/public/${diagramId}`)
  return { success: true, publicUrl: `/public/${diagramId}` }
}
```

### PublicShareToggle.tsx — Switch en ajustes

```tsx
// components/editor/PublicShareToggle.tsx
"use client"
import { useState } from "react"
import { togglePublicAction } from "@/actions/projects/togglePublic"
import { toast } from "sonner"

interface Props {
  diagramId: string
  initialIsPublic: boolean
}

export function PublicShareToggle({ diagramId, initialIsPublic }: Props) {
  const [isPublic, setIsPublic] = useState(initialIsPublic)
  const [loading, setLoading] = useState(false)

  async function handleToggle() {
    setLoading(true)
    const newVal = !isPublic
    const result = await togglePublicAction(diagramId, newVal)

    if (result.error) {
      toast.error(result.error)
    } else {
      setIsPublic(newVal)
      if (newVal) {
        const fullUrl = `${window.location.origin}${result.publicUrl}`
        await navigator.clipboard.writeText(fullUrl).catch(() => {})
        toast.success("Link público copiado al portapapeles")
      } else {
        toast.info("El diagrama ahora es privado")
      }
    }
    setLoading(false)
  }

  return (
    <div className="flex items-center justify-between px-3 py-2 bg-[#1E2A45] rounded-lg">
      <div>
        <p className="text-white text-sm font-medium">Enlace público</p>
        <p className="text-[#6B7280] text-xs">
          {isPublic ? "Cualquiera con el link puede ver" : "Solo miembros del proyecto"}
        </p>
      </div>
      <button
        onClick={handleToggle}
        disabled={loading}
        className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
          isPublic ? 'bg-[#1A6CF6]' : 'bg-[#374151]'
        } disabled:opacity-50`}
      >
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
          isPublic ? 'translate-x-5' : 'translate-x-0'
        }`} />
      </button>
    </div>
  )
}
```

---

## Errores Comunes y Cómo Evitarlos

| Error | Causa | Solución |
|---|---|---|
| `notFound()` aunque el diagrama existe | RLS no permite SELECT público | Verificar que la política RLS no exige `auth.uid()` para diagramas públicos |
| `nodesDraggable` no funciona | Propiedad pasada a `ReactFlowProvider` en lugar de `ReactFlow` | La prop va en `<ReactFlow nodesDraggable={false}>`, no en el Provider |
| URL del link incompleta | `result.publicUrl` es ruta relativa | Concatenar `window.location.origin + result.publicUrl` en el cliente |
| Nodo `tableNode` no se renderiza | `nodeTypes` no registrado en PublicDiagramView | Importar y pasar `nodeTypes={{ tableNode: TableNode }}` al ReactFlow |

---

## Verificación Final

1. Activar switch → Toast "Link público copiado" ✅
2. Abrir URL en ventana incógnita → diagrama carga sin login ✅
3. Intentar arrastrar nodo → no se mueve ✅
4. Desactivar switch → URL devuelve 404 ✅

```bash
pnpm build  # Sin errores
```
