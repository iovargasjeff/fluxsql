# Issue #36 — Onboarding: Tutorial Primera Vez en el Editor

**Milestone:** v0.4 — UI/UX Polish
**Branch:** `feat/issue-36-onboarding-tour`
**Responsable:** Jefferson
**Estado:** ⬜ Pendiente

---

## Historia de Usuario

Como usuario nuevo, quiero un tutorial de 3 pasos para entender el editor sin sentirme perdido.

---

## Criterios de Aceptación

- [ ] Tour de 3 pasos: SQL → Canvas → Toolbar
- [ ] `has_seen_tutorial` en localStorage para no repetirlo
- [ ] Overlay oscuro detrás con el popover destacando el elemento

---

## Arquitectura

### Opción recomendada: Popovers encadenados sin librería externa

Evitar `react-joyride` para no añadir dependencias pesadas. Implementar con state simple + popovers de shadcn.

### Instalación shadcn Popover (si no existe)

```bash
ls apps/web/components/ui/popover.tsx
# Si no existe:
pnpm dlx shadcn@latest add popover --cwd apps/web -y
```

### components/editor/OnboardingTour.tsx ("use client")

```tsx
'use client'
import { useState, useEffect } from 'react'
import { X, ArrowRight } from 'lucide-react'

const STORAGE_KEY = 'dbcanvas_has_seen_tutorial'

const STEPS = [
  {
    title: '1. Pega tu SQL aquí',
    description: 'Escribe o pega cualquier CREATE TABLE en este editor. El diagrama se genera automáticamente.',
    position: 'right' as const,
    targetId: 'monaco-panel',
  },
  {
    title: '2. Tu diagrama aparece aquí',
    description: 'Cada tabla SQL se convierte en un nodo. Las llaves foráneas crean conexiones automáticamente.',
    position: 'left' as const,
    targetId: 'canvas-panel',
  },
  {
    title: '3. Usa la barra de herramientas',
    description: 'Guarda versiones con Commit, comparte con un link público o exporta como PNG.',
    position: 'bottom' as const,
    targetId: 'editor-toolbar',
  },
]

export function OnboardingTour() {
  const [step, setStep] = useState(0)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const seen = localStorage.getItem(STORAGE_KEY)
    if (!seen) {
      // Pequeño delay para que el editor cargue primero
      const timer = setTimeout(() => setVisible(true), 1000)
      return () => clearTimeout(timer)
    }
  }, [])

  function handleNext() {
    if (step < STEPS.length - 1) {
      setStep(prev => prev + 1)
    } else {
      handleClose()
    }
  }

  function handleClose() {
    localStorage.setItem(STORAGE_KEY, 'true')
    setVisible(false)
  }

  if (!visible) return null

  const current = STEPS[step]

  return (
    <>
      {/* Overlay oscuro */}
      <div
        className="fixed inset-0 bg-black/60 z-40 pointer-events-none"
        style={{ backdropFilter: 'blur(1px)' }}
      />

      {/* Popover central (simplificado — no anclado al elemento) */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-[#111827] border border-[#1A6CF6]/40 rounded-xl p-6 max-w-sm w-full shadow-2xl pointer-events-auto">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-white font-semibold text-base">{current.title}</h3>
            <button
              onClick={handleClose}
              className="text-[#6B7280] hover:text-white transition-colors ml-2 flex-shrink-0"
            >
              <X size={16} />
            </button>
          </div>

          {/* Descripción */}
          <p className="text-[#9CA3AF] text-sm leading-relaxed mb-6">
            {current.description}
          </p>

          {/* Footer — progreso + botón */}
          <div className="flex items-center justify-between">
            {/* Dots de progreso */}
            <div className="flex gap-1.5">
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full transition-colors"
                  style={{ backgroundColor: i === step ? '#1A6CF6' : '#1E2A45' }}
                />
              ))}
            </div>

            {/* Botón siguiente */}
            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#1A6CF6] hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {step < STEPS.length - 1 ? (
                <>Siguiente <ArrowRight size={14} /></>
              ) : (
                '¡Entendido!'
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
```

### Añadir IDs en los elementos target (para referencia futura)

```tsx
// En EditorLayout.tsx — añadir ids a los paneles:
<div id="editor-toolbar">  ← barra superior
<div id="monaco-panel">    ← panel izquierdo del editor SQL
<div id="canvas-panel">    ← panel derecho del canvas
```

### Integrar en EditorLayout.tsx

```tsx
import { OnboardingTour } from '@/components/editor/OnboardingTour'

// Dentro del JSX (dentro del ReactFlowProvider):
<OnboardingTour />
```

---

## Errores Comunes y Cómo Evitarlos

| Error | Causa | Solución |
|---|---|---|
| Tour aparece en cada recarga | `localStorage.setItem` no se llama | Verificar que `handleClose` guarda el key correctamente |
| Overlay bloquea los clicks del tour | `pointer-events-none` en el overlay pero no en el popover | Overlay: `pointer-events-none`, Popover: `pointer-events-auto` |
| `localStorage` falla en SSR | Next.js renderiza en el servidor | Acceder a `localStorage` solo dentro de `useEffect` |

---

## Verificación Final

```bash
pnpm build  # Sin errores
```

1. Abrir editor por primera vez (localStorage limpio) → tour aparece ✅
2. Navegar 3 pasos → "¡Entendido!" cierra el tour ✅
3. Recargar → tour NO aparece de nuevo ✅
4. DevTools → Application → localStorage → `dbcanvas_has_seen_tutorial: true` ✅
5. Actualizar `.ia/PROGRESS.md` marcando Issue #36 como ✅
6. `git add . && git commit -m "feat: onboarding tour primera vez en el editor (#36)"`
