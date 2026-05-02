# Issue #37 — Animaciones y Micro-interacciones

**Milestone:** v0.4 — UI/UX Polish
**Branch:** `feat/issue-37-framer-motion`
**Responsable:** Jefferson
**Estado:** ⬜ Pendiente

---

## Historia de Usuario

Como usuario, quiero que los modales y transiciones se sientan fluidos y profesionales.

---

## Criterios de Aceptación

- [ ] Modales con animación de entrada/salida (scale + fade)
- [ ] Transición fade entre Dashboard y Editor
- [ ] Cursores en tiempo real con interpolación suave (ya implementados en Issue #20)

---

## Arquitectura

### Instalación

```bash
pnpm add framer-motion --filter web
```

### Verificar cuáles modales existen

```bash
grep -r "Dialog\|Modal\|Sheet" apps/web/components --include="*.tsx" -l
```

Los más importantes: `CommitModal.tsx`, `InviteCollaboratorModal.tsx`, `VersionHistorySheet.tsx`

---

## Patrones y Reglas

### Patrón de modal animado

```tsx
// Reemplazar los Dialog/Sheet de shadcn con versiones animadas
// O añadir motion.div alrededor del DialogContent

'use client'
import { motion, AnimatePresence } from 'framer-motion'

// Wrapper para cualquier modal:
const modalVariants = {
  hidden:  { opacity: 0, scale: 0.95, y: -8 },
  visible: { opacity: 1, scale: 1,    y: 0,
             transition: { type: 'spring', stiffness: 300, damping: 30 } },
  exit:    { opacity: 0, scale: 0.95, y: -8,
             transition: { duration: 0.15 } },
}

// Uso dentro del modal existente:
<AnimatePresence>
  {open && (
    <motion.div
      variants={modalVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {/* Contenido del modal */}
    </motion.div>
  )}
</AnimatePresence>
```

### Transición de página (layout.tsx)

```tsx
// app/(protected)/layout.tsx o un wrapper de página
'use client'
import { motion } from 'framer-motion'

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  )
}
```

### Cursores en tiempo real — interpolación suave

```tsx
// En CollaboratorCursors.tsx (ya existe) — añadir spring physics
// Reemplazar posicionamiento estático por motion.div:
import { motion } from 'framer-motion'

// En lugar de:
<div style={{ left: cursor.x, top: cursor.y }}>

// Usar:
<motion.div
  animate={{ x: cursor.x, y: cursor.y }}
  transition={{ type: 'spring', stiffness: 500, damping: 40, mass: 0.5 }}
  style={{ position: 'absolute', pointerEvents: 'none' }}
>
  {/* ícono del cursor */}
</motion.div>
```

---

## Errores Comunes y Cómo Evitarlos

| Error | Causa | Solución |
|---|---|---|
| `AnimatePresence` no anima la salida | El children no tiene key única | Siempre añadir `key` al hijo directo de AnimatePresence |
| Framer Motion aumenta mucho el bundle | Se importa todo | Usar `import { motion } from 'framer-motion'` (tree-shakeable) |
| Animación de cursores lag visible | `stiffness` muy bajo | Usar stiffness: 500+ para cursores en tiempo real |
| Layout shift al animar modales | `scale` afecta al layout | Usar `transform-origin: center` en el contenedor |

---

## Verificación Final

```bash
pnpm build  # Sin errores
```

1. Abrir CommitModal → aparece con scale + fade ✅
2. Cerrar → desaparece suavemente ✅
3. Navegar Dashboard → Editor → fade entre páginas ✅
4. Colaborador mueve cursor → movimiento interpolado, no "teletransporte" ✅
5. Actualizar `.ia/PROGRESS.md` marcando Issue #37 como ✅
6. `git add . && git commit -m "feat: animaciones y micro-interacciones con framer-motion (#37)"`
