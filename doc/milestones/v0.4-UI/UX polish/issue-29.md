# Issue #29 — Landing Page: Hero Section con Demo Animada

**Milestone:** v0.4 — UI/UX Polish
**Branch:** `feat/issue-29-landing-hero`
**Responsable:** Kiara
**Estado:** ⬜ Pendiente

---

## Historia de Usuario

Como visitante nuevo, quiero una Landing Page impactante con animación que muestre el valor de DBCanvas de un vistazo.

---

## Criterios de Aceptación

- [ ] `app/page.tsx` con diseño moderno (TailwindCSS)
- [ ] Hero con H1, subtítulo, botón "Empezar gratis" y "Ver en GitHub"
- [ ] Animación CSS o video corto mostrando la creación de un diagrama
- [ ] Redirección a `/register` desde "Empezar gratis"

---

## Arquitectura

### Importante: este es un Server Component público

`app/page.tsx` es la raíz del sitio — **no necesita auth**. Si actualmente redirige a `/dashboard` o `/login`, hay que cambiar la lógica para mostrar la landing a usuarios no autenticados y redirigir al dashboard solo si ya tienen sesión.

```typescript
// app/page.tsx — verificar patrón actual
// Si existe: import { redirect } from 'next/navigation' + redirect('/dashboard')
// Cambiar por lógica condicional:
const { data: { user } } = await supabase.auth.getUser()
if (user) redirect('/dashboard')
// Si no hay sesión → renderizar la landing
```

### Estructura de archivos

```
apps/web/
└── components/landing/
    ├── HeroSection.tsx    ← NUEVO
    ├── AnimatedCanvas.tsx ← NUEVO — demo CSS animada
    └── Navbar.tsx         ← NUEVO — nav de la landing
```

---

## Patrones y Reglas

### HeroSection.tsx — estructura y copy

```tsx
// components/landing/HeroSection.tsx
import Link from "next/link"
import { AnimatedCanvas } from "./AnimatedCanvas"

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden bg-[#0A0F1E]">
      {/* Fondo radial sutil */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(26,108,246,0.15), transparent)'
        }}
      />

      <div className="relative z-10 max-w-5xl w-full mx-auto flex flex-col lg:flex-row items-center gap-12 py-20">

        {/* Texto */}
        <div className="flex-1 flex flex-col gap-6 text-center lg:text-left">
          <span className="inline-flex items-center self-center lg:self-start gap-2 bg-[#1E2A45] text-[#1A6CF6] text-xs px-3 py-1.5 rounded-full border border-[#1A6CF6]/20">
            ✦ Colaboración en tiempo real
          </span>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
            Diseña tu base de datos
            <span className="block text-[#1A6CF6]">en equipo, en segundos</span>
          </h1>

          <p className="text-[#9CA3AF] text-lg max-w-lg mx-auto lg:mx-0 leading-relaxed">
            Pega tu SQL, visualiza el diagrama ER al instante y colabora con tu equipo en tiempo real.
            Sin instalaciones. Sin fricciones.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
            <Link
              href="/register"
              className="px-6 py-3 bg-[#1A6CF6] hover:bg-blue-700 text-white font-medium rounded-lg transition-colors text-center"
            >
              Empezar gratis →
            </Link>
            <a
              href="https://github.com/[tu-usuario]/dbcanvas"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-transparent border border-[#1E2A45] hover:border-[#1A6CF6] text-[#9CA3AF] hover:text-white font-medium rounded-lg transition-colors text-center"
            >
              Ver en GitHub
            </a>
          </div>
        </div>

        {/* Demo animada */}
        <div className="flex-1 w-full max-w-lg">
          <AnimatedCanvas />
        </div>
      </div>
    </section>
  )
}
```

### AnimatedCanvas.tsx — demo CSS pura (sin JS)

```tsx
// components/landing/AnimatedCanvas.tsx
// Demo visual estática + animación CSS que simula un diagrama ER siendo creado

export function AnimatedCanvas() {
  return (
    <div className="relative w-full aspect-video rounded-xl border border-[#1E2A45] bg-[#111827] overflow-hidden shadow-2xl">

      {/* Grid de fondo — simula el canvas */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(circle, #1E2A45 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Nodo users — aparece con animación */}
      <div className="absolute top-8 left-8 animate-[fadeSlideIn_0.6s_ease_0.3s_both]">
        <NodeCard title="users" columns={['id: UUID PK', 'email: TEXT', 'name: TEXT']} color="#1A6CF6" />
      </div>

      {/* Nodo projects — aparece después */}
      <div className="absolute top-8 right-8 animate-[fadeSlideIn_0.6s_ease_0.8s_both]">
        <NodeCard title="projects" columns={['id: UUID PK', 'owner_id: UUID FK', 'name: TEXT']} color="#10B981" />
      </div>

      {/* Edge SVG — aparece al final */}
      <svg className="absolute inset-0 w-full h-full animate-[fadeIn_0.4s_ease_1.4s_both] opacity-0" style={{ '--tw-opacity': 1 } as React.CSSProperties}>
        <defs>
          <marker id="arrowhead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill="#1A6CF6" opacity="0.7" />
          </marker>
        </defs>
        <path
          d="M 180 70 C 260 70, 260 70, 320 70"
          stroke="#1A6CF6"
          strokeWidth="1.5"
          fill="none"
          strokeDasharray="4 3"
          opacity="0.7"
          markerEnd="url(#arrowhead)"
        />
      </svg>

      {/* Etiqueta "Generado desde SQL" */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-xs text-[#6B7280] bg-[#0A0F1E]/80 px-3 py-1 rounded-full border border-[#1E2A45]">
        Generado desde SQL en tiempo real
      </div>
    </div>
  )
}

function NodeCard({ title, columns, color }: { title: string; columns: string[]; color: string }) {
  return (
    <div className="bg-[#0A0F1E] border rounded-lg overflow-hidden shadow-lg min-w-[140px]" style={{ borderColor: color + '40' }}>
      <div className="px-3 py-1.5 text-xs font-bold text-white border-b" style={{ backgroundColor: color + '20', borderColor: color + '40' }}>
        {title}
      </div>
      <div className="px-3 py-2 flex flex-col gap-1">
        {columns.map((col, i) => (
          <span key={i} className="text-[10px] text-[#9CA3AF] font-mono">{col}</span>
        ))}
      </div>
    </div>
  )
}
```

### Añadir keyframes en globals.css o tailwind.config.ts

```css
/* En globals.css o <style> en el componente */
@keyframes fadeSlideIn {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 0.7; }
}
```

O en `tailwind.config.ts`:
```typescript
theme: {
  extend: {
    keyframes: {
      fadeSlideIn: {
        from: { opacity: '0', transform: 'translateY(10px)' },
        to:   { opacity: '1', transform: 'translateY(0)' },
      },
      fadeIn: {
        from: { opacity: '0' },
        to:   { opacity: '0.7' },
      },
    },
    animation: {
      'fade-slide-in': 'fadeSlideIn 0.6s ease both',
      'fade-in': 'fadeIn 0.4s ease both',
    },
  }
}
```

---

## Errores Comunes y Cómo Evitarlos

| Error | Causa | Solución |
|---|---|---|
| Landing redirige a `/login` en lugar de mostrarse | `app/page.tsx` tiene redirect incondicional | Añadir condicional: solo redirigir si `user` existe |
| Animación no funciona en producción | `animate-[...]` es Tailwind JIT y puede no estar habilitado | Configurar keyframes en `tailwind.config.ts` y usar clases estáticas |
| "Ver en GitHub" navega sin abrir nueva pestaña | `<Link>` de Next.js en lugar de `<a>` | Usar `<a target="_blank">` para links externos |

---

## Verificación Final

1. `http://localhost:3000` sin sesión → Landing aparece ✅
2. Animación de nodos carga en bucle suave ✅
3. "Empezar gratis" → redirige a `/register` ✅
4. Usuario con sesión → redirige a `/dashboard` ✅

```bash
pnpm build  # Sin errores
```
