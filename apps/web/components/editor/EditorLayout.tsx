'use client'

import { EditorPanel } from './EditorPanel'
import { Canvas } from './Canvas'

interface EditorLayoutProps {
  projectName: string
  projectId: string
}

export function EditorLayout({ projectName, projectId }: EditorLayoutProps) {
  return (
    <div className="h-screen flex flex-col bg-[#0A0F1E] text-white overflow-hidden">
      {/* Header */}
      <header className="shrink-0 border-b border-[#1E2A45] bg-[#111827] h-12 flex items-center px-4 gap-4">
        <a href="/dashboard" className="text-[#94A3B8] hover:text-white transition-colors text-sm">
          ← Dashboard
        </a>
        <span className="text-[#1E2A45]">|</span>
        <h1 className="font-semibold text-[#E2E8F0] truncate">{projectName}</h1>
        <span className="ml-auto text-xs text-[#94A3B8] font-mono hidden md:block">{projectId}</span>
      </header>

      {/* Main — split 40/60 */}
      <div className="flex-1 grid grid-cols-[40%_60%] min-h-0">
        {/* Left — Monaco SQL Editor */}
        <div className="h-full min-h-0 border-r border-[#1E2A45]">
          <EditorPanel />
        </div>

        {/* Right — React Flow Canvas */}
        <div className="h-full min-h-0">
          <Canvas />
        </div>
      </div>
    </div>
  )
}
