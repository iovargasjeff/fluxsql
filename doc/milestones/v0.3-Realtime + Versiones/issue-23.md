# Issue #23 — Version Control: Ver Historial de Versiones

**Milestone:** v0.3 — Realtime + Versiones
**Branch:** `feat/issue-23-version-history`
**Depende de:** Issue #22 ✅
**Estado:** ⬜ Pendiente

---

## Historia de Usuario

Como miembro del equipo, quiero un panel lateral con el historial de commits para ver quién hizo qué y cuándo.

---

## Criterios de Aceptación

- [ ] Botón "Historial" en la toolbar abre un Sheet (shadcn)
- [ ] Lista de versiones ordenada por `created_at` DESC
- [ ] Cada ítem: número de versión, avatar del autor, fecha relativa, mensaje
- [ ] Empty state si no hay versiones

---

## Arquitectura

### Estructura de archivos

```
apps/web/
├── actions/versions/
│   └── list.ts               ← NUEVO
└── components/editor/
    └── VersionHistorySheet.tsx  ← NUEVO
```

---

## Patrones y Reglas

### Server Action list.ts

```typescript
// actions/versions/list.ts
"use server"
import { createClient } from "@/lib/supabase/server"
import { db } from "@/lib/db"
import { diagramVersions } from "@/lib/db/schema"
import { eq, desc } from "drizzle-orm"

export async function listVersionsAction(diagramId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "No autenticado", data: null }

  const versions = await db.query.diagramVersions.findMany({
    where: eq(diagramVersions.diagramId, diagramId),
    orderBy: desc(diagramVersions.createdAt),
    columns: {
      id: true,
      versionNumber: true,
      message: true,
      userId: true,
      createdAt: true,
      // NO incluir flowJson — es muy pesado para la lista
    }
  })

  return { error: null, data: versions }
}
```

### VersionHistorySheet.tsx

```tsx
// components/editor/VersionHistorySheet.tsx
"use client"
import { useState, useEffect } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { listVersionsAction } from "@/actions/versions/list"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

// Instalar date-fns si no está: pnpm add date-fns --filter web

interface Version {
  id: string
  versionNumber: number
  message: string
  userId: string
  createdAt: Date
}

interface Props {
  diagramId: string
  onRestore?: (versionId: string) => void  // Para Issue #24
}

export function VersionHistorySheet({ diagramId, onRestore }: Props) {
  const [versions, setVersions] = useState<Version[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  async function loadVersions() {
    setLoading(true)
    const result = await listVersionsAction(diagramId)
    if (result.data) setVersions(result.data as Version[])
    setLoading(false)
  }

  useEffect(() => {
    if (open) loadVersions()
  }, [open])

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button className="px-3 py-1.5 bg-[#1E2A45] hover:bg-[#2A3A55] text-white text-xs rounded transition-colors">
          Historial
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="bg-[#111827] border-[#1E2A45] w-80">
        <SheetHeader>
          <SheetTitle className="text-white">Historial de versiones</SheetTitle>
        </SheetHeader>

        <div className="mt-4 flex flex-col gap-2 overflow-y-auto">
          {loading && (
            <div className="flex flex-col gap-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 bg-[#1E2A45] rounded animate-pulse" />
              ))}
            </div>
          )}

          {!loading && versions.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="text-3xl mb-3">🕐</div>
              <p className="text-[#6B7280] text-sm">Aún no hay versiones guardadas</p>
              <p className="text-[#6B7280] text-xs mt-1">Usa "Commit" para guardar un snapshot</p>
            </div>
          )}

          {!loading && versions.map((version) => (
            <div
              key={version.id}
              className="bg-[#1E2A45] rounded-lg p-3 flex flex-col gap-1 group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[#1A6CF6] text-xs font-mono font-bold">
                  v{version.versionNumber}
                </span>
                <span className="text-[#6B7280] text-xs">
                  {formatDistanceToNow(new Date(version.createdAt), {
                    addSuffix: true,
                    locale: es
                  })}
                </span>
              </div>
              <p className="text-white text-sm leading-snug">{version.message}</p>
              {onRestore && (
                <button
                  onClick={() => onRestore(version.id)}
                  className="text-xs text-[#6B7280] hover:text-[#1A6CF6] transition-colors text-left mt-1 opacity-0 group-hover:opacity-100"
                >
                  Restaurar esta versión →
                </button>
              )}
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  )
}
```

---

## Errores Comunes y Cómo Evitarlos

| Error | Causa | Solución |
|---|---|---|
| Sheet no se abre | `shadcn Sheet` no instalado | `pnpm dlx shadcn@latest add sheet --cwd apps/web -y` |
| `date-fns` no encontrado | No instalado | `pnpm add date-fns --filter web` |
| Lista no se recarga al reabrir | `useEffect` no depende de `open` | Añadir `open` al array de dependencias del `useEffect` |
| `flowJson` carga lenta | Se incluye en el SELECT | NO incluir `flowJson` en la query de lista — solo en la de detalle (Issue #24) |

---

## Verificación Final

1. Crear 3 commits desde la Issue #22
2. Clic "Historial" → Sheet abre con 3 versiones ordenadas DESC ✅
3. Cada versión muestra: `v3`, mensaje, fecha "hace X minutos" ✅
4. Diagrama nuevo → "Aún no hay versiones guardadas" ✅

```bash
pnpm build  # Sin errores
```
