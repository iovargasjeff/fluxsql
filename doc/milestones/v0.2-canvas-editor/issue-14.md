# Issue #14 — Soporte JSON Schema → Nodos NoSQL

**Milestone:** v0.2 — Canvas + Editor
**Branch:** `feat/issue-14-parser-json-schema`
**Depende de:** Issue #13 ✅
**Estado:** ⬜ Pendiente

---

## Historia de Usuario

Como desarrollador con MongoDB, quiero pegar un JSON Schema y visualizar mis colecciones NoSQL en el mismo canvas para usar la misma interfaz gráfica que con SQL.

---

## Criterios de Aceptación

- [ ] Selector de modo "SQL" / "JSON" en el toolbar del editor
- [ ] Al seleccionar JSON, Monaco cambia `language` a `json`
- [ ] Nueva función `parseJSON()` en `@fluxsql/parsers`
- [ ] Objetos anidados generan sub-nodos conectados al nodo padre

---

## Arquitectura

### Estructura de archivos

```
packages/parsers/src/
└── index.ts           ← completar el stub parseJSON() que ya existe

apps/web/components/editor/
├── EditorPanel.tsx    ← añadir selector SQL/JSON
└── ModeSelector.tsx   ← NUEVO — botones SQL | JSON
```

### Contrato de parseJSON — ya definido en index.ts (stub)

```typescript
// packages/parsers/src/index.ts — implementar el stub existente
export function parseJSON(jsonString: string): ParseResult {
  // Actualmente retorna { nodes: [], edges: [], errors: [] }
  // Implementar aquí
}
```

---

## Patrones y Reglas

### Algoritmo parseJSON — dos formatos soportados

**Formato 1 — JSON Schema estándar:**
```json
{
  "$schema": "http://json-schema.org/draft-07/schema",
  "title": "Usuario",
  "type": "object",
  "properties": {
    "id": { "type": "string" },
    "nombre": { "type": "string" },
    "edad": { "type": "integer" }
  }
}
```

**Formato 2 — JSON simple con tipos como strings:**
```json
{
  "usuario": {
    "nombre": "string",
    "edad": "number",
    "activo": "boolean"
  }
}
```

### Implementación de parseJSON

```typescript
// packages/parsers/src/index.ts
export function parseJSON(jsonString: string): ParseResult {
  try {
    const parsed = JSON.parse(jsonString)
    return processJsonObject(parsed)
  } catch (err) {
    // JSON inválido — retornar sin modificar el canvas
    return {
      nodes: [],
      edges: [],
      errors: [{ message: err instanceof Error ? err.message : 'JSON inválido' }]
    }
  }
}

function processJsonObject(obj: Record<string, unknown>): ParseResult {
  const nodes: FlowNode[] = []
  const edges: FlowEdge[] = []
  const positions = calculateLayout(Object.keys(obj).length)

  // Detectar si es JSON Schema (tiene "properties") o JSON simple
  const isJsonSchema = obj.$schema !== undefined || obj.properties !== undefined

  if (isJsonSchema) {
    return processJsonSchema(obj, positions)
  }

  // JSON simple: cada clave de primer nivel es una colección
  Object.entries(obj).forEach(([collectionName, fields], index) => {
    const columns: Column[] = []

    if (typeof fields === 'object' && fields !== null) {
      Object.entries(fields as Record<string, unknown>).forEach(([fieldName, fieldType]) => {
        columns.push({
          name: fieldName,
          type: String(fieldType).toUpperCase(),
          isPrimaryKey: fieldName === '_id' || fieldName === 'id',
          isForeignKey: false,
        })
      })
    }

    nodes.push({
      id: collectionName.toLowerCase(),
      type: 'tableNode',
      position: positions[index] ?? { x: 0, y: 0 },
      data: { tableName: collectionName, columns }
    })
  })

  return { nodes, edges, errors: [] }
}
```

### Selector de modo en EditorPanel

```tsx
// components/editor/ModeSelector.tsx
"use client"
type EditorMode = 'postgresql' | 'mysql' | 'sqlserver' | 'json'

interface ModeSelectorProps {
  mode: EditorMode
  onChange: (mode: EditorMode) => void
}

export function ModeSelector({ mode, onChange }: ModeSelectorProps) {
  const options: { value: EditorMode; label: string }[] = [
    { value: 'postgresql', label: 'PostgreSQL' },
    { value: 'mysql', label: 'MySQL' },
    { value: 'sqlserver', label: 'SQL Server' },
    { value: 'json', label: 'JSON' },
  ]

  return (
    <div className="flex items-center gap-1 bg-[#1E2A45] rounded p-0.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-2 py-1 text-xs rounded transition-colors ${
            mode === opt.value
              ? 'bg-[#1A6CF6] text-white'
              : 'text-[#6B7280] hover:text-white'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
```

### Actualizar useSyncEditor para JSON

```typescript
// hooks/useSyncEditor.ts — actualizar para soportar JSON
import { parseSQL, parseJSON } from "@fluxsql/parsers"

export function useSyncEditor(mode: 'postgresql' | 'mysql' | 'sqlserver' | 'json' = 'postgresql') {
  useEffect(() => {
    const result = mode === 'json'
      ? parseJSON(debouncedSQL)
      : parseSQL(debouncedSQL, mode)
    // ... resto igual
  }, [debouncedSQL, mode])
}
```

---

## Errores Comunes y Cómo Evitarlos

| Error | Causa | Solución |
|---|---|---|
| Canvas se borra al escribir JSON inválido | `parseJSON` retorna `nodes: []` y se aplica | Si `errors.length > 0 && nodes.length === 0`, NO actualizar el store |
| Monaco no cambia a JSON | `language` de Monaco no se actualiza dinámicamente | Pasar `language={mode === 'json' ? 'json' : 'sql'}` como prop a MonacoEditor |
| Sub-nodos se solapan con el padre | Layout no considera nodos hijos | Para objetos anidados, calcular el layout del sub-nivel con offset Y |

---

## Verificación Final

```json
// Pegar en el editor con modo JSON activado:
{
  "productos": {
    "_id": "string",
    "nombre": "string",
    "precio": "number",
    "stock": "integer"
  },
  "categorias": {
    "_id": "string",
    "nombre": "string"
  }
}
```

- 2 nodos aparecen: "productos" y "categorias" ✅
- Columna `_id` tiene ícono PK ✅
- JSON inválido (sin cerrar `}`) → canvas no se borra ✅

```bash
pnpm build  # Sin errores
```
