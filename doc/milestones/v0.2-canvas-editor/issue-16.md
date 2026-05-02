# Issue #16 — Cargar Diagrama Existente

**Milestone:** v0.2 — Canvas + Editor
**Branch:** `feat/issue-16-load-diagram`
**Depende de:** Issue #15 ✅
**Estado:** ⬜ Pendiente

---

## Historia de Usuario

Como usuario que retoma su trabajo, quiero que al entrar a un proyecto guardado el editor y el canvas carguen exactamente donde los dejé.

---

## Criterios de Aceptación

- [ ] Server Component en `/editor/[id]` consulta `diagrams` antes de renderizar
- [ ] Monaco Editor hidrata su valor con `sqlContent` de la DB
- [ ] React Flow hidrata sus nodos/edges con el `flow_json` guardado (posiciones incluidas)
- [ ] Si no existe el diagrama o el usuario no tiene permisos → redirect a `/dashboard`

---

## Arquitectura

### El flujo SSR → Client

```
URL: /editor/abc-123-uuid
        ↓
app/(protected)/editor/[projectId]/page.tsx  ← SERVER COMPONENT
  → SELECT * FROM diagrams WHERE project_id = projectId
  → Si no existe: INSERT vacío y continuar (o redirect si no hay acceso)
  → Pasa initialSQL y initialFlowJson a EditorLayout
        ↓
components/editor/EditorLayout.tsx  ← CLIENT COMPONENT
  → useEffect(() => { store.setSqlValue(initialSQL) }, [])
  → useEffect(() => { store.setNodesAndEdges(nodes, edges) }, [])
```

### Por qué SSR y no fetch en el cliente

- La data llega al HTML inicial → sin loading state → UX más rápida
- No se expone la API key de Supabase al cliente
- Si el usuario no tiene acceso, el redirect ocurre en el servidor (no flash de contenido)

---

## Patrones y Reglas

### Server Action load.ts

```typescript
// actions/diagrams/load.ts
"use server"
import { createClient } from "@/lib/supabase/server"
import { db } from "@/lib/db"
import { diagrams, projects, collaborators } from "@/lib/db/schema"
import { and, eq, or } from "drizzle-orm"

export async function loadDiagramAction(projectId: string) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { error: "No autenticado", data: null }

  // Verificar que el usuario tiene acceso al proyecto (owner o colaborador)
  const hasAccess = await db.query.projects.findFirst({
    where: and(
      eq(projects.id, projectId),
      or(
        eq(projects.ownerId, user.id),
        // Sub-query: existe en collaborators
      )
    )
  })
  if (!hasAccess) return { error: "Sin permisos", data: null }

  // Buscar o crear el diagrama
  let diagram = await db.query.diagrams.findFirst({
    where: eq(diagrams.projectId, projectId)
  })

  if (!diagram) {
    // Primera vez en este proyecto — crear entrada vacía
    const [created] = await db.insert(diagrams).values({
      projectId,
      sqlContent: '',
      flowJson: {},
      mermaidString: '',
      dialect: 'postgresql',
    }).returning()
    diagram = created
  }

  return { error: null, data: diagram }
}
```

### Actualizar page.tsx (Server Component)

```tsx
// app/(protected)/editor/[projectId]/page.tsx
import { redirect } from "next/navigation"
import { loadDiagramAction } from "@/actions/diagrams/load"
import { EditorLayout } from "@/components/editor/EditorLayout"

interface Props {
  params: Promise<{ projectId: string }>
}

export default async function EditorPage({ params }: Props) {
  const { projectId } = await params

  const { data, error } = await loadDiagramAction(projectId)

  if (error || !data) {
    redirect('/dashboard')
  }

  // Extraer nodos/edges del flow_json guardado
  const savedFlow = data.flowJson as { nodes?: unknown[]; edges?: unknown[] } | null
  const initialNodes = savedFlow?.nodes ?? []
  const initialEdges = savedFlow?.edges ?? []

  return (
    <EditorLayout
      projectId={projectId}
      initialSQL={data.sqlContent ?? ''}
      initialNodes={initialNodes}
      initialEdges={initialEdges}
      dialect={(data.dialect ?? 'postgresql') as 'postgresql' | 'mysql' | 'sqlserver' | 'json'}
    />
  )
}
```

### Actualizar EditorLayout para recibir estado inicial

```tsx
// components/editor/EditorLayout.tsx — añadir props de inicialización
"use client"
import { useEffect } from "react"
import { useEditorStore } from "@/store/useEditorStore"
import type { Node, Edge } from "@xyflow/react"

interface EditorLayoutProps {
  projectId: string
  initialSQL: string
  initialNodes: Node[]
  initialEdges: Edge[]
  dialect: 'postgresql' | 'mysql' | 'sqlserver' | 'json'
}

export function EditorLayout({
  projectId, initialSQL, initialNodes, initialEdges, dialect
}: EditorLayoutProps) {
  const { setSqlValue, setNodesAndEdges } = useEditorStore()

  // Hidratar el store con datos de la DB — solo una vez al montar
  useEffect(() => {
    if (initialSQL) setSqlValue(initialSQL)
    if (initialNodes.length > 0) setNodesAndEdges(initialNodes, initialEdges)
  }, [])  // Array vacío intencional — solo al montar

  // ... resto del componente igual
}
```

---

## Errores Comunes y Cómo Evitarlos

| Error | Causa | Solución |
|---|---|---|
| Hydration mismatch | `useEditorStore` tiene estado default diferente al SSR | El store se hidrata en `useEffect` (client-only), no en el render inicial |
| `params` debe ser awaited | Next.js 16 — `params` es una Promise | `const { projectId } = await params` — NO desestructurar directo |
| Canvas carga pero ignora las posiciones | `flow_json` guardado se aplica después del sync del parser | `useSyncEditor` solo corre cuando `sqlValue` cambia; la hidratación inicial NO dispara el sync |
| `flow_json` es `{}` aunque se guardó | `toObject()` no fue llamado dentro del `ReactFlowProvider` | Verificar que `EditorToolbar` está dentro del árbol de `<ReactFlow>` |

---

## Verificación Final

1. Ir a `/editor/[projectId]` → editor y canvas cargan vacíos ✅
2. Escribir SQL, mover nodos, clic "Guardar"
3. Recargar la página → SQL y posiciones de nodos se restauran ✅
4. Cambiar la URL a `/editor/uuid-inventado` → redirect a `/dashboard` ✅

```bash
pnpm build  # Sin errores
```
