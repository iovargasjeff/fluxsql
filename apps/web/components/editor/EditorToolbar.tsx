'use client'

import { useState } from 'react'
import { useReactFlow } from '@xyflow/react'
import { toast } from 'sonner'
import { saveDiagramAction } from '@/actions/diagrams/save'
import { useEditorStore } from '@/store/useEditorStore'
import { ExportMenu } from './ExportMenu'
import { CommitModal } from './CommitModal'

interface EditorToolbarProps {
  projectId: string
  projectName: string
  dialect?: string
}

export function EditorToolbar({ projectId, projectName, dialect = 'postgresql' }: EditorToolbarProps) {
  const { toObject } = useReactFlow()
  const sqlValue = useEditorStore((state) => state.sqlValue)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      const flowObject = toObject()
      
      const result = await saveDiagramAction({
        projectId,
        sqlContent: sqlValue,
        flowJson: flowObject,
        dialect
      })

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Diagrama guardado exitosamente')
      }
    } catch (err) {
      toast.error('Ocurrió un error inesperado al guardar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <header className="shrink-0 border-b border-[#1E2A45] bg-[#111827] h-12 flex items-center px-4 gap-4">
      <a href="/dashboard" className="text-[#94A3B8] hover:text-white transition-colors text-sm">
        ← Dashboard
      </a>
      <span className="text-[#1E2A45]">|</span>
      <h1 className="font-semibold text-[#E2E8F0] truncate">{projectName}</h1>
      <span className="ml-auto text-xs text-[#94A3B8] font-mono hidden md:block">{projectId}</span>
      
      <div className="flex items-center gap-2 ml-4">
        <CommitModal projectId={projectId} />
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-[#1A6CF6] hover:bg-[#1A6CF6]/90 text-white px-3 py-1.5 rounded text-sm transition-colors disabled:opacity-50"
        >
          {saving ? 'Guardando...' : 'Guardar'}
        </button>
        <ExportMenu projectName={projectName} />
      </div>
    </header>
  )
}
