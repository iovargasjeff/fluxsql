# Issue #35 — Responsive Tablet 768px+

**Milestone:** v0.4 — UI/UX Polish
**Branch:** `feat/issue-35-responsive-tablet`
**Responsable:** Jefferson
**Estado:** ⬜ Pendiente

---

## Historia de Usuario

Como estudiante en tablet/iPad, quiero que el editor se adapte para revisar el diagrama cómodamente.

---

## Criterios de Aceptación

- [ ] En pantallas < 1024px: editor SQL se oculta, canvas ocupa 100%
- [ ] Botón "Ver/Ocultar Código" para alternar el panel SQL
- [ ] Botones de toolbar con tamaño táctil mínimo (min-w-10 min-h-10)

---

## Arquitectura

### Leer primero

→ `apps/web/components/editor/EditorLayout.tsx` — ver cómo está dividido el split view actual

### Patrón — toggle del panel SQL

```tsx
// En EditorLayout.tsx o EditorLayoutInner
'use client'  // ya debe ser client component
import { useState, useEffect } from 'react'

// Hook para detectar tablet
function useIsTablet() {
  const [isTablet, setIsTablet] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1024px)')
    setIsTablet(mq.matches)
    const handler = (e: MediaQueryListEvent) => setIsTablet(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])
  return isTablet
}

// En el componente:
const isTablet = useIsTablet()
const [showEditor, setShowEditor] = useState(true)

// Layout condicional:
<div className="flex flex-1 overflow-hidden">
  {/* Panel SQL — oculto en tablet si showEditor === false */}
  {(!isTablet || showEditor) && (
    <div className="w-full lg:w-[420px] flex-shrink-0 border-r border-[#1E2A45]">
      {/* Monaco Editor */}
    </div>
  )}

  {/* Canvas — siempre visible */}
  <div className="flex-1 relative">
    {/* Botón toggle en tablet */}
    {isTablet && (
      <button
        onClick={() => setShowEditor(prev => !prev)}
        className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-3 py-2 bg-[#111827] border border-[#1E2A45] rounded-lg text-xs text-[#9CA3AF] hover:text-white transition-colors min-w-10 min-h-10"
      >
        <Code size={14} />
        {showEditor ? 'Ocultar código' : 'Ver código'}
      </button>
    )}
    {/* React Flow Canvas */}
  </div>
</div>
```

### Botones táctiles en toolbar

```tsx
// En EditorToolbar.tsx — cambiar p-2 por min-w-10 min-h-10 en mobile
className="flex items-center justify-center min-w-8 min-h-8 sm:min-w-10 sm:min-h-10 p-2 rounded-lg transition-colors ..."
```

---

## Errores Comunes y Cómo Evitarlos

| Error | Causa | Solución |
|---|---|---|
| `useIsTablet` devuelve `false` siempre en SSR | `window` no existe en el servidor | `useState(false)` inicial + `useEffect` para detectar después del mount |
| Layout "salta" al cargar | Estado inicial incorrecto | Siempre inicializar `showEditor: true` para que no haya CLS |
| Canvas no ocupa 100% al ocultar editor | Falta `flex-1` en el contenedor del canvas | `className="flex-1 relative"` en el div del canvas |

---

## Verificación Final

```bash
pnpm build  # Sin errores
```

1. DevTools → 768px → editor SQL desaparece, canvas al 100% ✅
2. Botón "Ver código" aparece en tablet ✅
3. Clic → editor aparece / desaparece ✅
4. Desktop 1280px → layout normal lado a lado ✅
5. Actualizar `.ia/PROGRESS.md` marcando Issue #35 como ✅
6. `git add . && git commit -m "feat: responsive tablet layout con toggle del editor (#35)"`
