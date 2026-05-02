# Issue #25 — Version Control: Comparar 2 Versiones Lado a Lado

**Milestone:** v0.3 — Realtime + Versiones
**Branch:** `feat/issue-25-compare-versions`
**Depende de:** Issue #23 ✅
**Estado:** ⬜ Pendiente

---

## Historia de Usuario

Como revisor del proyecto, quiero comparar dos versiones con un diff de código SQL para ver exactamente qué tablas se añadieron o eliminaron.

---

## Criterios de Aceptación

- [ ] Opción "Comparar con actual" en el historial
- [ ] Modal con Monaco Diff Editor (`createDiffEditor`)
- [ ] Líneas añadidas en verde, eliminadas en rojo

---

## Arquitectura

### Estructura de archivos

```
apps/web/components/editor/
└── DiffViewerModal.tsx   ← NUEVO ("use client" + dynamic ssr:false)
```

---

## Patrones y Reglas

### DiffViewerModal.tsx

```tsx
// components/editor/DiffViewerModal.tsx
"use client"
import dynamic from "next/dynamic"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

// CRÍTICO: DiffEditor también usa APIs del browser — ssr: false obligatorio
const DiffEditor = dynamic(
  () => import("@monaco-editor/react").then((mod) => mod.DiffEditor),
  { ssr: false, loading: () => <div className="h-96 bg-[#1E1E1E] animate-pulse rounded" /> }
)

interface Props {
  open: boolean
  onClose: () => void
  originalCode: string   // SQL de la versión antigua
  modifiedCode: string   // SQL de la versión actual
  versionLabel: string   // ej. "v2 vs actual"
}

export function DiffViewerModal({ open, onClose, originalCode, modifiedCode, versionLabel }: Props) {
  const hasDiff = originalCode.trim() !== modifiedCode.trim()

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#111827] border-[#1E2A45] max-w-5xl w-full">
        <DialogHeader>
          <DialogTitle className="text-white font-mono text-sm">
            Comparando: {versionLabel}
          </DialogTitle>
        </DialogHeader>

        {!hasDiff && (
          <div className="text-center py-8 text-[#6B7280] text-sm">
            No hay diferencias estructurales en el DDL entre estas versiones
          </div>
        )}

        {hasDiff && (
          <div className="h-96 rounded overflow-hidden border border-[#1E2A45]">
            <DiffEditor
              original={originalCode}
              modified={modifiedCode}
              language="sql"
              theme="vs-dark"
              options={{
                readOnly: true,
                renderSideBySide: true,
                minimap: { enabled: false },
                fontSize: 13,
                padding: { top: 12 },
                scrollBeyondLastLine: false,
              }}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
```

### Integrar en VersionHistorySheet

```tsx
// Añadir estado para el diff viewer
const [diffModal, setDiffModal] = useState<{
  open: boolean
  versionId: string
  versionLabel: string
} | null>(null)
const { sqlValue: currentSQL } = useEditorStore()

async function handleCompare(versionId: string, versionNumber: number) {
  // Obtener el sqlContent de la versión seleccionada
  const result = await getVersionDetailAction(versionId)
  if (!result.data) return

  setDiffModal({
    open: true,
    originalSQL: result.data.sqlContent,
    versionLabel: `v${versionNumber} vs actual`,
  })
}
```

### Server Action para obtener detalle de versión (solo el SQL)

```typescript
// actions/versions/detail.ts
"use server"
export async function getVersionDetailAction(versionId: string) {
  // SELECT solo sqlContent y versionNumber (no flowJson completo)
  const version = await db.query.diagramVersions.findFirst({
    where: eq(diagramVersions.id, versionId),
    columns: { sqlContent: true, versionNumber: true }
  })
  return { data: version ?? null }
}
```

---

## Errores Comunes y Cómo Evitarlos

| Error | Causa | Solución |
|---|---|---|
| `DiffEditor` explota en SSR | Monaco usa `window` | `dynamic(..., { ssr: false })` es obligatorio igual que en el editor principal |
| "No hay diferencias" pero sí las hay | Comparación con `===` incluyendo whitespace | Normalizar antes de comparar: `code.trim().replace(/\s+/g, ' ')` |
| Modal muy pequeño para ver el diff | Ancho del Dialog insuficiente | Usar `max-w-5xl` en el `DialogContent` |
| `originalCode` y `modifiedCode` intercambiados | Confusión de cuál es el "original" | `original` = versión antigua (izquierda), `modified` = versión actual (derecha) |

---

## Verificación Final

1. Crear v1 con tabla `users`, luego añadir tabla `projects`
2. Clic "Comparar" en v1 → Modal abre con diff editor ✅
3. Lado izquierdo (v1): sin `projects`, lado derecho (actual): con `projects` en verde ✅
4. Comparar versiones idénticas → "No hay diferencias" ✅

```bash
pnpm build  # Sin errores
```
