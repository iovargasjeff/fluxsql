import { GitFork } from 'lucide-react'

const GITHUB_URL = 'https://github.com/UPT-FAING-EPIS/proyecto-si783-2026-i-u1-generador-de-diagramas-de-base'

export function Footer() {
  return (
    <footer className="bg-[#0D1117] py-10 px-4" style={{ borderTop: '1px solid #1E2A45' }}>
      <div className="max-w-6xl mx-auto">
        {/* Top row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-8">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#1A6CF6] rounded flex items-center justify-center">
              <span className="text-white text-xs font-bold">DB</span>
            </div>
            <span className="text-white font-semibold">DBCanvas</span>
          </div>

          {/* Nav links */}
          <nav className="flex items-center gap-6 text-sm text-[#6B7280]">
            <a href="/login" className="hover:text-white transition-colors">
              Iniciar sesión
            </a>
            <a href="/register" className="hover:text-white transition-colors">
              Registrarse
            </a>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors flex items-center gap-1"
            >
              <GitFork size={14} /> GitHub
            </a>
          </nav>
        </div>

        {/* Divider */}
        <div style={{ borderTop: '1px solid #1E2A45', marginBottom: '1.5rem' }} />

        {/* Credits */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#6B7280]">
          <p>
            © 2026 DBCanvas — Desarrollado por{' '}
            <span className="text-[#9CA3AF] font-medium">Jefferson</span> y{' '}
            <span className="text-[#9CA3AF] font-medium">Kiara</span>
          </p>
          <p>
            Proyecto académico —{' '}
            <span className="text-[#9CA3AF]">Universidad Privada de Tacna (UPT)</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
