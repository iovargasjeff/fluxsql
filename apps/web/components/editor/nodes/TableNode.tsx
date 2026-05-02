'use client'

import { Handle, Position } from '@xyflow/react'

interface Column {
  name: string
  type: string
  isPrimaryKey?: boolean
  isForeignKey?: boolean
}

interface TableNodeData {
  tableName: string
  columns: Column[]
  [key: string]: unknown
}

interface TableNodeProps {
  data: TableNodeData
}

export function TableNode({ data }: TableNodeProps) {
  const { tableName, columns = [] } = data

  return (
    <div className="rounded-lg overflow-hidden border border-[#1E2A45] shadow-xl shadow-black/40 min-w-[220px]">
      {/* Header */}
      <div className="bg-[#1A6CF6] px-3 py-2 flex items-center gap-2">
        <span className="text-white font-bold text-sm tracking-wide truncate">{tableName}</span>
      </div>

      {/* Columns */}
      <div className="bg-[#111827] divide-y divide-[#1E2A45]">
        {columns.length === 0 ? (
          <div className="px-3 py-2 text-[#94A3B8] text-xs italic">Sin columnas</div>
        ) : (
          columns.map((col, idx) => (
            <div key={idx} className="relative px-3 py-1.5 flex items-center gap-2 group">
              {/* Left handle (target) */}
              <Handle
                type="target"
                position={Position.Left}
                id={`${col.name}-target`}
                className="!w-2 !h-2 !bg-[#1A6CF6] !border-[#1E2A45]"
                style={{ top: '50%' }}
              />

              {/* PK / FK badge */}
              {col.isPrimaryKey ? (
                <span className="text-yellow-400 text-xs font-bold shrink-0" title="Primary Key">PK</span>
              ) : col.isForeignKey ? (
                <span className="text-[#94A3B8] text-xs font-bold shrink-0" title="Foreign Key">FK</span>
              ) : (
                <span className="w-5 shrink-0" />
              )}

              <span className="text-[#E2E8F0] text-xs truncate flex-1">{col.name}</span>
              <span className="text-[#94A3B8] text-xs shrink-0 font-mono">{col.type}</span>

              {/* Right handle (source) */}
              <Handle
                type="source"
                position={Position.Right}
                id={`${col.name}-source`}
                className="!w-2 !h-2 !bg-[#00D4FF] !border-[#1E2A45]"
                style={{ top: '50%' }}
              />
            </div>
          ))
        )}
      </div>
    </div>
  )
}
