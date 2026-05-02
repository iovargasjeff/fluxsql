'use client'

import { useEffect } from 'react'
import { ReactFlowProvider } from '@xyflow/react'
import { EditorPanel } from './EditorPanel'
import { Canvas } from './Canvas'
import { EditorToolbar } from './EditorToolbar'
import { useEditorStore } from '@/store/useEditorStore'
import { useCollaboratorCursors } from '@/hooks/useCollaboratorCursors'
import { useRealtimeSync } from '@/hooks/useRealtimeSync'
import { CollaboratorCursors } from './CollaboratorCursors'

interface EditorLayoutProps {
  projectName: string
  projectId: string
  initialSQL?: string
  initialNodes?: any[]
  initialEdges?: any[]
  dialect?: string
  currentUser: { id: string, name: string }
}

function EditorLayoutInner({
  projectName,
  projectId,
  initialSQL,
  initialNodes = [],
  initialEdges = [],
  dialect = 'postgresql',
  currentUser
}: EditorLayoutProps) {
  const setSqlValue = useEditorStore((state) => state.setSqlValue)
  const setNodesAndEdges = useEditorStore((state) => state.setNodesAndEdges)
  
  const { cursors, handleMouseMove } = useCollaboratorCursors(projectId, currentUser.id, currentUser.name)
  const { emitNodeMove, emitSqlChange } = useRealtimeSync(projectId, currentUser.id)

  useEffect(() => {
    if (initialSQL) setSqlValue(initialSQL)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (initialNodes.length > 0) {
      setNodesAndEdges(initialNodes, initialEdges)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div 
      className="h-screen flex flex-col bg-[#0A0F1E] text-white overflow-hidden relative"
      onMouseMove={handleMouseMove}
    >
      {/* Header with Toolbar */}
      <EditorToolbar projectId={projectId} projectName={projectName} dialect={dialect} />

      {/* Main — split 40/60 */}
      <div className="flex-1 grid grid-cols-[40%_60%] min-h-0">
        {/* Left — Monaco SQL Editor */}
        <div className="h-full min-h-0 border-r border-[#1E2A45]">
          <EditorPanel emitSqlChange={emitSqlChange} />
        </div>

        {/* Right — React Flow Canvas */}
        <div className="h-full min-h-0 relative">
          <Canvas emitNodeMove={emitNodeMove} />
        </div>
      </div>
      
      {/* Cursores Colaborativos superpuestos */}
      <CollaboratorCursors cursors={cursors} />
    </div>
  )
}

export function EditorLayout(props: EditorLayoutProps) {
  return (
    <ReactFlowProvider>
      <EditorLayoutInner {...props} />
    </ReactFlowProvider>
  )
}
