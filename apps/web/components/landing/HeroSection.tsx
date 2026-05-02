import Link from 'next/link'
import { AnimatedCanvas } from './AnimatedCanvas'

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 py-20 overflow-hidden">
      {/* Subtle radial gradient background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(26,108,246,0.15), transparent)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 w-full max-w-5xl flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
        {/* Left — copy */}
        <div className="flex-1 flex flex-col items-center lg:items-start gap-6 text-center lg:text-left">
          {/* Badge */}
          <span className="inline-flex items-center gap-2 bg-[#1E2A45] text-[#1A6CF6] text-xs font-medium px-3 py-1.5 rounded-full border border-[#1A6CF6]/20">
            ✦ Colaboración en tiempo real
          </span>

          {/* H1 */}
          <h1 className="text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
            Diseña tu base de datos
            <span className="block text-[#1A6CF6]">en equipo, en segundos</span>
          </h1>

          {/* Subtitle */}
          <p className="text-[#9CA3AF] text-lg max-w-md">
            Pega tu SQL, visualiza el diagrama ER al instante y colabora con tu equipo en tiempo real.
            Sin instalaciones.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mt-2">
            <Link
              href="/register"
              className="inline-flex items-center justify-center bg-[#1A6CF6] hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Empezar gratis →
            </Link>
            <a
              href="https://github.com/UPT-FAING-EPIS/proyecto-si783-2026-i-u1-generador-de-diagramas-de-base"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center border border-[#1E2A45] hover:border-[#1A6CF6] text-[#9CA3AF] hover:text-white px-6 py-3 rounded-lg transition-colors"
            >
              Ver en GitHub
            </a>
          </div>

          {/* Social proof */}
          <div className="flex items-center gap-4 mt-2 text-sm text-[#6B7280]">
            <span>✓ Gratis para comenzar</span>
            <span>✓ Sin tarjeta de crédito</span>
          </div>
        </div>

        {/* Right — animated canvas preview */}
        <div className="flex-1 w-full max-w-lg">
          <AnimatedCanvas />
        </div>
      </div>
    </section>
  )
}
