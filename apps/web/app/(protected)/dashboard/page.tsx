import { getProjectsByUser } from '@/actions/projects/list'
import { ProjectList } from '@/components/dashboard/ProjectList'
import { logoutAction } from '@/actions/auth/logout'
import { Button } from '@/components/ui/button'
import { LogOut, DatabaseZap } from 'lucide-react'

export default async function DashboardPage() {
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
        <ProjectList projects={projects} />
      </main>
    </div>
  )
}
