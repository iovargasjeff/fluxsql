'use client'

import { useReactFlow } from '@xyflow/react'
import type { CursorState } from '@/hooks/useCollaboratorCursors'

interface CollaboratorCursorsProps {
  cursors: Map<string, CursorState>
}

export function CollaboratorCursors({ cursors }: CollaboratorCursorsProps) {
  const { flowToScreenPosition } = useReactFlow()

  return (
    <>
      {Array.from(cursors.values()).map((cursor) => {
        // Convertir coordenadas del Canvas a coordenadas de pantalla
        const screenPos = flowToScreenPosition({ x: cursor.x, y: cursor.y })

        return (
          <div
            key={cursor.userId}
            style={{
              position: 'fixed',
              left: screenPos.x,
              top: screenPos.y,
              zIndex: 9999,
              pointerEvents: 'none',
              transform: 'translate(-2px, -2px)', // Ajuste fino del pico del cursor
            }}
            className="transition-transform duration-75 ease-linear"
          >
            <svg width="16" height="24" viewBox="0 0 16 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path 
                d="M0 0 L0 14 L4 10 L7 16 L9 15 L6 9 L11 9 Z" 
                fill={cursor.color} 
                stroke="white" 
                strokeWidth="1"
              />
            </svg>
            <span
              className="absolute left-4 top-4 rounded px-2 py-0.5 text-xs font-semibold whitespace-nowrap shadow-md"
              style={{
                backgroundColor: cursor.color,
                color: '#0A0F1E',
              }}
            >
              {cursor.name}
            </span>
          </div>
        )
      })}
    </>
  )
}
