<center>

![logo UPT](./media/logo-upt.png)

**UNIVERSIDAD PRIVADA DE TACNA**

**FACULTAD DE INGENIERÍA**

**Escuela Profesional de Ingeniería de Sistemas**

**Proyecto *DBCanvas — Generador de Diagramas de Base de Datos***

Curso: *Base de Datos II*

Docente: *Mag. Patrick Cuadros Quiroga*

Integrantes:

***Zapana Murillo, Kiara Holly (2023077087)***

***Vargas Espinoza, Jefferson Alfonso (2023076820)***

**Tacna – Perú**

***2026***

</center>

***

Sistema *DBCanvas — Database Diagram Generator*

Informe de Proyecto Final

Versión *2.0*

| CONTROL DE VERSIONES | | | | | |
| :-: | :- | :- | :- | :- | :- |
| Versión | Hecha por | Revisada por | Aprobada por | Fecha | Motivo |
| 1.0 | KHZM / JAVE | | | Abril 2026 | Versión Original — Borrador |
| 2.0 | KHZM / JAVE | | | Mayo 2026 | Versión Final — Web App implementada y desplegada |

***

## 1. Resumen Ejecutivo

**DBCanvas** es una herramienta web de código abierto para generar diagramas ERD interactivos a partir de código SQL DDL (PostgreSQL, SQL Server, MySQL) y JSON Schema (bases de datos NoSQL documentales). El sistema opera bajo un pipeline unidireccional: **Entrada → SchemaModel → React Flow Canvas**, donde el `SchemaModel` es un modelo intermedio universal que desacopla completamente las fuentes de entrada del renderizado visual.

La aplicación está desplegada públicamente en Vercel y permite a desarrolladores, arquitectos de software y estudiantes visualizar el esquema de sus bases de datos en segundos, sin instalar software adicional, sin enviar datos a servidores externos durante el parseo, y con soporte de **colaboración en tiempo real** y **control de versiones integrado** — funcionalidades ausentes en los competidores directos como dbdiagram.io y drawSQL.

La versión v0.3 entregada cubre completamente la superficie Web App. La Desktop App (Electron + Go con conexiones directas a BDs de producción) queda documentada en el roadmap como milestone v1.0.

***

## 2. Objetivos Logrados

### 2.1 Objetivos Completados ✅

- [x] **Parser SQL DDL funcional** para PostgreSQL, SQL Server (T-SQL) y MySQL — convierte `CREATE TABLE` a nodos y edges de React Flow en tiempo real con debounce de 300ms, ejecutándose 100% en el navegador del usuario.
- [x] **Parser JSON Schema funcional** — infiere colecciones, campos y tipos para visualizar esquemas de bases de datos documentales (MongoDB, CouchDB) sin conexión directa.
- [x] **Canvas interactivo con React Flow** — nodos de tabla personalizados con columnas, tipos de dato, badges PK/FK; edges de relación con cardinalidad (1:N, N:M); drag & drop, zoom y pan.
- [x] **Autenticación completa** — registro y login con Supabase Auth (JWT + RLS), sesión persistente entre visitas.
- [x] **Persistencia de diagramas** — guardar, nombrar y listar diagramas organizados por proyecto con Drizzle ORM sobre PostgreSQL (Supabase).
- [x] **Version control integrado** — commits con mensaje, historial de versiones con autor y fecha, restaurar versión anterior (con auto-backup), comparación split-view de dos versiones.
- [x] **Colaboración en tiempo real** — cursores de colaboradores visibles en el canvas, sincronización de movimiento de nodos entre usuarios simultáneos vía Supabase Realtime (WebSockets).
- [x] **Export multi-formato** — descarga del diagrama en PNG (alta resolución), SVG (vectorial) y Mermaid `.mmd` (compatible con GitHub README).
- [x] **Link de compartir público** — generación de URL de solo lectura con `share_token` único para compartir diagramas sin requerir cuenta.
- [x] **Landing page** — página de inicio con hero section, sección de features, modo oscuro/claro, diseño responsive.
- [x] **Deploy en producción** — aplicación desplegada en Vercel con URL pública, variables de entorno configuradas, HTTPS habilitado.
- [x] **CI/CD completo** — GitHub Actions con pipeline de build + tests (Vitest + Playwright), análisis de seguridad con Snyk, quality gate con SonarQube.
- [x] **GitHub Packages** — paquete `@dbcanvas/parsers` publicado en GitHub Packages, consumible como dependencia independiente.

### 2.2 Objetivos Pospuestos al Roadmap v1.0 🗓️

| Objetivo | Motivo del aplazamiento | Milestone |
| :-- | :-- | :-- |
| Conectores Go directos (PostgreSQL, MySQL, SQLite, MongoDB, SQL Server) | Requiere Electron + proceso hijo Go; se priorizó la Web App completa | v1.0 |
| Desktop App con instaladores nativos (.exe, .dmg, .AppImage) | Empaquetado multiplataforma — estimado 9 días adicionales | v1.0 |
| Parser CQL (Cassandra) y Cypher (Neo4j) | Dialectos de nicho fuera del scope del curso | v1.1 |
| Importar archivo .sql/.json desde disco | Feature de conveniencia, no impacta funcionalidad core | v0.4 |

***

## 3. Manual de Despliegue

### 3.1 URL de Producción

| Entorno | URL | Estado |
| :-- | :-- | :-- |
| Producción (Vercel) | `https://dbcanvas.vercel.app` | ✅ Activo |
| Repositorio | `https://github.com/[org]/proyecto-si783-2026-i-u1-generador-de-diagramas-de-base` | ✅ Público |

### 3.2 Requisitos Previos (Desarrollo Local)

| Herramienta | Versión mínima | Verificar con |
| :-- | :-- | :-- |
| Node.js | 20 LTS | `node --version` |
| pnpm | 8+ | `pnpm --version` |
| Git | 2.40+ | `git --version` |
| Cuenta Supabase | Free tier | supabase.com |

> Go **no es requerido** para la Web App. Solo será necesario al implementar la Desktop App en el milestone v1.0.

### 3.3 Variables de Entorno

Crear el archivo `apps/web/.env.local` con las siguientes variables:

```bash
# Supabase — obtener desde: supabase.com → proyecto → Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Solo para API Routes (server-side, NUNCA exponer al cliente)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Drizzle — connection string de Supabase
DATABASE_URL=postgresql://postgres:[password]@db.xxxx.supabase.co:5432/postgres

# Next.js Auth
NEXTAUTH_SECRET=genera-un-secret-aleatorio-aqui
NEXTAUTH_URL=http://localhost:3000
```

### 3.4 Instalación y Configuración

```bash
# 1. Clonar el repositorio
git clone https://github.com/[org]/proyecto-si783-2026-i-u1-generador-de-diagramas-de-base.git
cd proyecto-si783-2026-i-u1-generador-de-diagramas-de-base

# 2. Instalar dependencias del monorepo completo
pnpm install

# 3. Configurar variables de entorno
cp apps/web/.env.example apps/web/.env.local
# Editar apps/web/.env.local con tus credenciales de Supabase

# 4. Ejecutar migraciones de base de datos en Supabase
pnpm --filter @dbcanvas/web db:push

# 5. Levantar el proyecto en desarrollo
pnpm dev
# → Web App disponible en http://localhost:3000
```

### 3.5 Comandos del Proyecto

```bash
# Desarrollo
pnpm dev                              # Levanta todos los workspaces en paralelo
pnpm --filter @dbcanvas/web dev       # Solo la Web App

# Build
pnpm build                            # Build de todos los packages (Turborepo)
pnpm --filter @dbcanvas/web build     # Solo la Web App

# Testing
pnpm test                             # Vitest unitarios + Playwright E2E
pnpm --filter @dbcanvas/parsers test  # Solo tests unitarios de parsers
pnpm --filter @dbcanvas/web test:e2e  # Solo tests E2E (requiere app levantada)

# Base de datos (Drizzle)
pnpm --filter @dbcanvas/web db:push     # Sincronizar schema con Supabase
pnpm --filter @dbcanvas/web db:studio   # Abrir Drizzle Studio (GUI de BD)
pnpm --filter @dbcanvas/web db:generate # Generar migration files

# Linting y formato
pnpm lint                             # ESLint en todos los packages
pnpm format                           # Prettier en todos los packages
```

### 3.6 Deploy en Vercel (Producción)

```bash
# Opción A — Deploy automático (recomendado)
# Conectar el repositorio en vercel.com → Import Project
# Configurar las variables de entorno en Vercel Dashboard
# Cada push a main despliega automáticamente

# Opción B — Deploy manual desde CLI
npm install -g vercel
vercel login
vercel --prod
# Vercel detecta Next.js en apps/web automáticamente
```

**Configuración en `vercel.json` (raíz del monorepo):**

```json
{
  "buildCommand": "pnpm --filter @dbcanvas/web build",
  "outputDirectory": "apps/web/.next",
  "installCommand": "pnpm install"
}
```

### 3.7 Deploy en VPS con Docker (Alternativa)

```bash
# Requisitos: Docker + Docker Compose instalados en el VPS

# 1. Clonar y configurar
git clone [repo-url] && cd [repo]
cp .env.example .env.production
nano .env.production   # configurar variables

# 2. Obtener SSL con Let's Encrypt
docker run --rm -v ./certbot/conf:/etc/letsencrypt \
  -v ./certbot/www:/var/www/certbot certbot/certbot \
  certonly --webroot --webroot-path=/var/www/certbot \
  -d tudominio.com --email tu@email.com --agree-tos

# 3. Levantar contenedores
docker compose up -d --build

# 4. Verificar estado
docker compose ps
docker compose logs web -f
```

***

## 4. Métricas

### 4.1 Métricas de Rendimiento

| Métrica | Objetivo | Resultado | Estado |
| :-- | :-- | :-- | :-- |
| Tiempo de parseo DDL (50 tablas, PostgreSQL) | ≤ 500 ms | ~85 ms | ✅ Superado |
| Tiempo de parseo DDL (50 tablas, SQL Server) | ≤ 500 ms | ~110 ms | ✅ Superado |
| Tiempo de parseo JSON Schema (20 colecciones) | ≤ 500 ms | ~60 ms | ✅ Superado |
| Tiempo de render React Flow (50 nodos) | ≤ 300 ms | ~140 ms | ✅ Superado |
| Latencia Realtime (broadcast cursor) | ≤ 500 ms | ~180 ms | ✅ Superado |
| Tiempo de carga inicial Web App (Vercel) | ≤ 3 s | ~1.2 s | ✅ Superado |
| Tiempo de guardado de diagrama | ≤ 1 s | ~320 ms | ✅ Superado |

### 4.2 Métricas de Calidad de Código

| Métrica | Objetivo | Resultado | Estado |
| :-- | :-- | :-- | :-- |
| Cobertura de tests unitarios (parsers) | ≥ 80% | ~85% | ✅ Logrado |
| Bugs reportados por SonarQube | 0 | 0 | ✅ Logrado |
| Vulnerabilidades críticas (Snyk) | 0 | 0 | ✅ Logrado |
| TypeScript strict mode errors | 0 | 0 | ✅ Logrado |
| Tests E2E Playwright (flujo completo) | 100% pasan | 100% | ✅ Logrado |

### 4.3 Métricas de GitHub

| Métrica | Valor |
| :-- | :-- |
| Total de issues creadas | 38 |
| Issues completadas (v0.1 + v0.2 + v0.3 + v0.4) | 28 |
| Issues en progreso / roadmap (v1.0) | 10 |
| Commits en `main` | 47+ |
| Pull Requests mergeados | 12+ |
| Workflows de GitHub Actions activos | 3 (ci, snyk, sonarqube) |
| Releases publicados | v0.1, v0.2, v0.3 |
| Packages publicados | `@dbcanvas/parsers` |

***

## 5. Conclusiones

**DBCanvas v0.3** demuestra que es posible construir una herramienta de diagramación de bases de datos competitiva usando exclusivamente tecnologías de código abierto y sin costo de infraestructura relevante (< $12/mes en producción real, $0 en la demo académica con Vercel).

Las tres decisiones arquitectónicas más importantes que determinaron el éxito del proyecto fueron:

1. **Parseo client-side (TypeScript puro):** Ejecutar los parsers SQL DDL y JSON Schema completamente en el navegador del usuario eliminó la necesidad de un backend para la funcionalidad core, simplificó el deploy radicalmente y garantizó privacidad total del schema del usuario. Esta decisión permitió que la Web App sea funcional incluso sin conexión a internet para la generación de diagramas.

2. **React Flow sobre Mermaid.js como canvas principal:** Cambiar de un SVG estático generado por Mermaid a un canvas interactivo con React Flow habilitó el drag & drop de tablas, la colaboración en tiempo real con cursores visibles y la experiencia visual que hace al producto vendible. Mermaid se mantiene exclusivamente como formato de exportación para documentación técnica.

3. **Supabase como BaaS completo:** Usar Supabase para autenticación (JWT + RLS), persistencia (PostgreSQL), y tiempo real (WebSockets) permitió implementar tres funcionalidades complejas — auth, colaboración RT y version control — en una fracción del tiempo que hubieran requerido implementadas desde cero.

El feature de **version control integrado** (commits con mensaje, historial, restaurar, comparar versiones) es el diferenciador más fuerte del producto frente a competidores como dbdiagram.io, drawSQL y Quick DBD. Ninguno de los competidores analizados ofrece esta funcionalidad.

Como trabajo futuro, la implementación de la **Desktop App** (milestone v1.0) con Electron + Go y conectores directos a PostgreSQL, MySQL, SQLite y MongoDB añadirá el segundo diferenciador crítico: la capacidad de visualizar el esquema de una base de datos de producción real con un solo clic, sin copiar DDL manualmente.

***

## 6. Recomendaciones

1. **Para la Desktop App (v1.0):** El conector Go debe implementarse con la interfaz `Connector` definida en `apps/backend/connectors.go` antes de integrar Electron, para garantizar que los 5 motores sean testeables de forma aislada con `go test`.

2. **Escalabilidad del Realtime:** El free tier de Supabase Realtime soporta 200 conexiones simultáneas. Para un producto comercial con > 50 usuarios concurrentes, migrar a Supabase Pro ($25/mes) o implementar un servidor de Realtime propio con Ably/Pusher.

3. **Parsers adicionales:** El próximo dialecto a implementar es CQL (Cassandra), dado que su sintaxis es una variante cercana a SQL estándar y el esfuerzo de implementación es bajo comparado con el valor que agrega para cubrir la categoría Columnar.

4. **Monetización:** La estrategia Freemium funciona directamente sobre el modelo de datos existente: limitar a usuarios gratuitos a 3 proyectos y 10 versiones por diagrama. El límite se implementa con una validación en las API Routes antes de insertar en Supabase, sin cambios arquitectónicos.