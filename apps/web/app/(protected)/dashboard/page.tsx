import { getProjectsByUser } from '@/actions/projects/list'
import { ProjectGrid } from '@/components/dashboard/ProjectGrid'
import { logoutAction } from '@/actions/auth/logout'
import { Button } from '@/components/ui/button'
import { LogOut, DatabaseZap } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch dbUser id for ownership comparison
  let dbUserId = ''
  if (user) {
    const [dbUser] = await db.select({ id: users.id }).from(users).where(eq(users.authId, user.id)).limit(1)
    dbUserId = dbUser?.id ?? ''
  }

  const projects = await getProjectsByUser()

  return (
    <div className="min-h-screen bg-[#0A0F1E] text-white">
      <header className="border-b border-[#1E2A45] bg-[#111827] sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#1A6CF6] to-[#00D4FF] flex items-center justify-center shadow-lg shadow-[#1A6CF6]/20">
              <DatabaseZap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-[#E2E8F0]">FluxSQL</span>
          </div>
          <form action={logoutAction}>
            <Button type="submit" variant="ghost" size="sm" className="text-[#94A3B8] hover:text-white hover:bg-[#1E2A45] transition-colors">
              <LogOut className="w-4 h-4 mr-2" />
              Salir
            </Button>
          </form>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10 max-w-6xl">
        <ProjectGrid projects={projects} currentUserId={dbUserId} />
      </main>
    </div>
  )
}
