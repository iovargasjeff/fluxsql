# Issue #18 — Export Mermaid .mmd

**Milestone:** v0.2 — Canvas + Editor
**Branch:** `feat/issue-18-export-mermaid`
**Depende de:** Issue #17 ✅
**Estado:** ⬜ Pendiente

---

## Historia de Usuario

Como desarrollador que documenta con código, quiero exportar mi diagrama en sintaxis Mermaid `erDiagram` para pegarlo en README.md o la Wiki de GitHub (Criterio FD02) y que se renderice nativamente.

---

## Criterios de Aceptación

- [ ] Función `toMermaid(nodes, edges)` en `@fluxsql/parsers`
- [ ] Opción "Copiar Mermaid" en el menú Exportar
- [ ] Clipboard API copia el string generado
- [ ] Toast de confirmación o de canvas vacío

---

## Arquitectura

### Estructura de archivos

```
packages/parsers/src/
└── index.ts           ← añadir toMermaid()

apps/web/components/editor/
└── ExportMenu.tsx     ← añadir opción "Copiar Mermaid"
```

---

## Patrones y Reglas

### Función toMermaid — en packages/parsers

```typescript
// packages/parsers/src/index.ts
export interface MermaidResult {
  code: string    // El string completo de erDiagram
  isEmpty: boolean
}

export function toMermaid(nodes: FlowNode[], edges: FlowEdge[]): MermaidResult {
  if (nodes.length === 0) {
    return { code: 'erDiagram
', isEmpty: true }
  }

  const lines: string[] = ['erDiagram']

  // Definir entidades con sus atributos
  nodes.forEach((node) => {
    const { tableName, columns } = node.data as TableNodeData
    lines.push(`  ${tableName} {`)
    columns.forEach((col) => {
      const pkFlag = col.isPrimaryKey ? ' PK' : col.isForeignKey ? ' FK' : ''
      // Mermaid erDiagram: tipo nombre
      lines.push(`    ${col.type} ${col.name}${pkFlag}`)
    })
    lines.push('  }')
  })

  // Definir relaciones desde los edges
  edges.forEach((edge) => {
    // edge.id tiene formato "tableSrc-colSrc-tableDst-colDst" o similar
    const sourceTable = (edge.source ?? '').split('-')[0]
    const targetTable = (edge.target ?? '').split('-')[0]
    if (sourceTable && targetTable && sourceTable !== targetTable) {
      lines.push(`  ${sourceTable} ||--o{ ${targetTable} : "FK"`)
    }
  })

  return { code: lines.join('
'), isEmpty: false }
}
```

### Salida esperada para 2 tablas relacionadas

```
erDiagram
  users {
    UUID id PK
    TEXT email
    TEXT name
  }
  projects {
    UUID id PK
    TEXT name
    UUID owner_id FK
  }
  projects ||--o{ users : "FK"
```

### Integrar en ExportMenu.tsx

```tsx
// components/editor/ExportMenu.tsx — añadir opción Mermaid
import { toMermaid } from "@fluxsql/parsers"
import { useEditorStore } from "@/store/useEditorStore"
import { toast } from "sonner"

// Dentro del componente, junto a handleExportPng y handleExportSvg:
async function handleCopyMermaid() {
  setOpen(false)
  const { nodes, edges } = useEditorStore.getState()
  const result = toMermaid(nodes, edges)

  if (result.isEmpty) {
    toast.warning("No hay entidades en el canvas para exportar")
    return
  }

  try {
    await navigator.clipboard.writeText(result.code)
    toast.success("Código Mermaid copiado al portapapeles")
  } catch {
    // Fallback para navegadores sin permisos de clipboard
    const textarea = document.createElement('textarea')
    textarea.value = result.code
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    toast.success("Código Mermaid copiado al portapapeles")
  }
}
```

### Añadir botón en el dropdown de ExportMenu

```tsx
<button
  onClick={handleCopyMermaid}
  className="w-full text-left px-3 py-2 text-xs text-white hover:bg-[#1E2A45] transition-colors border-t border-[#1E2A45]"
>
  📋 Copiar Mermaid
</button>
```

---

## Errores Comunes y Cómo Evitarlos

| Error | Causa | Solución |
|---|---|---|
| `navigator.clipboard` undefined | HTTP sin HTTPS o iframe sin permisos | Usar el fallback con `textarea + execCommand` |
| Nombres de tabla mal formateados | `node.data.tableName` con espacios | Sanitizar: `tableName.replace(/\s+/g, '_')` |
| Relaciones duplicadas | Múltiples edges entre las mismas tablas | Usar `Set` para deduplicar pares `src-dst` |
| `toMermaid` no encontrado | Import incorrecto | `import { toMermaid } from "@fluxsql/parsers"` |

---

## Verificación Final

1. Canvas con tablas `users` y `projects` con FK
2. "Exportar → Copiar Mermaid" → Toast "Copiado al portapapeles" ✅
3. Pegar en README.md → GitHub renderiza el diagrama ER ✅
4. Canvas vacío → Toast "No hay entidades para exportar" ✅

```bash
pnpm build  # Sin errores
```
