# Issue #30 — Landing Page: Sección Features

**Milestone:** v0.4 — UI/UX Polish
**Branch:** `feat/issue-30-landing-features`
**Responsable:** Kiara
**Depende de:** Issue #29 ✅
**Estado:** ⬜ Pendiente

---

## Historia de Usuario

Como estudiante buscando herramientas, quiero leer las features principales para confirmar que DBCanvas sirve para mis tareas de Base de Datos.

---

## Criterios de Aceptación

- [ ] Grid de 4-6 Cards debajo del Hero
- [ ] Cada card: icono Lucide, título, descripción
- [ ] Responsive: 1 col móvil, 2 tablet, 3-4 desktop

---

## Arquitectura

### Estructura de archivos

```
apps/web/components/landing/
└── FeaturesSection.tsx   ← NUEVO
```

---

## Patrones y Reglas

### FeaturesSection.tsx

```tsx
// components/landing/FeaturesSection.tsx
import {
  Code2, Users, GitBranch, Share2,
  Zap, FileCode
} from "lucide-react"

const features = [
  {
    icon: Code2,
    title: "SQL → Diagrama al instante",
    description: "Pega cualquier CREATE TABLE y el canvas genera el diagrama ER en tiempo real. Sin configuración extra.",
    color: "#1A6CF6",
  },
  {
    icon: Users,
    title: "Colaboración en tiempo real",
    description: "Invita a tu equipo y trabajen juntos en el mismo diagrama. Ven los cursores y cambios al instante.",
    color: "#10B981",
  },
  {
    icon: GitBranch,
    title: "Control de versiones",
    description: "Guarda snapshots con un mensaje (commit) y restaura el estado anterior si algo sale mal.",
    color: "#8B5CF6",
  },
  {
    icon: Share2,
    title: "Compartir sin registro",
    description: "Genera un link público de solo lectura para que tu profesor pueda ver el esquema sin crear cuenta.",
    color: "#F59E0B",
  },
  {
    icon: FileCode,
    title: "Exportar a Mermaid",
    description: "Copia la sintaxis erDiagram con un clic y pégala en tu README.md para documentación viva en GitHub.",
    color: "#EF4444",
  },
  {
    icon: Zap,
    title: "Monaco Editor integrado",
    description: "El mismo editor de VS Code en el browser, con resaltado SQL, autocompletado y detección de errores.",
    color: "#06B6D4",
  },
]

export function FeaturesSection() {
  return (
    <section className="py-20 px-4 bg-[#0D1117]">
      <div className="max-w-6xl mx-auto">

        {/* Header de sección */}
        <div className="text-center mb-16">
          <p className="text-[#1A6CF6] text-sm font-medium uppercase tracking-wider mb-3">
            Todo lo que necesitas
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Diseñado para estudiantes de bases de datos
          </h2>
          <p className="text-[#9CA3AF] text-lg max-w-2xl mx-auto">
            Cada feature fue pensada para el flujo de trabajo real de un curso universitario de BD.
          </p>
        </div>

        {/* Grid de features */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </div>
    </section>
  )
}

function FeatureCard({
  icon: Icon,
  title,
  description,
  color,
}: {
  icon: React.ElementType
  title: string
  description: string
  color: string
}) {
  return (
    <div className="group p-6 bg-[#111827] rounded-xl border border-[#1E2A45] hover:border-[#2A3A55] transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/20">
      {/* Icono */}
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
        style={{ backgroundColor: color + '20' }}
      >
        <Icon size={20} style={{ color }} />
      </div>

      {/* Texto */}
      <h3 className="text-white font-semibold mb-2 text-base leading-snug">
        {title}
      </h3>
      <p className="text-[#6B7280] text-sm leading-relaxed">
        {description}
      </p>
    </div>
  )
}
```

### Integrar en app/page.tsx junto al HeroSection

```tsx
// app/page.tsx (después de HeroSection)
import { HeroSection } from "@/components/landing/HeroSection"
import { FeaturesSection } from "@/components/landing/FeaturesSection"

export default async function HomePage() {
  // ... lógica de auth condicional (Issue #29)
  return (
    <main>
      <HeroSection />
      <FeaturesSection />
      {/* Aquí irá PricingSection (Issue #31) */}
    </main>
  )
}
```

---

## Errores Comunes y Cómo Evitarlos

| Error | Causa | Solución |
|---|---|---|
| Hover `-translate-y-1` no funciona | Tailwind JIT no genera la clase | Añadir `hover:-translate-y-1` en safelist o usarla directamente en el markup |
| Lucide icons no se importan | `lucide-react` no instalado | `pnpm add lucide-react --filter web` (generalmente ya está en proyectos shadcn) |
| Grid se desborda en móvil | Cards con `min-width` fija | No usar ancho fijo en las cards — dejar que el grid 100% las controle |

---

## Verificación Final

1. Scroll debajo del Hero → sección Features aparece ✅
2. En móvil (375px) → 1 columna ✅
3. En tablet (768px) → 2 columnas ✅
4. En desktop (1280px) → 3 columnas ✅
5. Hover en card → levanta suavemente con sombra ✅

```bash
pnpm build  # Sin errores
```
