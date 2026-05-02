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

Propuesta de Proyecto

Versión *2.0*

| CONTROL DE VERSIONES | | | | | |
| :-: | :- | :- | :- | :- | :- |
| Versión | Hecha por | Revisada por | Aprobada por | Fecha | Motivo |
| 1.0 | KHZM / JAVE | | | Abril 2026 | Versión Original |
| 2.0 | KHZM / JAVE | | | Mayo 2026 | Actualización — Stack tecnológico final y features implementados |

***

## 1. Identificación del Proyecto

| Campo | Valor |
| :-- | :-- |
| Nombre | DBCanvas — Generador de Diagramas de Base de Datos |
| Estudiantes | Zapana Murillo, Kiara Holly (2023077087) / Vargas Espinoza, Jefferson Alfonso (2023076820) |
| Curso | Base de Datos II |
| Docente | Mag. Patrick Cuadros Quiroga |
| Repositorio | github.com/[org]/proyecto-si783-2026-i-u1-generador-de-diagramas-de-base |
| Deploy | https://dbcanvas.vercel.app |
| Licencia | MIT |

***

## 2. Descripción

DBCanvas es una herramienta web de código abierto que genera diagramas ERD interactivos automáticamente a partir de código SQL DDL o JSON Schema. A diferencia de herramientas existentes como dbdiagram.io, drawSQL o Quick DBD, DBCanvas:

1. **Soporta múltiples dialectos SQL en una sola herramienta:** PostgreSQL, SQL Server (T-SQL) y MySQL — los tres motores más usados en el mercado y los enseñados en el curso Base de Datos II.

2. **Parseo 100% local en el navegador:** Los parsers TypeScript se ejecutan en el cliente sin enviar el schema del usuario a ningún servidor externo, garantizando privacidad total. Cumple con la Ley N° 29733 de Protección de Datos Personales del Perú.

3. **Canvas interactivo drag & drop:** Las tablas se mueven libremente en el canvas (React Flow), a diferencia de los competidores que generan diagramas estáticos no reposicionables.

4. **Version control integrado:** Función única en el mercado — los usuarios pueden guardar "commits" del estado de su diagrama con mensaje descriptivo, ver el historial, restaurar versiones anteriores y comparar dos versiones lado a lado en split-view.

5. **Colaboración en tiempo real:** Múltiples usuarios pueden trabajar en el mismo diagrama simultáneamente con cursores visibles y sincronización de movimientos de tablas (Supabase Realtime).

6. **Es de código abierto** y completamente gratuito, publicado bajo licencia MIT.

***

## 3. Justificación

La documentación de esquemas de bases de datos es una práctica esencial pero frecuentemente descuidada en equipos de desarrollo. El análisis de herramientas existentes revela las siguientes brechas:

| Herramienta | Problema |
| :-- | :-- |
| MySQL Workbench / pgAdmin / DBeaver | Pesadas, ligadas a un motor específico, no tienen canvas web |
| DataGrip (JetBrains) | USD 229/año — costo prohibitivo para estudiantes y startups |
| dbdiagram.io | Envía el schema a servidores externos, sin drag & drop, sin version control |
| drawSQL | Sin soporte Multi-dialecto simultáneo, sin colaboración RT, sin version control |
| Quick DBD | Interfaz anticuada, sin soporte JSON Schema (NoSQL), sin colaboración |
| Miro / Lucidchart | Herramientas genéricas de diagramación, sin parsers SQL, sin inferencia automática |

DBCanvas resuelve todas estas brechas en un producto único, open source, con deploy en la nube accesible desde cualquier navegador, sin costo para el usuario final.

***

## 4. Stack Tecnológico

| Capa | Tecnología | Justificación |
| :-- | :-- | :-- |
| Monorepo | pnpm workspaces + Turborepo | Builds incrementales, desarrollo paralelo entre packages |
| Framework web | Next.js 14 App Router + TypeScript | SSR, API Routes nativas, mejor DX, edge-compatible |
| Canvas interactivo | React Flow | Drag & drop nativo, nodos personalizables, extensible |
| Editor de código | Monaco Editor | Mismo motor que VS Code, syntax highlighting SQL nativo |
| Export diagramas | Mermaid.js | Estándar de la industria para diagramas en documentación técnica |
| Parsers | TypeScript puro (`@dbcanvas/parsers`) | Client-side, zero-dependency, testeable con Vitest aislado |
| UI Components | TailwindCSS + shadcn/ui | Diseño consistente y accesible, sin runtime CSS-in-JS |
| ORM | Drizzle ORM | Type-safe, edge-compatible, sin generación de código, mejor DX con IA |
| Base de datos | Supabase PostgreSQL | Managed PostgreSQL con Drizzle migrations |
| Autenticación | Supabase Auth | JWT + RLS + OAuth listo, sin implementar auth desde cero |
| Tiempo real | Supabase Realtime | WebSockets gestionados, 200 conexiones concurrentes en free tier |
| Testing | Vitest (unitario) + Playwright (E2E) | Coverage de parsers + flujos críticos de usuario |
| CI/CD | GitHub Actions | Build + test + Snyk + SonarQube en cada push |
| Seguridad | Snyk + SonarQube Cloud | Análisis de dependencias y quality gate automáticos |
| Deploy | Vercel | Zero-config para Next.js, HTTPS automático, CDN global |
| Infraestructura | Terraform + Docker + Nginx | Reproducibilidad de entorno, deploy alternativo en VPS |

***

## 5. Cronograma Real Ejecutado

| Fase | Milestone | Descripción | Duración | Estado |
| :--: | :--: | :-- | :--: | :--: |
| 1 | v0.1 | Setup monorepo Next.js, Drizzle ORM, Supabase Auth, schema BD, CI/CD, Snyk | 5 días | ✅ Completado |
| 2 | v0.2 | Parsers SQL (PG/MySQL/MSSQL) + JSON Schema, React Flow canvas, Monaco Editor, sync editor↔canvas | 8 días | ✅ Completado |
| 3 | v0.3 | Persistencia diagramas, version control (commits/historial/restaurar/comparar), Realtime colaboración, export PNG/SVG/mmd, link público | 8 días | ✅ Completado |
| 4 | v0.4 | Landing page, dashboard UI, dark mode, toolbar, onboarding, animaciones, SonarQube workflow, deploy Vercel | 5 días | ✅ Completado |
| 5 | v1.0 | Desktop App: Electron + Go embebido, conectores PG/MySQL/SQLite/MongoDB/SQL Server, empaquetado multiplataforma | 9 días | 🗓️ Roadmap futuro |
| | **Total v0.4** | | **~26 días** | ✅ |

***

## 6. División de Trabajo

| Integrante | Responsabilidad Principal | Issues |
| :-- | :-- | :-- |
| **Vargas Espinoza, Jefferson** | Configuración del monorepo (pnpm + Turborepo), Drizzle ORM + Supabase schema y migraciones, parsers TypeScript (SQL DDL + JSON Schema), React Flow canvas + nodos/edges personalizados, API Routes (diagramas, versiones, colaboradores, share), Supabase Realtime (cursores + sync nodos), version control feature completo, GitHub Actions (CI, Snyk, SonarQube), GitHub Releases + Packages, deploy Vercel + Docker | #1–#28 |
| **Zapana Murillo, Kiara** | Landing page con hero animado y sección de features, dashboard de proyectos con grid de tarjetas, dark/light mode toggle, toolbar del editor/canvas, onboarding interactivo (5 pasos), animaciones y micro-interacciones con Framer Motion, diseño responsive desde 768px, shadcn/ui components library, tests E2E Playwright de los flujos de UI | #29–#38 |

***

## 7. Features del Producto Final

### 7.1 Funcionalidades Implementadas (v0.4)

| Feature | Descripción | Diferenciador |
| :-- | :-- | :-- |
| **Parser Multi-Dialecto** | Soporta PostgreSQL, SQL Server (T-SQL) y MySQL en un solo editor | ✅ Único entre competidores gratuitos |
| **Parser JSON Schema** | Visualiza esquemas NoSQL (MongoDB, CouchDB) desde JSON Schema | ✅ Cubre bases de datos documentales |
| **Canvas Drag & Drop** | Tablas reposicionables libremente, zoom, pan, selección múltiple | ✅ Competidores tienen diagramas estáticos |
| **Sync en tiempo real** | Editor DDL ↔ Canvas se actualizan mutuamente con debounce 300ms | ✅ |
| **Version Control** | Commits, historial, restaurar, comparar 2 versiones en split-view | ✅ Ausente en todos los competidores |
| **Colaboración RT** | Cursores visibles + sync de nodos entre múltiples usuarios | ✅ Solo Miro/Lucidchart lo tienen |
| **Export Multi-formato** | PNG, SVG, Mermaid .mmd descargables con un clic | ✅ |
| **Link público** | Compartir diagrama en modo viewer sin requerir cuenta | ✅ |
| **Auth completa** | Registro, login, sesión persistente, RLS por usuario | ✅ |
| **Proyectos** | Organizar diagramas en proyectos con colaboradores por rol | ✅ |
| **Dark Mode** | Tema oscuro/claro con persistencia en preferencias del usuario | ✅ |
| **Responsive** | Funcional desde 768px (tablet) hasta 4K | ✅ |

### 7.2 Roadmap v1.0 (Desktop App)

| Feature | Tecnología | Descripción |
| :-- | :-- | :-- |
| Conexión directa a PostgreSQL | Go + `lib/pq` | Extracción automática del schema real desde `information_schema` |
| Conexión directa a MySQL | Go + `go-sql-driver` | Compatible con MySQL 8 y MariaDB |
| Conexión directa a SQLite | Go + `go-sqlite3` | Lectura de `PRAGMA table_info` y `PRAGMA foreign_key_list` |
| Conexión directa a MongoDB | Go + `mongo-driver` | Inferencia de schema por sampling de 100 documentos con `$sample` |
| Conexión directa a SQL Server | Go + `go-mssqldb` | Compatible con SQL Server 2019+ y Azure SQL |
| Desktop App nativa | Electron 29 + electron-vite | Instaladores para Windows (.exe), macOS (.dmg), Linux (.AppImage) |
| Go backend embebido | electron-builder + `go build` | Binary Go compilado para 3 SO, empaquetado dentro del installer |