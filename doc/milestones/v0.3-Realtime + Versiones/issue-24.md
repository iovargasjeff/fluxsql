# Issue #24 — Version Control: Restaurar Versión Anterior

**Milestone:** v0.3 — Realtime + Versiones
**Branch:** `feat/issue-24-restore-version`
**Depende de:** Issue #23 ✅
**Estado:** ⬜ Pendiente

---

## Historia de Usuario

Como estudiante que cometió un error, quiero restaurar una versión anterior para recuperar mi trabajo funcional.

---

## Criterios de Aceptación

- [ ] Botón "Restaurar" en cada ítem del historial (Issue #23)
- [ ] Alerta de confirmación antes de restaurar
- [ ] UPDATE en `diagrams` con el `flow_json` y `sql_content` de la versión seleccionada
- [ ] Canvas y editor recargan inmediatamente

---

## Arquitectura

### Estructura de archivos

```
apps/web/actions/versions/
└── restore.ts   ← NUEVO
```

---

## Patrones y Reglas

### Server Action restore.ts

```typescript
// actions/versions/restore.ts
"use server"
import { createClient } from "@/lib/supabase/server"
import { db } from "@/lib/db"
import { diagramVersions, diagrams } from "@/lib/db/schema"
import { and, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export async function restoreVersionAction(versionId: string, projectId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "No autenticado" }

  // Obtener la versión con su flowJson y sqlContent completos
  const version = await db.query.diagramVersions.findFirst({
    where: eq(diagramVersions.id, versionId),
  })
  if (!version) return { error: "Versión no encontrada" }

  // Actualizar el diagrama principal con el estado de la versión
  await db.update(diagrams)
    .set({
      flowJson: version.flowJson,
      sqlContent: version.sqlContent,
      updatedAt: new Date(),
    })
    .where(eq(diagrams.projectId, projectId))

  revalidatePath(`/editor/${projectId}`)
  return {
    success: true,
    flowJson: version.flowJson,
    sqlContent: version.sqlContent,
    versionNumber: version.versionNumber,
  }
}
```

### Integrar restauración en VersionHistorySheet

```tsx
// Dentro de VersionHistorySheet.tsx — implementar onRestore con confirmación

import { useEditorStore } from "@/store/useEditorStore"
import { restoreVersionAction } from "@/actions/versions/restore"
import { toast } from "sonner"
import type { Node, Edge } from "@xyflow/react"

// En el componente que usa VersionHistorySheet:
async function handleRestore(versionId: string) {
  const confirmed = window.confirm(
    "⚠️ Se perderán los cambios no guardados. ¿Restaurar esta versión?"
  )
  if (!confirmed) return

  const result = await restoreVersionAction(versionId, projectId)
  if (result.error) {
    toast.error(result.error)
    return
  }

  // Aplicar el estado restaurado al store — igual que en la carga inicial
  const savedFlow = (result.flowJson as { nodes?: Node[]; edges?: Edge[] }) ?? {}
  useEditorStore.getState().setSqlValue(result.sqlContent ?? '')
  useEditorStore.getState().setNodesAndEdges(
    savedFlow.nodes ?? [],
    savedFlow.edges ?? []
  )

  toast.success(`Versión v${result.versionNumber} restaurada correctamente`)
  setOpen(false)  // Cerrar el Sheet
}
```

### Por qué aplicar al store directamente (sin reload)

Si se hace `router.refresh()` o `window.location.reload()`, el usuario pierde el contexto de la página. En cambio, aplicar el estado al store de Zustand actualiza el canvas y el editor **en el lugar**, sin parpadeo ni pérdida de contexto. El `revalidatePath` en el Server Action solo afecta al caché de Next.js para la próxima navegación, no causa reload.

---

## Errores Comunes y Cómo Evitarlos

| Error | Causa | Solución |
|---|---|---|
| `window.confirm` bloqueado por el browser | Algunos browsers bloquean confirms en iframes | Si el entorno lo bloquea, usar el componente `AlertDialog` de shadcn en su lugar |
| Canvas no se actualiza tras restaurar | El store se actualiza pero React Flow no re-renderiza | Verificar que `setNodesAndEdges` usa `applyNodeChanges` correctamente — el store dispara re-render automático |
| `flowJson` undefined en versiones antiguas | Versión creada antes de que se guardara correctamente | Añadir `?? {}` como fallback: `(result.flowJson as ...) ?? {}` |

---

## Verificación Final

1. Crear 2 commits en estados distintos
2. Clic "Restaurar" en el commit v1 → alerta de confirmación aparece ✅
3. Cancelar → diagrama no cambia ✅
4. Confirmar → canvas y editor vuelven al estado de v1 ✅

```bash
pnpm build  # Sin errores
```
