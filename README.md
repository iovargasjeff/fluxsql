<div align="center">

# 🗃️ DBCanvas
### Database Diagram Generator

**Genera diagramas ERD interactivos desde SQL DDL o JSON Schema — en segundos, en tu navegador, sin enviar datos a ningún servidor.**

[![Deploy](https://img.shields.io/badge/deploy-vercel-black?logo=vercel)](https://dbcanvas.vercel.app)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Supabase-realtime-3ecf8e?logo=supabase)](https://supabase.com)
[![CI](https://github.com/[org]/proyecto-si783-2026-i/actions/workflows/ci.yml/badge.svg)](https://github.com/[org]/proyecto-si783-2026-i/actions)
[![Snyk](https://img.shields.io/badge/security-snyk-purple?logo=snyk)](https://snyk.io)

[🚀 Demo en vivo](https://dbcanvas.vercel.app) · [📖 Wiki](../../wiki) · [🐛 Reportar bug](../../issues/new) · [🗺️ Roadmap](../../milestones)

</div>

---

## ¿Qué es DBCanvas?

DBCanvas es una herramienta web open source que convierte código SQL DDL o JSON Schema en diagramas ERD interactivos con **drag & drop**, colaboración en tiempo real y version control integrado.

El parseo ocurre **100% en tu navegador** — tu schema nunca sale de tu máquina durante la generación del diagrama.

SQL DDL / JSON Schema → SchemaModel → React Flow Canvas → PNG / SVG / .mmd


---

## ✨ Features

| Feature | Descripción |
| :-- | :-- |
| 🔄 **Parser Multi-Dialecto** | PostgreSQL, SQL Server (T-SQL) y MySQL en un solo editor |
| 📄 **Parser JSON Schema** | Visualiza esquemas NoSQL (MongoDB, CouchDB) desde JSON Schema |
| 🖱️ **Canvas Drag & Drop** | Tablas reposicionables, zoom, pan — diagrama interactivo con React Flow |
| ⚡ **Sync en tiempo real** | Editor DDL ↔ Canvas con debounce 300ms, sin recargar |
| 🕐 **Version Control** | Commits con mensaje, historial, restaurar versiones, comparar en split-view |
| 👥 **Colaboración RT** | Cursores de colaboradores visibles + sync de nodos vía Supabase Realtime |
| 📤 **Export Multi-formato** | PNG (alta resolución), SVG (vectorial), Mermaid `.mmd` |
| 🔗 **Link público** | Comparte diagramas en modo viewer sin requerir cuenta |
| 🔐 **Auth completa** | Registro, login, sesión persistente, RLS por usuario |
| 🌙 **Dark Mode** | Tema oscuro/claro con persistencia |

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología |
| :-- | :-- |
| Framework | Next.js 14 App Router + TypeScript |
| Monorepo | pnpm workspaces + Turborepo |
| Canvas | React Flow |
| Editor | Monaco Editor |
| Parsers | `@dbcanvas/parsers` — TypeScript puro, zero-dependency, client-side |
| UI | TailwindCSS + shadcn/ui |
| ORM | Drizzle ORM |
| Base de datos | Supabase PostgreSQL |
| Auth | Supabase Auth (JWT + RLS) |
| Realtime | Supabase Realtime (WebSockets) |
| Testing | Vitest (unitario) + Playwright (E2E) |
| CI/CD | GitHub Actions (build + Snyk + SonarQube) |
| Deploy | Vercel / Docker + Nginx |

---

## 🚀 Inicio Rápido

### Requisitos

- Node.js 20 LTS
- pnpm 8+
- Cuenta en [Supabase](https://supabase.com) (free tier)

### 1. Clonar e instalar

```bash
git clone https://github.com/[org]/proyecto-si783-2026-i-u1-generador-de-diagramas-de-base.git
cd proyecto-si783-2026-i-u1-generador-de-diagramas-de-base
pnpm install
```

### 2. Variables de entorno

```bash
cp apps/web/.env.example apps/web/.env.local
```

Editar `apps/web/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
DATABASE_URL=postgresql://postgres:[password]@db.xxxx.supabase.co:5432/postgres
NEXTAUTH_SECRET=tu-secret-aleatorio
NEXTAUTH_URL=http://localhost:3000
```

> 💡 Obtén las keys en `supabase.com → tu proyecto → Settings → API`

### 3. Migraciones y desarrollo

```bash
pnpm --filter @dbcanvas/web db:push   # Crea las tablas en Supabase
pnpm dev                               # App en http://localhost:3000
```

---

## 📦 Comandos

```bash
# Desarrollo
pnpm dev                              # Levanta todo el monorepo
pnpm --filter @dbcanvas/web dev       # Solo la Web App

# Build
pnpm build                            # Build de todos los packages

# Testing
pnpm test                             # Vitest + Playwright
pnpm --filter @dbcanvas/parsers test  # Solo tests unitarios de parsers
pnpm --filter @dbcanvas/web test:e2e  # Solo tests E2E

# Base de datos (Drizzle)
pnpm --filter @dbcanvas/web db:push     # Sincronizar schema
pnpm --filter @dbcanvas/web db:studio   # Abrir GUI de BD
pnpm --filter @dbcanvas/web db:generate # Generar migration files

# Calidad
pnpm lint
pnpm format
```

---

## 🐳 Deploy con Docker (VPS)

```bash
# Configurar entorno
cp .env.example .env.production
nano .env.production

# SSL con Let's Encrypt
docker run --rm -v ./certbot/conf:/etc/letsencrypt \
  -v ./certbot/www:/var/www/certbot certbot/certbot \
  certonly --webroot --webroot-path=/var/www/certbot \
  -d tudominio.com --email tu@email.com --agree-tos

# Levantar
docker compose up -d --build

# Verificar
docker compose ps
docker compose logs web -f
```

---

## 🗂️ Estructura del Monorepo

dbcanvas/
├── apps/
│ └── web/ ← Next.js 14 App Router
├── packages/
│ ├── parsers/ ← @dbcanvas/parsers (TypeScript puro)
│ └── ui/ ← @dbcanvas/ui (React components)
├── doc/ ← Documentación académica FD01–FD06
└── .github/
└── workflows/ ← ci.yml · snyk.yml · sonarqube.yml


---

## 🗺️ Roadmap

| Versión | Estado | Descripción |
| :--: | :--: | :-- |
| v0.1 | ✅ | Setup monorepo, Drizzle schema, Supabase Auth, CI/CD |
| v0.2 | ✅ | Parsers SQL (PG/MySQL/MSSQL) + JSON Schema, React Flow canvas |
| v0.3 | ✅ | Version control, Realtime colaboración, export PNG/SVG/mmd, link público |
| v0.4 | ✅ | Landing page, dark mode, toolbar, deploy Vercel, SonarQube |
| v1.0 | 🗓️ | Desktop App — Electron + Go con conexiones directas a BDs |

---

## 👥 Equipo

| Integrante | Rol | GitHub |
| :-- | :-- | :-- |
| **Vargas Espinoza, Jefferson** (2023076820) | Monorepo · Parsers · React Flow · API Routes · Realtime · CI/CD | [@JeffVargas](https://github.com/JeffVargas) |
| **Zapana Murillo, Kiara** (2023077087) | Landing · Dashboard · Dark mode · Onboarding · Tests E2E | [@KiaraZapana](https://github.com/KiaraZapana) |

---

## 📄 Documentación Académica

| Documento | Descripción |
| :-- | :-- |
| [FD01 — Factibilidad](./doc/FD01-Informe-Factibilidad-2.md) | Análisis económico, técnico y legal del proyecto |
| [FD02 — Visión](./doc/FD02-Informe-Vision-3.md) | Stakeholders, capacidades del producto, roadmap |
| [FD03 — Requerimientos](./doc/FD03-Informe-Especificacion-Requerimientos-4.md) | Issues en formato Como/Quiero/Para + criterios Gherkin |
| [FD04 — Arquitectura](./doc/FD04-Informe-Arquitectura-Software-5.md) | Diagramas de clases, BD, componentes, despliegue e infraestructura |
| [FD05 — Proyecto Final](./doc/FD05-Informe-ProyectoFinal-6.md) | Resumen ejecutivo, métricas, conclusiones y manual de deploy |

---

## 📝 Licencia

MIT © 2026 — Zapana Murillo, Kiara Holly & Vargas Espinoza, Jefferson Alfonso  
Universidad Privada de Tacna · Escuela de Ingeniería de Sistemas · Base de Datos II