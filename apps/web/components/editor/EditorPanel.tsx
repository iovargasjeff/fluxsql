'use client'

import dynamic from 'next/dynamic'
import { useEditorStore } from '@/store/useEditorStore'
import { useSyncEditor } from '@/hooks/useSyncEditor'

// CRITICAL: ssr: false — Monaco uses browser APIs (window, document, Worker)
const MonacoEditor = dynamic(
  () => import('@monaco-editor/react'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-[#1E1E1E] animate-pulse flex items-center justify-center">
        <span className="text-[#6B7280] text-sm">Cargando editor...</span>
      </div>
    ),
  }
)

export function EditorPanel() {
  const { sqlValue, setSqlValue } = useEditorStore()
  useSyncEditor('postgresql') // Activates real-time SQL → canvas sync

  return (
    <div className="w-full h-full flex flex-col bg-[#1E1E1E]">
      {/* Tab bar */}
      <div className="shrink-0 flex items-center px-4 py-2 bg-[#252526] border-b border-[#1E2A45]">
        <span className="text-[#9CDCFE] text-xs font-mono">schema.sql</span>
      </div>

      {/* Monaco Editor — fills remaining height */}
      <div className="flex-1 overflow-hidden">
        <MonacoEditor
          height="100%"
          language="sql"
          theme="vs-dark"
          value={sqlValue}
          onChange={(value) => setSqlValue(value ?? '')}
          options={{
            minimap: { enabled: false },
            fontSize: 13,
            fontFamily: "'JetBrains Mono', 'Cascadia Code', 'Fira Code', monospace",
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            tabSize: 2,
            renderLineHighlight: 'line',
            smoothScrolling: true,
            cursorBlinking: 'smooth',
            padding: { top: 16, bottom: 16 },
          }}
        />
      </div>
    </div>
  )
}
