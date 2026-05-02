# Issue #31 — Landing Page: Pricing / Open Source

**Milestone:** v0.4 — UI/UX Polish
**Branch:** `feat/issue-31-landing-pricing`
**Responsable:** Kiara
**Depende de:** Issue #30 ✅
**Estado:** ⬜ Pendiente

---

## Historia de Usuario

Como usuario interesado, quiero ver una sección clara que confirme que DBCanvas es gratuito y open source para estudiantes.

---

## Criterios de Aceptación

- [ ] Sección de planes con "Plan Estudiante" (Gratis) destacado
- [ ] Link directo al repositorio de GitHub
- [ ] Footer con créditos a Jefferson, Kiara y la UPT

---

## Arquitectura

### Estructura de archivos

```
apps/web/components/landing/
├── PricingSection.tsx   ← NUEVO
└── Footer.tsx           ← NUEVO
```

---

## Patrones y Reglas

### PricingSection.tsx

```tsx
// components/landing/PricingSection.tsx
import { Check, Github } from "lucide-react"

const GITHUB_REPO_URL = "https://github.com/[tu-usuario]/dbcanvas"  // ← actualizar

const planFeatures = [
  "Proyectos ilimitados",
  "Colaboradores ilimitados",
  "Control de versiones (commits)",
  "Exportar a PNG, SVG y Mermaid",
  "Links públicos de solo lectura",
  "Editor Monaco integrado",
  "Soporte para PostgreSQL DDL",
  "100% código abierto",
]

export function PricingSection() {
  return (
    <section className="py-20 px-4 bg-[#0A0F1E]">
      <div className="max-w-4xl mx-auto text-center">

        {/* Header */}
        <p className="text-[#1A6CF6] text-sm font-medium uppercase tracking-wider mb-3">
          Precios
        </p>
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
          Gratis para siempre
        </h2>
        <p className="text-[#9CA3AF] text-lg mb-12 max-w-xl mx-auto">
          DBCanvas es un proyecto open source construido por estudiantes para estudiantes.
          Sin trials. Sin tarjeta de crédito.
        </p>

        {/* Plan card */}
        <div className="max-w-md mx-auto bg-[#111827] border-2 border-[#1A6CF6] rounded-2xl p-8 shadow-xl shadow-[#1A6CF6]/10">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-[#1A6CF6]/10 text-[#1A6CF6] text-xs font-medium px-3 py-1.5 rounded-full mb-6">
            ✦ Plan Estudiante
          </div>

          {/* Precio */}
          <div className="mb-8">
            <span className="text-6xl font-bold text-white">S/ 0</span>
            <span className="text-[#6B7280] text-lg ml-2">/ siempre</span>
          </div>

          {/* Features */}
          <ul className="flex flex-col gap-3 mb-8 text-left">
            {planFeatures.map((feat) => (
              <li key={feat} className="flex items-center gap-3 text-[#9CA3AF] text-sm">
                <Check size={16} className="text-[#10B981] flex-shrink-0" />
                {feat}
              </li>
            ))}
          </ul>

          {/* CTAs */}
          <div className="flex flex-col gap-3">
            <a
              href="/register"
              className="w-full py-3 bg-[#1A6CF6] hover:bg-blue-700 text-white font-medium rounded-lg transition-colors text-center"
            >
              Crear cuenta gratis
            </a>
            <a
              href={GITHUB_REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 bg-transparent border border-[#1E2A45] hover:border-[#1A6CF6] text-[#9CA3AF] hover:text-white font-medium rounded-lg transition-colors text-center flex items-center justify-center gap-2"
            >
              <Github size={16} />
              Contribuir en GitHub
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
```

### Footer.tsx

```tsx
// components/landing/Footer.tsx
import { Github } from "lucide-react"

const GITHUB_REPO_URL = "https://github.com/[tu-usuario]/dbcanvas"  // ← actualizar
const CURRENT_YEAR = new Date().getFullYear()

export function Footer() {
  return (
    <footer className="bg-[#0D1117] border-t border-[#1E2A45] py-10 px-4">
      <div className="max-w-6xl mx-auto">

        {/* Top row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-8">
          {/* Logo / nombre */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#1A6CF6] rounded flex items-center justify-center">
              <span className="text-white text-xs font-bold">DB</span>
            </div>
            <span className="text-white font-semibold">DBCanvas</span>
          </div>

          {/* Links */}
          <nav className="flex items-center gap-6 text-sm text-[#6B7280]">
            <a href="/login" className="hover:text-white transition-colors">Iniciar sesión</a>
            <a href="/register" className="hover:text-white transition-colors">Registrarse</a>
            <a
              href={GITHUB_REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors flex items-center gap-1"
            >
              <Github size={14} />
              GitHub
            </a>
          </nav>
        </div>

        {/* Divider */}
        <div className="border-t border-[#1E2A45] mb-6" />

        {/* Créditos */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#6B7280]">
          <p>
            © {CURRENT_YEAR} DBCanvas — Desarrollado por{" "}
            <span className="text-[#9CA3AF] font-medium">Jefferson</span> y{" "}
            <span className="text-[#9CA3AF] font-medium">Kiara</span>
          </p>
          <p>
            Proyecto académico —{" "}
            <span className="text-[#9CA3AF]">Universidad Privada de Tacna (UPT)</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
```

### Integrar en app/page.tsx

```tsx
// app/page.tsx — versión completa con todas las secciones
import { HeroSection }     from "@/components/landing/HeroSection"
import { FeaturesSection } from "@/components/landing/FeaturesSection"
import { PricingSection }  from "@/components/landing/PricingSection"
import { Footer }          from "@/components/landing/Footer"

export default async function HomePage() {
  // auth condicional (Issue #29)
  return (
    <main className="min-h-screen">
      <HeroSection />
      <FeaturesSection />
      <PricingSection />
      <Footer />
    </main>
  )
}
```

---

## Errores Comunes y Cómo Evitarlos

| Error | Causa | Solución |
|---|---|---|
| `new Date().getFullYear()` da error en build | Se ejecuta en el servidor sin problema, pero si está en un Client Component puede dar mismatch de hidratación | Mover Footer a Server Component (sin `"use client"`) o usar un valor fijo `2026` |
| Link de GitHub abre en la misma pestaña | `<Link>` de Next.js en vez de `<a>` | Usar `<a target="_blank" rel="noopener noreferrer">` para links externos |
| URL del repo `[tu-usuario]` queda sin reemplazar | Placeholder olvidado | Reemplazar ambas ocurrencias de `GITHUB_REPO_URL` con la URL real del repositorio |

---

## Verificación Final

1. Scroll a la sección Pricing → card "Plan Estudiante" visible ✅
2. Clic "Contribuir en GitHub" → abre nueva pestaña con el repo ✅
3. Footer muestra créditos: Jefferson, Kiara, UPT ✅
4. Mobile: secciones se apilan correctamente sin overflow ✅

```bash
pnpm build  # Sin errores
```
