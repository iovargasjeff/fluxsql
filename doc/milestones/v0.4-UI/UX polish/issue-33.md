# Issue #33 — Tema Oscuro / Claro (Dark Mode)

**Milestone:** v0.4 — UI/UX Polish
**Branch:** `feat/issue-33-dark-mode`
**Responsable:** Jefferson (Kiara no disponible)
**Estado:** ⬜ Pendiente

---

## Historia de Usuario

Como desarrollador que trabaja de noche, quiero cambiar la interfaz al modo oscuro para reducir la fatiga visual.

---

## Criterios de Aceptación

- [ ] `next-themes` integrado con `ThemeProvider` en el layout raíz
- [ ] Toggle de tema (Sol/Luna) visible en la navbar del editor y del dashboard
- [ ] Preferencia guardada en localStorage automáticamente (next-themes lo hace solo)
- [ ] Monaco Editor cambia entre tema `vs-dark` y `vs-light`
- [ ] React Flow cambia el color de fondo del canvas

---

## Contexto importante

El proyecto usa **Tailwind v4** con `@import "tailwindcss"` en globals.css — NO hay tailwind.config.ts.
En Tailwind v4 el dark mode con clase se activa añadiendo en globals.css:
```css
@variant dark (&:where(.dark, .dark *));
```

---

## Arquitectura

### Instalación

```bash
pnpm add next-themes --filter web
```

### Estructura de archivos

```
apps/web/
├── components/
│   └── ThemeToggle.tsx          ← NUEVO
└── app/
    └── layout.tsx               ← MODIFICAR — añadir ThemeProvider
```

---

## Patrones y Reglas

### 1. Añadir ThemeProvider en app/layout.tsx

```tsx
// app/layout.tsx
import { ThemeProvider } from 'next-themes'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          storageKey="dbcanvas-theme"
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

> **Crítico:** `suppressHydrationWarning` en `<html>` es obligatorio con next-themes.

### 2. Activar dark mode en globals.css (Tailwind v4)

```css
/* globals.css — añadir después de @import "tailwindcss" */
@variant dark (&:where(.dark, .dark *));
```

### 3. components/ThemeToggle.tsx ("use client")

```tsx
'use client'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  // Evitar hydration mismatch — solo renderizar en el cliente
  useEffect(() => { setMounted(true) }, [])
  if (!mounted) return <div className="w-8 h-8" />  // placeholder del mismo tamaño

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="p-2 rounded-lg text-[#6B7280] hover:text-white hover:bg-[#1E2A45] transition-colors"
      aria-label="Cambiar tema"
      title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
    >
      {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  )
}
```

### 4. Añadir ThemeToggle en la toolbar del editor

```tsx
// components/editor/EditorToolbar.tsx
import { ThemeToggle } from '@/components/ThemeToggle'

// Añadir en el JSX de la toolbar, al final de los botones:
<ThemeToggle />
```

### 5. Monaco Editor — cambiar tema según darkMode

```tsx
// En el componente que renderiza Monaco (buscar MonacoEditor o similar)
// Debe ser "use client"
import { useTheme } from 'next-themes'

// Dentro del componente:
const { theme } = useTheme()

// En el <Editor> de @monaco-editor/react:
<Editor
  theme={theme === 'dark' ? 'vs-dark' : 'vs-light'}
  // ... resto de props
/>
```

### 6. React Flow — cambiar background según tema

```tsx
// En Canvas.tsx o el componente que tiene <Background />
import { useTheme } from 'next-themes'

const { theme } = useTheme()

// En el JSX:
<Background
  color={theme === 'dark' ? '#1E2A45' : '#E5E7EB'}
  gap={24}
  size={1}
/>
// Y el wrapper del ReactFlow:
<div className="w-full h-full bg-[#0A0F1E] dark:bg-[#0A0F1E] light:bg-gray-50">
```

---

## Errores Comunes y Cómo Evitarlos

| Error | Causa | Solución |
|---|---|---|
| Flash de tema incorrecto al cargar | `<html>` sin `suppressHydrationWarning` | Siempre añadir `suppressHydrationWarning` en el html tag |
| `useTheme` devuelve `undefined` | Componente fuera del `ThemeProvider` | Verificar que `ThemeProvider` está en el layout raíz |
| `ThemeToggle` causa hydration mismatch | Renderiza icon diferente en server vs client | Patrón `mounted` con `useEffect` es obligatorio |
| Dark mode no aplica a las clases `dark:` | Tailwind v4 sin `@variant dark` | Añadir `@variant dark (&:where(.dark, .dark *))` en globals.css |
| Monaco no cambia de tema | `theme` prop no reactiva | Usar `useTheme()` dentro del Client Component de Monaco |

---

## Verificación Final

```bash
pnpm build  # Sin errores
```

1. Abrir el editor → ícono Luna/Sol visible en toolbar ✅
2. Clic → interfaz cambia de oscuro a claro ✅
3. Recargar página → tema persiste ✅
4. Monaco cambia entre `vs-dark` y `vs-light` ✅
5. Actualizar `.ia/PROGRESS.md` marcando Issue #33 como ✅
6. `git add . && git commit -m "feat: dark/light mode con next-themes (#33)"`
