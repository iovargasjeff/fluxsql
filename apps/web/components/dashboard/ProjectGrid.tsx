'use client'

import { ProjectCard } from './ProjectCard'
import { CreateProjectModal } from './CreateProjectModal'

interface ProjectData {
  project: {
    id: string
    name: string
    description: string | null
    updatedAt: Date
    ownerId: string
  }
  role: string
}

interface ProjectGridProps {
  projects: ProjectData[]
  currentUserId: string
}

export function ProjectGrid({ projects, currentUserId }: ProjectGridProps) {
  if (projects.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-[#E2E8F0]">Mis Proyectos</h2>
          <CreateProjectModal />
        </div>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="text-5xl mb-4">🗂️</div>
          <h3 className="text-white font-semibold mb-2">No tienes proyectos aún</h3>
          <p className="text-[#6B7280] text-sm">
            Crea tu primer diagrama haciendo clic en &quot;Nuevo proyecto&quot;
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-[#E2E8F0]">Mis Proyectos</h2>
        <CreateProjectModal />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {projects.map(({ project, role }) => (
          <ProjectCard
            key={project.id}
            project={project}
            role={role}
            isOwner={project.ownerId === currentUserId}
          />
        ))}
      </div>
    </div>
  )
}
