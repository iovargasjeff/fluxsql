import { Code2, Users, GitBranch, Share2, FileCode, Zap, LucideIcon } from 'lucide-react'

const iconMap: Record<string, LucideIcon> = {
  Code2,
  Users,
  GitBranch,
  Share2,
  FileCode,
  Zap,
}

const features = [
  {
    icon: 'Code2',
    color: '#1A6CF6',
    title: 'SQL → Diagrama al instante',
    desc: 'Pega cualquier CREATE TABLE y el canvas genera el diagrama ER en tiempo real.',
  },
  {
    icon: 'Users',
    color: '#10B981',
    title: 'Colaboración en tiempo real',
    desc: 'Invita a tu equipo y trabajen juntos. Ven cursores y cambios al instante.',
  },
  {
    icon: 'GitBranch',
    color: '#8B5CF6',
    title: 'Control de versiones',
    desc: 'Guarda snapshots con mensaje y restaura el estado anterior si algo sale mal.',
  },
  {
    icon: 'Share2',
    color: '#F59E0B',
    title: 'Compartir sin registro',
    desc: 'Genera un link público para que tu profesor vea el esquema sin crear cuenta.',
  },
  {
    icon: 'FileCode',
    color: '#EF4444',
    title: 'Exportar a Mermaid',
    desc: 'Copia la sintaxis erDiagram con un clic y pégala en tu README.md.',
  },
  {
    icon: 'Zap',
    color: '#06B6D4',
    title: 'Monaco Editor integrado',
    desc: 'El mismo editor de VS Code en el browser, con resaltado SQL y autocompletado.',
  },
]

export function FeaturesSection() {
  return (
    <section className="py-20 px-4 bg-[#0D1117]">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-4">
          <span className="text-[#1A6CF6] text-sm font-medium uppercase tracking-wider">
            Todo lo que necesitas
          </span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-4">
          Diseñado para estudiantes de bases de datos
        </h2>
        <p className="text-[#9CA3AF] text-lg max-w-2xl mx-auto text-center">
          Desde el primer CREATE TABLE hasta la presentación final, DBCanvas te acompaña en cada paso del proyecto.
        </p>

        {/* Feature cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
          {features.map((feature) => {
            const Icon = iconMap[feature.icon]
            return (
              <div
                key={feature.title}
                className="p-6 bg-[#111827] rounded-xl border border-[#1E2A45] hover:border-[#2A3A55] transition-all duration-200 group"
                style={{ transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease' }}
              >
                {/* Icon */}
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                  style={{ backgroundColor: `${feature.color}20` }}
                >
                  <Icon size={20} style={{ color: feature.color }} />
                </div>

                {/* Content */}
                <h3 className="text-white font-semibold mb-2">{feature.title}</h3>
                <p className="text-[#6B7280] text-sm leading-relaxed">{feature.desc}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
