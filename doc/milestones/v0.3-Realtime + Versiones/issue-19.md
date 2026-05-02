# Issue #19 — Invitar Colaborador al Proyecto

**Milestone:** v0.3 — Realtime + Versiones
**Branch:** `feat/issue-19-invite-collaborator`
**Depende de:** Milestone v0.2 completo ✅
**Estado:** ⬜ Pendiente

---

## Historia de Usuario

Como dueño de un proyecto, quiero invitar a otros estudiantes por correo para que editen mi diagrama juntos.

---

## Criterios de Aceptación

- [ ] Modal "Invitar colaborador" en la configuración del proyecto
- [ ] Busca el correo en la tabla `users` (auth.users via profiles)
- [ ] Si existe → INSERT en `collaborators` con rol `editor`
- [ ] Si no existe → mensaje "El usuario debe registrarse primero"

---

## Arquitectura

### Estructura de archivos

```
apps/web/
├── actions/projects/
│   └── invite.ts                    ← NUEVO — Server Action
└── components/dashboard/
    └── InviteCollaboratorModal.tsx  ← NUEVO — Modal shadcn
```

### Tabla collaborators — verificar en schema.ts

```typescript
// lib/db/schema.ts — debe existir desde Issue #2
export const collaborators = pgTable('collaborators', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull(),
  role: text('role').default('editor'),  // 'editor' | 'viewer'
  createdAt: timestamp('created_at').defaultNow(),
})
```

---

## Patrones y Reglas

### Server Action invite.ts

```typescript
// actions/projects/invite.ts
"use server"
import { createClient } from "@/lib/supabase/server"
import { db } from "@/lib/db"
import { collaborators, projects } from "@/lib/db/schema"
import { and, eq } from "drizzle-orm"

export async function inviteCollaboratorAction(email: string, projectId: string) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { error: "No autenticado" }

  // Verificar que el invitante es el dueño del proyecto
  const project = await db.query.projects.findFirst({
    where: and(eq(projects.id, projectId), eq(projects.ownerId, user.id))
  })
  if (!project) return { error: "No tienes permisos para invitar a este proyecto" }

  // Buscar el usuario por email en auth.users via Supabase Admin
  const { data: invitedUser, error: userError } = await supabase
    .from('profiles')      // tabla profiles vinculada a auth.users
    .select('id')
    .eq('email', email)
    .single()

  if (userError || !invitedUser) {
    return { error: "El usuario no está registrado en DBCanvas" }
  }

  // Verificar que no es ya colaborador
  const alreadyCollaborator = await db.query.collaborators.findFirst({
    where: and(
      eq(collaborators.projectId, projectId),
      eq(collaborators.userId, invitedUser.id)
    )
  })
  if (alreadyCollaborator) return { error: "El usuario ya es colaborador" }

  // Insertar colaborador
  await db.insert(collaborators).values({
    projectId,
    userId: invitedUser.id,
    role: 'editor',
  })

  return { success: true, message: "Colaborador añadido correctamente" }
}
```

### InviteCollaboratorModal.tsx

```tsx
// components/dashboard/InviteCollaboratorModal.tsx
"use client"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { inviteCollaboratorAction } from "@/actions/projects/invite"
import { toast } from "sonner"

export function InviteCollaboratorModal({ projectId }: { projectId: string }) {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)

    const result = await inviteCollaboratorAction(email.trim(), projectId)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(result.message ?? "Colaborador añadido")
      setEmail("")
    }
    setLoading(false)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="px-3 py-1.5 bg-[#1E2A45] hover:bg-[#2A3A55] text-white text-sm rounded transition-colors">
          + Invitar
        </button>
      </DialogTrigger>
      <DialogContent className="bg-[#111827] border-[#1E2A45]">
        <DialogHeader>
          <DialogTitle className="text-white">Invitar colaborador</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleInvite} className="flex flex-col gap-3 mt-2">
          <input
            type="email"
            placeholder="correo@ejemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-[#1E2A45] border border-[#2A3A55] text-white placeholder-[#6B7280] px-3 py-2 rounded text-sm focus:outline-none focus:border-[#1A6CF6]"
          />
          <button
            type="submit"
            disabled={loading || !email.trim()}
            className="bg-[#1A6CF6] hover:bg-blue-700 disabled:opacity-50 text-white py-2 rounded text-sm transition-colors"
          >
            {loading ? "Invitando..." : "Invitar"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
```

---

## Errores Comunes y Cómo Evitarlos

| Error | Causa | Solución |
|---|---|---|
| `profiles` tabla no existe | Solo existe `auth.users` | Crear tabla `profiles` vinculada a `auth.users` con trigger en Supabase |
| Invitar al dueño del proyecto | No se valida que el email sea diferente al dueño | Añadir check: `if (invitedUser.id === user.id) return { error: "No puedes invitarte a ti mismo" }` |
| RLS bloquea el INSERT | La política de `collaborators` solo permite al owner | Verificar que la política RLS del server permite inserts desde server-side |

---

## Verificación Final

1. Abrir configuración de un proyecto → clic "+ Invitar"
2. Ingresar email de otro usuario registrado → Toast "Colaborador añadido" ✅
3. Ingresar email inexistente → Toast "El usuario no está registrado en DBCanvas" ✅
4. Ingresar email del mismo usuario → Toast "No puedes invitarte a ti mismo" ✅

```bash
pnpm build  # Sin errores
```
