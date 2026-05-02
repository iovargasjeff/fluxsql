# Issue #20 — Realtime: Cursores de Colaboradores

**Milestone:** v0.3 — Realtime + Versiones
**Branch:** `feat/issue-20-realtime-cursors`
**Depende de:** Issue #19 ✅
**Estado:** ⬜ Pendiente

---

## Historia de Usuario

Como colaborador activo, quiero ver los cursores de mis compañeros en el canvas con sus nombres para saber dónde están trabajando.

---

## Criterios de Aceptación

- [ ] Supabase Realtime Presence en sala `room-{projectId}`
- [ ] Coordenadas del mouse con throttle 50ms
- [ ] Cursor SVG con color único por usuario y etiqueta con nombre

---

## Arquitectura

### Presence vs Broadcast — por qué Presence aquí

| Canal | Uso | Por qué |
|---|---|---|
| **Presence** | Cursores, usuarios conectados | Supabase gestiona el estado: al cerrar la pestaña el cursor desaparece automáticamente |
| **Broadcast** | Eventos puntuales (mover nodo, cambio SQL) | Para la Issue #21 — eventos sin estado persistente |

Presence es la elección correcta para cursores porque tiene manejo automático de `join`/`leave` — no necesitas cleanup manual al cerrar el navegador.

### Estructura de archivos

```
apps/web/
├── hooks/
│   └── useCollaboratorCursors.ts  ← NUEVO
└── components/editor/
    └── CollaboratorCursors.tsx    ← NUEVO — renderiza cursores
```

---

## Patrones y Reglas

### useCollaboratorCursors.ts

```typescript
// hooks/useCollaboratorCursors.ts
"use client"
import { useEffect, useState, useRef, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"  // cliente browser, no server
import { useReactFlow } from "@xyflow/react"

interface CursorState {
  userId: string
  name: string
  color: string
  x: number
  y: number
}

// Colores fijos para hasta 8 colaboradores simultáneos
const CURSOR_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
  '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'
]

export function useCollaboratorCursors(projectId: string, currentUser: { id: string; name: string }) {
  const [cursors, setCursors] = useState<Map<string, CursorState>>(new Map())
  const supabase = createClient()
  const { screenToFlowPosition } = useReactFlow()
  const throttleRef = useRef<number>(0)

  useEffect(() => {
    const channel = supabase.channel(`room-${projectId}`, {
      config: { presence: { key: currentUser.id } }
    })

    channel
      .on('presence', { event: 'sync' }, () => {
        const presenceState = channel.presenceState<CursorState>()
        const newCursors = new Map<string, CursorState>()

        Object.entries(presenceState).forEach(([key, presences]) => {
          if (key !== currentUser.id && presences[0]) {
            newCursors.set(key, presences[0])
          }
        })
        setCursors(newCursors)
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            userId: currentUser.id,
            name: currentUser.name,
            color: CURSOR_COLORS[Math.abs(hashCode(currentUser.id)) % CURSOR_COLORS.length],
            x: 0,
            y: 0,
          })
        }
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [projectId, currentUser.id])

  // Emitir posición del mouse con throttle 50ms
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const now = Date.now()
    if (now - throttleRef.current < 50) return
    throttleRef.current = now

    // Convertir coordenadas de pantalla a coordenadas del canvas de React Flow
    const flowPos = screenToFlowPosition({ x: e.clientX, y: e.clientY })

    supabase.channel(`room-${projectId}`).track({
      userId: currentUser.id,
      name: currentUser.name,
      color: CURSOR_COLORS[Math.abs(hashCode(currentUser.id)) % CURSOR_COLORS.length],
      x: flowPos.x,
      y: flowPos.y,
    })
  }, [projectId, currentUser])

  return { cursors, handleMouseMove }
}

function hashCode(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash |= 0
  }
  return hash
}
```

### CollaboratorCursors.tsx — renderizar cursores SVG

```tsx
// components/editor/CollaboratorCursors.tsx
"use client"
import type { CursorState } from "@/hooks/useCollaboratorCursors"
import { useReactFlow } from "@xyflow/react"

interface Props {
  cursors: Map<string, CursorState>
}

export function CollaboratorCursors({ cursors }: Props) {
  const { flowToScreenPosition } = useReactFlow()

  return (
    <>
      {Array.from(cursors.values()).map((cursor) => {
        const screenPos = flowToScreenPosition({ x: cursor.x, y: cursor.y })
        return (
          <div
            key={cursor.userId}
            className="pointer-events-none fixed z-50 transition-transform duration-75"
            style={{ left: screenPos.x, top: screenPos.y }}
          >
            {/* Cursor SVG */}
            <svg width="16" height="20" viewBox="0 0 16 20">
              <path
                d="M0 0 L0 14 L4 10 L7 16 L9 15 L6 9 L11 9 Z"
                fill={cursor.color}
                stroke="white"
                strokeWidth="1"
              />
            </svg>
            {/* Etiqueta con nombre */}
            <span
              className="absolute top-4 left-3 text-xs px-1.5 py-0.5 rounded whitespace-nowrap font-medium"
              style={{ backgroundColor: cursor.color, color: '#0A0F1E' }}
            >
              {cursor.name}
            </span>
          </div>
        )
      })}
    </>
  )
}
```

### Integrar en Canvas.tsx

```tsx
// components/editor/Canvas.tsx — añadir cursores
import { useCollaboratorCursors } from "@/hooks/useCollaboratorCursors"
import { CollaboratorCursors } from "./CollaboratorCursors"

// Dentro del componente Canvas:
const { cursors, handleMouseMove } = useCollaboratorCursors(projectId, currentUser)

return (
  <div className="w-full h-full" onMouseMove={handleMouseMove}>
    <ReactFlow ...>
      {/* ...existente */}
    </ReactFlow>
    <CollaboratorCursors cursors={cursors} />
  </div>
)
```

---

## Errores Comunes y Cómo Evitarlos

| Error | Causa | Solución |
|---|---|---|
| Cursores con coordenadas incorrectas | Usando coordenadas de pantalla en lugar de coordenadas del canvas | Siempre usar `screenToFlowPosition` para emitir y `flowToScreenPosition` para renderizar |
| Cursor propio aparece en la lista | `presenceState` incluye al usuario actual | Filtrar: `if (key !== currentUser.id)` |
| Canal no se limpia al desmontar | `removeChannel` no llamado | El `return () => supabase.removeChannel(channel)` en el cleanup del useEffect es obligatorio |
| Throttle no funciona | `throttleRef` recrea en cada render | Usar `useRef` (no `useState`) para el timestamp del throttle |
| `createClient` de server importado en cliente | `@/lib/supabase/server` usa cookies de Next.js | Para componentes client usar `@/lib/supabase/client` |

---

## Verificación Final

1. Abrir el editor en dos pestañas con diferentes usuarios
2. Mover el mouse en pestaña A → cursor con nombre aparece en pestaña B ✅
3. Cerrar pestaña A → cursor desaparece en pestaña B ✅
4. Verificar en Supabase Dashboard → Realtime → canal `room-{projectId}` tiene presence activo

```bash
pnpm build  # Sin errores
```
