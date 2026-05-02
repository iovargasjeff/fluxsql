# Issue #17 — Export PNG y SVG

**Milestone:** v0.2 — Canvas + Editor
**Branch:** `feat/issue-17-export-images`
**Depende de:** Issue #13 ✅
**Estado:** ⬜ Pendiente

---

## Historia de Usuario

Como estudiante, quiero exportar mi diagrama como PNG o SVG para insertarlo en informes FD03/FD04 del profesor Patrick.

---

## Criterios de Aceptación

- [ ] Menú desplegable "Exportar" en la barra superior
- [ ] PNG usa `html-to-image` capturando el panel de React Flow con `fitView` previo
- [ ] Imagen con nombre del proyecto en el nombre de archivo
- [ ] Opción SVG adicional

---

## Arquitectura

### Estructura de archivos

```
apps/web/
└── components/editor/
    ├── ExportMenu.tsx        ← NUEVO — menú Exportar en toolbar
    └── EditorToolbar.tsx     ← MODIFICAR — añadir ExportMenu
```

---

## Patrones y Reglas

### Instalar html-to-image

```bash
pnpm add html-to-image --filter web
```

### ExportMenu.tsx — lógica de exportación

```tsx
// components/editor/ExportMenu.tsx
"use client"
import { useRef, useState } from "react"
import { useReactFlow } from "@xyflow/react"
import { toPng, toSvg } from "html-to-image"

interface ExportMenuProps {
  projectName: string
}

export function ExportMenu({ projectName }: ExportMenuProps) {
  const [open, setOpen] = useState(false)
  const { fitView, getNodes } = useReactFlow()

  // Selector del DOM del canvas de React Flow
  const getCanvasNode = (): HTMLElement | null => {
    return document.querySelector('.react-flow__renderer') as HTMLElement
  }

  async function handleExportPng() {
    setOpen(false)
    const canvas = getCanvasNode()
    if (!canvas) return

    // fitView primero para asegurar que todo es visible
    await fitView({ duration: 200, padding: 0.2 })
    await new Promise(r => setTimeout(r, 250))  // Esperar animación

    const dataUrl = await toPng(canvas, {
      backgroundColor: '#0A0F1E',
      pixelRatio: 2,  // 2x para alta resolución
      filter: (node) => {
        // Ocultar controles de React Flow en la imagen
        if (node.classList?.contains('react-flow__controls')) return false
        if (node.classList?.contains('react-flow__minimap')) return false
        return true
      }
    })

    const fileName = `${projectName.toLowerCase().replace(/\s+/g, '-')}-diagrama.png`
    downloadDataUrl(dataUrl, fileName)
  }

  async function handleExportSvg() {
    setOpen(false)
    const canvas = getCanvasNode()
    if (!canvas) return

    await fitView({ duration: 200, padding: 0.2 })
    await new Promise(r => setTimeout(r, 250))

    const dataUrl = await toSvg(canvas, {
      backgroundColor: '#0A0F1E',
      filter: (node) => {
        if (node.classList?.contains('react-flow__controls')) return false
        return true
      }
    })

    const fileName = `${projectName.toLowerCase().replace(/\s+/g, '-')}-diagrama.svg`
    downloadDataUrl(dataUrl, fileName)
  }

  function downloadDataUrl(dataUrl: string, fileName: string) {
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = fileName
    a.click()
  }

  if (getNodes().length === 0) return null  // No mostrar si el canvas está vacío

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="px-3 py-1.5 bg-[#1E2A45] hover:bg-[#2A3A55] text-white text-xs rounded transition-colors flex items-center gap-1"
      >
        Exportar ▾
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 bg-[#111827] border border-[#1E2A45] rounded shadow-lg z-50 min-w-[140px]">
          <button
            onClick={handleExportPng}
            className="w-full text-left px-3 py-2 text-xs text-white hover:bg-[#1E2A45] transition-colors"
          >
            📸 Exportar PNG
          </button>
          <button
            onClick={handleExportSvg}
            className="w-full text-left px-3 py-2 text-xs text-white hover:bg-[#1E2A45] transition-colors border-t border-[#1E2A45]"
          >
            🖼️ Exportar SVG
          </button>
        </div>
      )}
    </div>
  )
}
```

### Cerrar menú al hacer clic fuera

```tsx
// Añadir al ExportMenu — cerrar con click outside
import { useEffect, useRef } from "react"

const menuRef = useRef<HTMLDivElement>(null)

useEffect(() => {
  function handleClickOutside(e: MouseEvent) {
    if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
      setOpen(false)
    }
  }
  document.addEventListener('mousedown', handleClickOutside)
  return () => document.removeEventListener('mousedown', handleClickOutside)
}, [])
```

---

## Errores Comunes y Cómo Evitarlos

| Error | Causa | Solución |
|---|---|---|
| Imagen exportada en blanco | `fitView` no terminó antes de capturar | Usar `await new Promise(r => setTimeout(r, 250))` después de `fitView` |
| `react-flow__renderer` no encontrado | Selector de clase incorrecto | Verificar con DevTools el selector correcto — puede ser `.react-flow__viewport` |
| Controles aparecen en la imagen | El `filter` no los excluye correctamente | Revisar nombres de clase con DevTools y ajustar el `filter` |
| PNG borroso | `pixelRatio` no configurado | Usar `pixelRatio: 2` para pantallas Retina/4K |
| Fondo transparente en PNG | `backgroundColor` no configurado | Siempre pasar `backgroundColor: '#0A0F1E'` |

---

## Verificación Final

1. Crear un diagrama con 3-4 tablas
2. Clic "Exportar → PNG" → archivo `.png` se descarga ✅
3. Abrir el PNG — fondo oscuro, nodos visibles, sin controles de React Flow ✅
4. Clic "Exportar → SVG" → archivo `.svg` se descarga ✅
5. Nodo "Exportar" no aparece con el canvas vacío ✅

```bash
pnpm build  # Sin errores
```
