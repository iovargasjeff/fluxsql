import { db } from '@/lib/db'
import { projects, collaborators, users } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { createClient } from '@/lib/supabase/server'

export async function getProjectsByUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const [dbUser] = await db.select().from(users).where(eq(users.authId, user.id)).limit(1)
  if (!dbUser) return []

  const userProjects = await db
    .select({ project: projects, role: collaborators.role })
    .from(projects)
    .innerJoin(collaborators, eq(collaborators.projectId, projects.id))
    .where(eq(collaborators.userId, dbUser.id))
    .orderBy(desc(projects.updatedAt))

  return userProjects
}
