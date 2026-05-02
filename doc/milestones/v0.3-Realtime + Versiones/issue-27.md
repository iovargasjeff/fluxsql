# Issue #27 — Búsqueda de Tablas en el Canvas (Command Palette)

**Milestone:** v0.3 — Realtime + Versiones
**Branch:** `feat/issue-27-search-nodes`
**Depende de:** Issue #10 ✅ (nodos en canvas)
**Estado:** ⬜ Pendiente

---

## Historia de Usuario

Como desarrollador con esquemas extensos, quiero un Command Palette (Ctrl+K) para encontrar y enfocar tablas instantáneamente.

---

## Criterios de Aceptación

- [ ] Command Palette con Ctrl+K / Cmd+K
- [ ] Lista dinámica desde `nodes.map(n => n.data.tableName)`
- [ ] Al seleccionar → `setCenter(x, y, { zoom: 1.5, duration: 800 })` en React Flow
- [ ] Empty state: "No se encontraron tablas"

---

## Arquitectura

### Instalar shadcn Command

```bash
pnpm dlx shadcn@latest add command --cwd apps/web -y
```

### Estructura de archivos

```
apps/web/components/editor/
└── SearchPalette.tsx   ← NUEVO
```

---

## Patrones y Reglas

### SearchPalette.tsx

```tsx
// components/editor/SearchPalette.tsx
"use client"
import { useEffect, useState, useCallback } from "react"
import { useReactFlow } from "@xyflow/react"
import { useEditorStore } from "@/store/useEditorStore"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"

export function SearchPalette() {
  const [open, setOpen] = useState(false)
  const { setCenter } = useReactFlow()
  const nodes = useEditorStore((s) => s.nodes)

  // Escuchar Ctrl+K / Cmd+K globalmente
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()  // evitar el comportamiento default del browser
        setOpen((prev) => !prev)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleSelect = useCallback((nodeId: string) => {
    const node = nodes.find((n) => n.id === nodeId)
    if (!node) return

    setOpen(false)

    // Centrar la cámara en el nodo con zoom y animación
    setCenter(
      node.position.x + (node.measured?.width ?? 200) / 2,
      node.position.y + (node.measured?.height ?? 100) / 2,
      { zoom: 1.5, duration: 800 }
    )
  }, [nodes, setCenter])

  // Construir lista de tablas desde el estado del store
  const tableItems = nodes.map((n) => ({
    id: n.id,
    label: (n.data as { tableName?: string }).tableName ?? n.id,
  }))

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Buscar tabla..." />
      <CommandList>
        <CommandEmpty>No se encontraron tablas.</CommandEmpty>
        <CommandGroup heading="Tablas en el canvas">
          {tableItems.map((item) => (
            <CommandItem
              key={item.id}
              value={item.label}
              onSelect={() => handleSelect(item.id)}
              className="flex items-center gap-2 cursor-pointer"
            >
              {/* Icono de tabla */}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <path d="M3 9h18M3 15h18M9 3v18"/>
              </svg>
              <span>{item.label}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
```

### Integrar en EditorLayout.tsx

```tsx
// Añadir dentro del árbol del ReactFlowProvider:
import { SearchPalette } from "@/components/editor/SearchPalette"

// Dentro del JSX del editor, junto a CollaboratorCursors:
<SearchPalette />
```

### Añadir hint visual de atajo en la toolbar

```tsx
// En EditorToolbar.tsx — hint del shortcut
<span className="text-[#6B7280] text-xs hidden sm:flex items-center gap-1">
  <kbd className="px-1.5 py-0.5 bg-[#1E2A45] rounded text-xs">Ctrl</kbd>
  <span>+</span>
  <kbd className="px-1.5 py-0.5 bg-[#1E2A45] rounded text-xs">K</kbd>
  <span>para buscar</span>
</span>
```

---

## Errores Comunes y Cómo Evitarlos

| Error | Causa | Solución |
|---|---|---|
| `setCenter` no mueve la cámara | Posición del nodo es el origen (0,0) del nodo, no su centro | Sumar la mitad del ancho/alto: `x + width/2, y + height/2` |
| `node.measured` undefined | React Flow no ha medido el nodo aún | Fallback: `node.measured?.width ?? 200` |
| Ctrl+K abre el spotlight del browser en Mac | Event handler sin `e.preventDefault()` | `e.preventDefault()` antes de setOpen es obligatorio |
| `CommandDialog` no se importa | shadcn Command no instalado | `pnpm dlx shadcn@latest add command --cwd apps/web -y` |
| Canvas no recibe el foco al buscar | SearchPalette fuera del ReactFlowProvider | Colocar `<SearchPalette />` dentro del árbol del Provider |

---

## Verificación Final

1. Canvas con varias tablas → Ctrl+K → palette abre ✅
2. Escribir nombre de tabla → aparece en la lista ✅
3. Enter / clic → cámara se anima hacia el nodo con zoom 1.5 ✅
4. Escribir nombre inexistente → "No se encontraron tablas" ✅

```bash
pnpm build  # Sin errores
```
