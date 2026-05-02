'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { projects, collaborators, users } from '@/lib/db/schema'
import { revalidatePath } from 'next/cache'
import { eq } from 'drizzle-orm'

const CreateProjectSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio").max(50, "Máximo 50 caracteres"),
  description: z.string().max(200, "Máximo 200 caracteres").optional(),
})

export async function createProjectAction(formData: FormData) {
  const name = formData.get('name') as string
  const description = formData.get('description') as string

  const result = CreateProjectSchema.safeParse({ name, description })
  if (!result.success) {
    return { error: result.error.issues[0].message }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'No autenticado' }
  }

  try {
    const [dbUser] = await db.select().from(users).where(eq(users.authId, user.id)).limit(1)
    
    if (!dbUser) {
      return { error: 'Usuario no encontrado en la base de datos' }
    }

    const newProject = await db.transaction(async (tx) => {
      const [project] = await tx.insert(projects).values({
        name: result.data.name,
        description: result.data.description || null,
        ownerId: dbUser.id,
      }).returning()

      await tx.insert(collaborators).values({
        projectId: project.id,
        userId: dbUser.id,
        role: 'owner',
      })

      return project
    })

    revalidatePath('/dashboard')
    return { success: true, project: newProject }
  } catch (error) {
    console.error('Error creating project:', error)
    return { error: 'Error interno al crear el proyecto' }
  }
}
