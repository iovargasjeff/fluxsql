import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { InviteCollaboratorModal } from './InviteCollaboratorModal'
import { Crown, Edit3 } from 'lucide-react'

const GRADIENTS = [
  'from-blue-500/20 via-transparent to-purple-500/20',
  'from-emerald-500/20 via-transparent to-blue-500/20',
  'from-amber-500/20 via-transparent to-red-500/20',
  'from-purple-500/20 via-transparent to-cyan-500/20',
  'from-red-500/20 via-transparent to-amber-500/20',
  'from-cyan-500/20 via-transparent to-emerald-500/20',
]

function getGradient(id: string): string {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) - hash + id.charCodeAt(i)) | 0
  }
  return GRADIENTS[Math.abs(hash) % GRADIENTS.length]
}

interface Project {
  id: string
  name: string
  description: string | null
  updatedAt: Date
  ownerId: string
}

interface ProjectCardProps {
  project: Project
  role: string
  isOwner?: boolean
}

export function ProjectCard({ project, role, isOwner = false }: ProjectCardProps) {
  const formattedDate = new Intl.DateTimeFormat('es', {
    dateStyle: 'medium',
  }).format(new Date(project.updatedAt))

  return (
    <Link href={`/editor/${project.id}`} className="block h-full">
      <Card className="h-full flex flex-col bg-[#111827] border-[#1E2A45] text-[#E2E8F0] hover:border-[#1A6CF6] hover:shadow-lg hover:shadow-[#1A6CF6]/10 transition-all duration-200 group cursor-pointer hover:-translate-y-1 overflow-hidden">
        {/* Visual thumbnail header */}
        <div className={`h-24 bg-gradient-to-br ${getGradient(project.id)} relative overflow-hidden`}>
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)',
              backgroundSize: '16px 16px',
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-5xl opacity-10 select-none">⬡</span>
          </div>
        </div>

        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-3">
          <CardTitle className="text-xl font-bold truncate pr-4">{project.name}</CardTitle>
          <div className="flex items-center gap-2">
            {role === 'owner' && (
              <div onClick={(e) => e.preventDefault()}>
                <InviteCollaboratorModal projectId={project.id} />
              </div>
            )}
            <Badge className="bg-[#00D4FF]/20 text-[#00D4FF] hover:bg-[#00D4FF]/30 border-0 pointer-events-none whitespace-nowrap">
              {role === 'owner' ? 'Propietario' : role === 'editor' ? 'Editor' : 'Lector'}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="flex-grow pb-2">
          <p className="text-sm text-[#94A3B8] line-clamp-2">
            {project.description || 'Sin descripción'}
          </p>
          {/* Role badge */}
          <div className="mt-2">
            <span
              className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: isOwner ? 'rgba(26,108,246,0.1)' : 'rgba(107,114,128,0.1)',
                color: isOwner ? '#1A6CF6' : '#6B7280',
              }}
            >
              {isOwner ? <Crown size={10} /> : <Edit3 size={10} />}
              {isOwner ? 'Propietario' : 'Editor'}
            </span>
          </div>
        </CardContent>

        <CardFooter className="pt-3 border-t border-[#1E2A45] mt-auto">
          <p className="text-xs text-[#94A3B8]">Actualizado el {formattedDate}</p>
        </CardFooter>
      </Card>
    </Link>
  )
}
