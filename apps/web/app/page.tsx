import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { HeroSection } from '@/components/landing/HeroSection'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <main className="min-h-screen bg-[#0A0F1E]">
      <HeroSection />
    </main>
  )
}
