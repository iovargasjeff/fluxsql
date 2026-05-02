# Issue #34 — Toolbar del Editor / Canvas

**Milestone:** v0.4 — UI/UX Polish
**Branch:** `feat/issue-34-editor-toolbar`
**Responsable:** Jefferson
**Estado:** ⬜ Pendiente

---

## Historia de Usuario

Como diseñador del diagrama, quiero una toolbar elegante con tooltips para acceder a las funciones principales sin estorbar el área de trabajo.

---

## Criterios de Aceptación

- [ ] Toolbar anclada en la parte superior del canvas (h-12 máximo)
- [ ] Tooltips en cada ícono (shadcn Tooltip component)
- [ ] Botones: Guardar, Commit, Historial, Compartir, Exportar PNG, Ctrl+K hint

---

## Contexto importante

La toolbar **ya existe** (`EditorToolbar.tsx`) — esta issue es sobre mejorar su diseño visual y añadir tooltips, NO crear una nueva.

ANTES de escribir, leer:
→ `apps/web/components/editor/EditorToolbar.tsx` — ver el estado actual completo

---

## Patrones y Reglas

### Instalar shadcn Tooltip si no existe

```bash
# Verificar primero:
ls apps/web/components/ui/tooltip.tsx
# Si no existe:
pnpm dlx shadcn@latest add tooltip --cwd apps/web -y
```

### Patrón de botón con Tooltip

```tsx
// Wrapper reutilizable para cada botón de la toolbar
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

function ToolbarButton({
  icon: Icon,
  label,
  onClick,
  disabled = false,
  variant = 'default',
}: {
  icon: React.ElementType
  label: string
  onClick?: () => void
  disabled?: boolean
  variant?: 'default' | 'primary' | 'danger'
}) {
  const colorMap = {
    default: 'text-[#6B7280] hover:text-white hover:bg-[#1E2A45]',
    primary: 'text-[#1A6CF6] hover:text-blue-400 hover:bg-[#1A6CF6]/10',
    danger:  'text-[#EF4444] hover:text-red-400 hover:bg-[#EF4444]/10',
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={onClick}
          disabled={disabled}
          className={`p-2 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${colorMap[variant]}`}
        >
          <Icon size={16} />
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs">
        {label}
      </TooltipContent>
    </Tooltip>
  )
}
```

### Estructura de la toolbar mejorada

```tsx
// EditorToolbar.tsx — estructura final
export function EditorToolbar({ ... }) {
  return (
    <TooltipProvider delayDuration={200}>
      <div className="h-12 flex items-center justify-between px-3 border-b border-[#1E2A45] bg-[#0A0F1E] flex-shrink-0">

        {/* Izquierda — nombre del proyecto */}
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-white text-sm font-medium truncate max-w-[200px]">
            {projectName}
          </span>
        </div>

        {/* Centro — acciones principales */}
        <div className="flex items-center gap-1">
          <ToolbarButton icon={Save}    label="Guardar (Ctrl+S)"        onClick={onSave} />
          <ToolbarButton icon={GitCommit} label="Commit — guardar versión" onClick={onCommit} variant="primary" />
          <div className="w-px h-5 bg-[#1E2A45] mx-1" />  {/* Separador */}
          <ToolbarButton icon={History}  label="Historial de versiones"  onClick={onHistory} />
          <ToolbarButton icon={Share2}   label="Compartir enlace"        onClick={onShare} />
          <ToolbarButton icon={Download} label="Exportar como PNG"       onClick={onExport} />
        </div>

        {/* Derecha — hint búsqueda + tema */}
        <div className="flex items-center gap-2">
          <span className="hidden sm:flex items-center gap-1 text-[#6B7280] text-xs">
            <kbd className="px-1.5 py-0.5 bg-[#1E2A45] rounded text-[10px]">Ctrl</kbd>
            <span>+</span>
            <kbd className="px-1.5 py-0.5 bg-[#1E2A45] rounded text-[10px]">K</kbd>
          </span>
          <ThemeToggle />
        </div>

      </div>
    </TooltipProvider>
  )
}
```

---

## Errores Comunes y Cómo Evitarlos

| Error | Causa | Solución |
|---|---|---|
| Tooltip no aparece | `TooltipProvider` faltante o fuera del árbol | Envolver toda la toolbar con `<TooltipProvider>` |
| Toolbar ocupa más de h-12 | Padding excesivo en los botones | Usar `p-2` (8px) máximo en cada botón |
| `shadcn add tooltip` falla | Conflicto de workspaces pnpm | Instalar con `--cwd apps/web` explícito |

---

## Verificación Final

```bash
pnpm build  # Sin errores
```

1. Hover sobre cada ícono → tooltip aparece con delay de 200ms ✅
2. Toolbar height ≤ 48px (h-12) ✅
3. Actualizar `.ia/PROGRESS.md` marcando Issue #34 como ✅
4. `git add . && git commit -m "feat: toolbar del editor con tooltips (#34)"`
