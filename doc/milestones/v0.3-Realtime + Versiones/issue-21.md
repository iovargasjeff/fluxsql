# Issue #21 — Realtime: Sync de Posición de Nodos

**Milestone:** v0.3 — Realtime + Versiones
**Branch:** `feat/issue-21-realtime-node-sync`
**Depende de:** Issue #20 ✅
**Estado:** ⬜ Pendiente

---

## Historia de Usuario

Como estudiante en equipo, quiero que cuando mi compañero mueva o agregue una tabla, el cambio aparezca en mi pantalla inmediatamente.

---

## Criterios de Aceptación

- [ ] Supabase Realtime Broadcast en el mismo canal `room-{projectId}`
- [ ] Eventos `node_move` (drag) y `sql_change` (nuevo nodo del parser)
- [ ] Canvas receptor actualiza nodos sin sobreescribir acciones propias (optimistic UI)

---

## Arquitectura

### Por qué Broadcast y no Presence aquí

Broadcast es para eventos **sin estado persistente** — un movimiento de nodo no necesita que Supabase lo recuerde al reconectarse. Solo los clientes activos en ese momento lo reciben. Es más liviano que Presence y perfecto para eventos de drag.

### Dos tipos de eventos a sincronizar

| Evento | Trigger | Datos enviados |
|---|---|---|
| `node_move` | `onNodeDragStop` en React Flow | `{ nodeId, position: {x, y} }` |
| `sql_change` | `setNodesAndEdges` en useSyncEditor | `{ nodes[], edges[] }` completo |

### Estructura de archivos

```
apps/web/hooks/
└── useRealtimeSync.ts   ← NUEVO — emite y recibe eventos Broadcast
```

---

## Patrones y Reglas

### useRealtimeSync.ts

```typescript
// hooks/useRealtimeSync.ts
"use client"
import { useEffect, useRef, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { useEditorStore } from "@/store/useEditorStore"
import type { Node } from "@xyflow/react"

interface NodeMovePayload {
  type: 'node_move'
  nodeId: string
  position: { x: number; y: number }
  senderId: string
}

interface SqlChangePayload {
  type: 'sql_change'
  nodes: Node[]
  edges: unknown[]
  senderId: string
}

type BroadcastPayload = NodeMovePayload | SqlChangePayload

export function useRealtimeSync(projectId: string, userId: string) {
  const supabase = createClient()
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)
  const { setNodesAndEdges } = useEditorStore()

  useEffect(() => {
    const channel = supabase.channel(`room-${projectId}`)
    channelRef.current = channel

    channel
      .on('broadcast', { event: 'node_move' }, ({ payload }: { payload: NodeMovePayload }) => {
        if (payload.senderId === userId) return  // Ignorar propios eventos

        // Actualizar solo el nodo que se movió — sin afectar al resto
        const currentNodes = useEditorStore.getState().nodes
        const updatedNodes = currentNodes.map((n) =>
          n.id === payload.nodeId
            ? { ...n, position: payload.position }
            : n
        )
        useEditorStore.getState().setNodesAndEdges(
          updatedNodes,
          useEditorStore.getState().edges
        )
      })
      .on('broadcast', { event: 'sql_change' }, ({ payload }: { payload: SqlChangePayload }) => {
        if (payload.senderId === userId) return

        // Preservar posiciones locales antes de aplicar cambios remotos
        const localNodes = useEditorStore.getState().nodes
        const positionMap = new Map(localNodes.map((n) => [n.id, n.position]))

        const mergedNodes = payload.nodes.map((n) => ({
          ...n,
          position: positionMap.get(n.id) ?? n.position,
        }))

        setNodesAndEdges(mergedNodes, payload.edges as never)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [projectId, userId])

  // Emitir movimiento de nodo
  const emitNodeMove = useCallback((nodeId: string, position: { x: number; y: number }) => {
    channelRef.current?.send({
      type: 'broadcast',
      event: 'node_move',
      payload: { type: 'node_move', nodeId, position, senderId: userId } satisfies NodeMovePayload,
    })
  }, [userId])

  // Emitir cambio de SQL (nuevos nodos del parser)
  const emitSqlChange = useCallback((nodes: Node[], edges: unknown[]) => {
    channelRef.current?.send({
      type: 'broadcast',
      event: 'sql_change',
      payload: { type: 'sql_change', nodes, edges, senderId: userId } satisfies SqlChangePayload,
    })
  }, [userId])

  return { emitNodeMove, emitSqlChange }
}
```

### Integrar en Canvas.tsx

```tsx
// Añadir onNodeDragStop para emitir node_move
const { emitNodeMove } = useRealtimeSync(projectId, currentUser.id)

<ReactFlow
  ...
  onNodeDragStop={(_, node) => {
    emitNodeMove(node.id, node.position)
  }}
>
```

### Integrar en useSyncEditor.ts

```typescript
// Después de setNodesAndEdges, emitir sql_change
// Pasar emitSqlChange como parámetro opcional al hook
setNodesAndEdges(newNodes, newEdges)
emitSqlChange?.(newNodes, newEdges)
```

---

## Errores Comunes y Cómo Evitarlos

| Error | Causa | Solución |
|---|---|---|
| Loop de eventos (A emite → B recibe → B emite → A recibe) | No se filtra el `senderId` | `if (payload.senderId === userId) return` es obligatorio |
| Posiciones se sobreescriben al recibir `sql_change` remoto | Se aplican las posiciones del emisor, no las locales | Usar `positionMap` de nodos locales antes de aplicar el payload remoto |
| Canal duplicado con el de Presence (Issue #20) | Se crean dos canales con el mismo nombre | **Usar el mismo canal** `room-{projectId}` — Presence y Broadcast coexisten en el mismo canal de Supabase |
| `channelRef` null al emitir | Canal no suscrito todavía | Verificar `channelRef.current?.send(...)` con el operador `?.` |

---

## Verificación Final

1. Abrir editor en dos pestañas
2. Mover un nodo en pestaña A → nodo se mueve en pestaña B ✅
3. Escribir SQL en pestaña A → nuevo nodo aparece en pestaña B ✅
4. Mover el mismo nodo en ambas pestañas simultáneamente → sin crash ni posición incorrecta ✅

```bash
pnpm build  # Sin errores
```
