import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

interface Project {
  id: string
  name: string
  description: string | null
  updatedAt: Date
}

interface ProjectCardProps {
  project: Project
  role: string
}

export function ProjectCard({ project, role }: ProjectCardProps) {
  const formattedDate = new Intl.DateTimeFormat('es', {
    dateStyle: 'medium',
  }).format(new Date(project.updatedAt))

  return (
    <Link href={`/editor/${project.id}`} className="block h-full">
      <Card className="h-full flex flex-col bg-[#111827] border-[#1E2A45] text-[#E2E8F0] hover:border-[#1A6CF6] hover:shadow-lg hover:shadow-[#1A6CF6]/10 transition-all duration-200 group cursor-pointer">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl font-bold truncate pr-4">{project.name}</CardTitle>
          <Badge className="bg-[#00D4FF]/20 text-[#00D4FF] hover:bg-[#00D4FF]/30 border-0 pointer-events-none whitespace-nowrap">
            {role === 'owner' ? 'Propietario' : role === 'editor' ? 'Editor' : 'Lector'}
          </Badge>
        </CardHeader>
        <CardContent className="flex-grow">
          <p className="text-sm text-[#94A3B8] line-clamp-2">
            {project.description || 'Sin descripción'}
          </p>
        </CardContent>
        <CardFooter className="pt-4 border-t border-[#1E2A45] mt-auto">
          <p className="text-xs text-[#94A3B8]">
            Actualizado el {formattedDate}
          </p>
        </CardFooter>
      </Card>
    </Link>
  )
}
