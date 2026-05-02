# Issue #32 — Dashboard: Grid de Proyectos con Preview

**Milestone:** v0.4 — UI/UX Polish
**Branch:** `feat/issue-32-dashboard-grid`
**Responsable:** Kiara
**Depende de:** Issue #5 ✅ (listar proyectos)
**Estado:** ⬜ Pendiente

---

## Historia de Usuario

Como usuario autenticado, quiero que mis proyectos se muestren como tarjetas visuales con rol y fecha de modificación para identificarlos rápidamente.

---

## Criterios de Aceptación

- [ ] Vista en grid (no lista) de proyectos
- [ ] Cada card: miniatura/fondo abstracto, nombre, rol (Propietario/Editor), fecha de modificación
- [ ] Efecto hover que "levanta" la tarjeta

---

## Arquitectura

### Estructura de archivos

```
apps/web/components/dashboard/
├── ProjectGrid.tsx     ← NUEVO (reemplaza o envuelve la lista actual)
└── ProjectCard.tsx     ← MODIFICAR (ya existe de Issue #19)
```

---

## Patrones y Reglas

### ProjectGrid.tsx — contenedor del grid

```tsx
// components/dashboard/ProjectGrid.tsx
import { ProjectCard } from "./ProjectCard"
import type { ProjectWithRole } from "@/types"

interface Props {
  projects: ProjectWithRole[]
  currentUserId: string
}

export function ProjectGrid({ projects, currentUserId }: Props) {
  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="text-5xl mb-4">🗂️</div>
        <h3 className="text-white font-semibold mb-2">No tienes proyectos aún</h3>
        <p className="text-[#6B7280] text-sm max-w-xs">
          Crea tu primer diagrama haciendo clic en "Nuevo proyecto"
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          isOwner={project.ownerId === currentUserId}
        />
      ))}
    </div>
  )
}
```

### ProjectCard.tsx — versión visual mejorada

```tsx
// components/dashboard/ProjectCard.tsx — REEMPLAZAR versión anterior
"use client"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { Crown, Edit3, MoreVertical } from "lucide-react"
import { InviteCollaboratorModal } from "./InviteCollaboratorModal"
import type { ProjectWithRole } from "@/types"

// Paleta de gradientes abstractos para miniaturas — basada en el ID del proyecto
const CARD_GRADIENTS = [
  "from-[#1A6CF6]/20 via-[#0A0F1E] to-[#7C3AED]/20",
  "from-[#10B981]/20 via-[#0A0F1E] to-[#1A6CF6]/20",
  "from-[#F59E0B]/20 via-[#0A0F1E] to-[#EF4444]/20",
  "from-[#8B5CF6]/20 via-[#0A0F1E] to-[#06B6D4]/20",
  "from-[#EF4444]/20 via-[#0A0F1E] to-[#F59E0B]/20",
  "from-[#06B6D4]/20 via-[#0A0F1E] to-[#10B981]/20",
]

function getGradient(id: string): string {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i)
    hash |= 0
  }
  return CARD_GRADIENTS[Math.abs(hash) % CARD_GRADIENTS.length]
}

interface Props {
  project: ProjectWithRole
  isOwner: boolean
}

export function ProjectCard({ project, isOwner }: Props) {
  const gradient = getGradient(project.id)
  const relativeDate = formatDistanceToNow(new Date(project.updatedAt ?? project.createdAt), {
    addSuffix: true,
    locale: es,
  })

  return (
    <div className="group relative bg-[#111827] border border-[#1E2A45] rounded-xl overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/30 hover:border-[#2A3A55]">

      {/* Miniatura abstracta — gradiente único por proyecto */}
      <Link href={`/editor/${project.id}`} className="block">
        <div className={`h-28 bg-gradient-to-br ${gradient} relative overflow-hidden`}>
          {/* Patrón de puntos de fondo */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
              backgroundSize: '16px 16px',
            }}
          />
          {/* Símbolo decorativo central */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl opacity-20 select-none">⬡</span>
          </div>
        </div>
      </Link>

      {/* Contenido de la card */}
      <div className="p-4">
        {/* Nombre + menú */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <Link
            href={`/editor/${project.id}`}
            className="text-white font-medium text-sm leading-snug hover:text-[#1A6CF6] transition-colors line-clamp-2 flex-1"
          >
            {project.name}
          </Link>

          {/* Menú de opciones (solo para owners) */}
          {isOwner && (
            <div
              onClick={(e) => { e.preventDefault(); e.stopPropagation() }}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <InviteCollaboratorModal projectId={project.id} />
            </div>
          )}
        </div>

        {/* Badge de rol + fecha */}
        <div className="flex items-center justify-between mt-3">
          <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
            isOwner
              ? 'bg-[#1A6CF6]/10 text-[#1A6CF6]'
              : 'bg-[#6B7280]/10 text-[#6B7280]'
          }`}>
            {isOwner ? <Crown size={10} /> : <Edit3 size={10} />}
            {isOwner ? 'Propietario' : 'Editor'}
          </span>

          <span className="text-[#6B7280] text-xs">
            {relativeDate}
          </span>
        </div>
      </div>
    </div>
  )
}
```

### Reemplazar la lista actual en dashboard/page.tsx

```tsx
// app/(protected)/dashboard/page.tsx — actualizar renderizado
// Reemplazar: <ProjectList projects={...} /> o similar
// Por:
import { ProjectGrid } from "@/components/dashboard/ProjectGrid"

// En el JSX:
<ProjectGrid projects={projects} currentUserId={user.id} />
```

---

## Errores Comunes y Cómo Evitarlos

| Error | Causa | Solución |
|---|---|---|
| `line-clamp-2` no funciona | Tailwind v3 necesita plugin o v4 lo incluye | Verificar versión de Tailwind; en v4 es nativo; en v3 añadir `@tailwindcss/line-clamp` |
| Hover no funciona en móvil | CSS `:hover` no existe en touch | Es aceptable — las tarjetas son usables sin hover; el estado activo con `:active` da feedback |
| `formatDistanceToNow` falla si `updatedAt` es null | Proyecto recién creado sin actualizaciones | Fallback: `project.updatedAt ?? project.createdAt` |
| Grid de 4 columnas aparece antes de 1280px | Breakpoint `xl` no configurado | `xl:grid-cols-4` solo aplica en ≥1280px — comportamiento correcto |
| InviteModal navega al editor al abrirse | Click en modal propaga al Link parent | `e.stopPropagation()` en el wrapper del modal (ya implementado en Issue #19) |

---

## Verificación Final

1. Dashboard → proyectos en grid (no lista) ✅
2. Cada card tiene gradiente único según su ID ✅
3. Badge "Propietario" en proyectos propios, "Editor" en invitados ✅
4. Hover → card sube suavemente con sombra ✅
5. Sin proyectos → empty state con emoji y mensaje ✅
6. Mobile 375px → 1 columna ✅

```bash
pnpm build  # Sin errores
```
