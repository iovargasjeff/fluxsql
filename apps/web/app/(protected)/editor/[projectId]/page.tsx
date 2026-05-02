import { db } from '@/lib/db'
import { projects, collaborators, users } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { EditorLayout } from '@/components/editor/EditorLayout'
import { loadDiagramAction } from '@/actions/diagrams/load'

interface EditorPageProps {
  params: Promise<{ projectId: string }>
}

export default async function EditorPage({ params }: EditorPageProps) {
  const { projectId } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get the db user
  const [dbUser] = await db
    .select()
    .from(users)
    .where(eq(users.authId, user.id))
    .limit(1)

  if (!dbUser) {
    redirect('/dashboard')
  }

  // Verify the user has access to this project via collaborators
  const [access] = await db
    .select({ project: projects })
    .from(projects)
    .innerJoin(
      collaborators,
      and(
        eq(collaborators.projectId, projects.id),
        eq(collaborators.userId, dbUser.id)
      )
    )
    .where(eq(projects.id, projectId))
    .limit(1)

  if (!access) {
    redirect('/dashboard')
  }

  // Load Diagram
  const { error, data: diagramData } = await loadDiagramAction(projectId)
  if (error || !diagramData) {
    redirect('/dashboard')
  }

  const savedFlow = (diagramData.flowJson as any) ?? {}
  const initialNodes = savedFlow.nodes ?? []
  const initialEdges = savedFlow.edges ?? []

  return (
    <EditorLayout
      projectName={access.project.name}
      projectId={projectId}
      initialSQL={diagramData.sourceCode ?? ''}
      initialNodes={initialNodes}
      initialEdges={initialEdges}
      dialect={diagramData.dialect ?? 'postgresql'}
    />
  )
}
