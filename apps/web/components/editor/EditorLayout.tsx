'use client'

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
        {/* Left — SQL Editor (placeholder until Issue #12) */}
        <div className="border-r border-[#1E2A45] bg-[#0D1117] flex flex-col">
          <div className="border-b border-[#1E2A45] px-4 py-2">
            <span className="text-xs text-[#94A3B8] font-semibold uppercase tracking-wider">SQL Editor</span>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <p className="text-[#94A3B8] text-sm text-center px-6">
              El editor Monaco se integrará en la Issue #12.<br />
              <span className="text-xs mt-1 block">Por ahora el canvas opera con datos de demo.</span>
            </p>
          </div>
        </div>

        {/* Right — React Flow Canvas */}
        <div className="h-full min-h-0">
          <Canvas />
        </div>
      </div>
    </div>
  )
}
