import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { HeroSection } from '@/components/landing/HeroSection'
import { FeaturesSection } from '@/components/landing/FeaturesSection'
import { PricingSection } from '@/components/landing/PricingSection'
import { Footer } from '@/components/landing/Footer'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <main className="min-h-screen bg-[#0A0F1E]">
      <HeroSection />
      <FeaturesSection />
      <PricingSection />
      <Footer />
    </main>
  )
}
