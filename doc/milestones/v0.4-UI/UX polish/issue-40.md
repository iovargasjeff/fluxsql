# Issue #40 — Rediseño Landing Page: Tipografía + Hero + Secciones Modernas

**Milestone:** v0.5 — Auth & UX Redesign  
**Branch:** `feat/issue-40-landing-redesign`  
**Estado:** 🔲 Pendiente  
**Commit esperado:** `feat: landing page rediseño moderno DBCanvas (#40)`

---

## Contexto

La landing page actual (`apps/web/app/page.tsx`) fue construida en el milestone v0.4
con componentes en `components/landing/`. Este issue la rediseña completamente con:
- Tipografía moderna vía `next/font/google` (fix del bug de Times New Roman)
- Nuevo Navbar sticky con blur
- Hero de 2 columnas con diagrama ER simulado
- Sección "¿Cómo funciona?" con step cards
- Sección de características en grid 4 columnas
- Bottom CTA con glow neón

---

## Bug Crítico a Resolver Primero

**Problema:** La app renderiza "Times New Roman" en toda la interfaz.  
**Causa:** No hay fuente configurada en `layout.tsx` ni en `globals.css`.

**Solución — ÚNICA forma correcta para Next.js 15 + Tailwind v4:**

### Paso 1: `apps/web/app/layout.tsx`
```tsx
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// Aplicar en <body>:
<body className={`${inter.variable} font-sans antialiased`}>
```

### Paso 2: `apps/web/app/globals.css`
```css
/* Añadir debajo de @import "tailwindcss" */
@theme {
  --font-sans: var(--font-inter);
}
```

**⚠️ NUNCA:**
- Crear `tailwind.config.ts` (Tailwind v4 no lo usa)
- Usar `<link>` de Google Fonts en el HTML (Next.js 15 lo optimiza con `next/font`)
- Modificar `@custom-variant dark (&:is(.dark *))` que ya existe

---

## Paleta de Colores del Proyecto

| Token | Valor | Uso |
|---|---|---|
| Fondo principal | `#0B1120` | `bg-[#0B1120]` |
| Acento primario | `#1A6CF6` | Botones, links, acentos azul |
| Borde oscuro | `#1E2A45` | Bordes de cards, inputs |
| Card oscura | `#0F1A2E` | Fondos de cards y paneles |
| Glow violeta | `#7C3AED` | Resplandores decorativos |
| Glow violeta claro | `#6D28D9` | Gradientes CTA |

> Usar estos valores exactos — NO `bg-slate-950`, `#2563EB` ni otros valores genéricos.

---

## Archivos a Modificar / Crear

### 1. `apps/web/app/layout.tsx` ← MODIFICAR
- Importar `Inter` de `next/font/google`
- Añadir variable CSS `--font-inter` al `<body>`
- Añadir clases `font-sans antialiased` al `<body>`
- NO tocar `ThemeProvider`, `suppressHydrationWarning`, ni `storageKey`

### 2. `apps/web/app/globals.css` ← MODIFICAR
- Añadir bloque `@theme { --font-sans: var(--font-inter); }` debajo del `@import`
- NO tocar `@custom-variant dark`

### 3. `apps/web/app/page.tsx` ← REEMPLAZAR CONTENIDO
Server Component. Importa los subcomponentes de `components/landing/`.

```tsx
import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import HowItWorks from "@/components/landing/HowItWorks";
import FeaturesSection from "@/components/landing/FeaturesSection";
import BottomCTA from "@/components/landing/BottomCTA";
import Footer from "@/components/landing/Footer";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#0B1120] text-white">
      <Navbar />
      <HeroSection />
      <HowItWorks />
      <FeaturesSection />
      <BottomCTA />
      <Footer />
    </main>
  );
}
```

### 4. `apps/web/components/landing/Navbar.tsx` ← CREAR/REEMPLAZAR
**Server Component** (sin estado — solo links).

Estructura:
sticky top-0 z-50
bg-[#0B1120]/80 backdrop-blur-md
border-b border-[#1E2A45]

- **Izquierda:** ícono `Database` (lucide) en `#1A6CF6` + texto "DBCanvas" en blanco
- **Centro** (`hidden md:flex`): links grises hover blanco:
  "Producto" · "Características" · "Precios" · "Docs"
- **Derecha:**
  - Link "Iniciar sesión" → `/login` (texto gris, hover blanco)
  - Botón "Empezar gratis" → `/register` (`bg-[#1A6CF6] hover:bg-[#1557d4]`)
- **Mobile:** menú hamburguesa con estado → `'use client'` solo si se implementa toggle

> ⚠️ Íconos disponibles en `lucide-react@1.14.0`: `Database`, `Menu`, `X`, `ArrowRight`

### 5. `apps/web/components/landing/HeroSection.tsx` ← REEMPLAZAR
**Server Component.**

Layout: `grid grid-cols-1 lg:grid-cols-2 gap-12` dentro de `max-w-7xl mx-auto px-6 py-24`

**Columna izquierda:**
- Badge pill:
  ```tsx
  <span className="inline-flex items-center gap-2 border border-[#1A6CF6]/50
    bg-[#1A6CF6]/10 text-[#1A6CF6] text-sm px-4 py-1.5 rounded-full">
    ✨ Colaboración en tiempo real
  </span>
  ```
- H1 (`text-5xl lg:text-6xl font-bold leading-tight`):
  "Diseña bases de datos en equipo, "
  `<span className="text-[#1A6CF6]">en segundos</span>`
- Párrafo (`text-slate-400 text-lg mt-4`):
  "Convierte tu SQL en diagramas visuales en tiempo real. Colabora, exporta y optimiza sin instalar nada."
- Botones (`flex gap-4 mt-8`):
  - "Empezar gratis →" → `/register`: `bg-[#1A6CF6] hover:bg-[#1557d4] text-white px-6 py-3 rounded-xl font-semibold`
  - "Ver demo": `border border-[#1E2A45] hover:border-[#1A6CF6] text-white px-6 py-3 rounded-xl`
- Checks (`flex flex-col gap-2 mt-6 text-sm text-slate-400`):
  - `<Check size={14} className="text-[#1A6CF6]" />` + texto para cada uno:
    "Sin tarjeta de crédito" · "Colaboración en tiempo real" · "Compatible con PostgreSQL, MySQL"

**Columna derecha — Diagrama ER simulado:**
Tarjetas oscuras flotantes con glow azul/violeta detrás. Usar SVG inline para las líneas conectoras.

```tsx
// Estructura base de cada tabla simulada:
<div className="bg-[#0F1A2E] border border-[#1E2A45] rounded-xl p-4 shadow-lg
  shadow-[#1A6CF6]/10">
  <div className="flex items-center gap-2 mb-3 text-xs font-mono text-[#1A6CF6]">
    <Database size={12} /> clientes
  </div>
  {/* Filas de campos simulados */}
  <div className="space-y-1.5 text-xs text-slate-400 font-mono">
    <div>🔑 id · uuid</div>
    <div>── nombre · varchar</div>
    <div>── email · varchar</div>
  </div>
</div>
```

Tablas a mostrar: `clientes`, `ventas`, `productos`, `categorias`.
Glow decorativo detrás del diagrama:
```tsx
<div className="absolute inset-0 bg-[#1A6CF6]/5 blur-3xl rounded-full -z-10" />
<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
  w-64 h-64 bg-[#7C3AED]/10 blur-3xl rounded-full -z-10" />
```

### 6. `apps/web/components/landing/HowItWorks.tsx` ← CREAR
**Server Component.**

```tsx
<section className="py-24 px-6">
  <div className="max-w-5xl mx-auto">
    <h2 className="text-3xl font-bold text-center mb-4">¿Cómo funciona?</h2>
    <p className="text-slate-400 text-center mb-16">
      Tres pasos para pasar de SQL a diagrama visual
    </p>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Step cards */}
    </div>
  </div>
</section>
```

Step cards (`bg-[#0F1A2E] border border-[#1E2A45] rounded-2xl p-6`):

| # | Título | Ícono lucide | Descripción |
|---|---|---|---|
| 1 | Pega tu SQL | `Code2` | Escribe o pega tu DDL en el editor Monaco integrado |
| 2 | Visualiza el diagrama | `Network` | El canvas genera automáticamente el diagrama ER con React Flow |
| 3 | Colabora en tiempo real | `Users` | Comparte el enlace y edita con tu equipo simultáneamente |

Número de paso con estilo:
```tsx
<span className="text-4xl font-bold text-[#1A6CF6]/20">0{n}</span>
```

### 7. `apps/web/components/landing/FeaturesSection.tsx` ← REEMPLAZAR
**Server Component.** Ya existe — reemplazar contenido.

Grid: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6`

| Feature | Ícono | Descripción breve |
|---|---|---|
| Tiempo real | `Zap` | Cambios reflejados instantáneamente en el canvas |
| Autolayout inteligente | `Network` | Organización automática de nodos y relaciones |
| Relaciones automáticas | `Link2` | Detecta FKs y dibuja flechas automáticamente |
| Exportación fácil | `Share2` | Exporta como PNG, SVG o comparte enlace público |

Card style:
```tsx
bg-[#0F1A2E] border border-[#1E2A45] rounded-2xl p-6
hover:border-[#1A6CF6]/50 transition-colors duration-200
```

Ícono en círculo: `bg-[#1A6CF6]/10 text-[#1A6CF6] p-3 rounded-xl w-fit`

### 8. `apps/web/components/landing/BottomCTA.tsx` ← CREAR
**Server Component.**

```tsx
<section className="py-24 px-6">
  <div className="max-w-4xl mx-auto relative overflow-hidden
    bg-[#0F1A2E] border border-[#1E2A45] rounded-3xl p-16 text-center">
    
    {/* Glow decorativo */}
    <div className="absolute -top-20 -left-20 w-64 h-64
      bg-[#1A6CF6]/15 blur-3xl rounded-full" />
    <div className="absolute -bottom-20 -right-20 w-64 h-64
      bg-[#7C3AED]/15 blur-3xl rounded-full" />
    
    <h2 className="relative text-4xl font-bold mb-4">
      Empieza a diseñar tu base de datos ahora
    </h2>
    <p className="relative text-slate-400 text-lg mb-8">
      Únete a cientos de equipos que ya diseñan mejor.
    </p>
    <a href="/register"
      className="relative inline-flex items-center gap-2
        bg-[#1A6CF6] hover:bg-[#1557d4] text-white
        px-8 py-4 rounded-xl font-semibold text-lg transition-colors">
      Crear cuenta gratis <ArrowRight size={20} />
    </a>
  </div>
</section>
```

### 9. `apps/web/components/landing/Footer.tsx` ← MANTENER/AJUSTAR
Ya existe con créditos UPT. Ajustar solo si el texto de copyright está incorrecto.
Texto esperado: `© 2026 DBCanvas — Universidad Privada de Tacna. Todos los derechos reservados.`

---

## Reglas Críticas

1. Leer `.ia/AGENT.md` y `.ia/PROGRESS.md` antes de escribir código
2. `pnpm build` debe pasar sin errores — ejecutar y corregir     antes del commit
3. **NUNCA tocar:** `proxy.ts`, `middleware.ts`, `@custom-variant dark` en globals.css
4. **NO crear** `tailwind.config.ts` — Tailwind v4 usa solo `globals.css`
5. Componentes con `useState`, `useEffect`, `localStorage`, `window` → `'use client'` + patrón `mounted`
6. Si el Navbar mobile necesita toggle → extraer solo ese botón a `NavbarMobileToggle.tsx` con `'use client'`; el resto del Navbar permanece como Server Component
7. Actualizar `.ia/PROGRESS.md` marcando issue #40 como ✅

---

## Verificación Final

```bash
pnpm build --filter web   # ✅ Sin errores
# Verificar en navegador:
# - Fuente Inter/sans-serif aplicada (no Times New Roman)
# - Dark mode activo por defecto
# - Responsive: hero colapsa a 1 columna en mobile
# - Navbar sticky funcional
# - Links /login y /register funcionan
```

---

## Decisiones de Diseño

| Decisión | Justificación |
|---|---|
| `next/font/google` + `@theme {}` | Única forma correcta en Next.js 15 + Tailwind v4 sin `tailwind.config.ts` |
| Diagrama ER con HTML/SVG inline | Sin dependencias extra; reutiliza estilo de `AnimatedCanvas.tsx` existente |
| Navbar como Server Component + cliente solo para toggle | Mínimo JS enviado al cliente |
| Componentes en `components/landing/` | Consistencia con estructura actual del proyecto (v0.4) |
| Glow con `blur-3xl` de Tailwind | Sin librerías extra; efecto nativo CSS |
```