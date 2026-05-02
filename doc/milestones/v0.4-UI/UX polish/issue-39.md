# Issue #39 — Rediseño Auth: Vista Unificada Login + Registro (Split Layout)

**Milestone:** v0.5 — Auth & UX Redesign  
**Branch:** `feat/issue-39-auth-redesign`  
**Estado:** ✅ Completado  
**Commit:** `feat: rediseño de UI de login y register unificados (#39)`

---

## Objetivo

Rediseñar y unificar las vistas de Login y Registro en una sola interfaz de dos columnas
de alta fidelidad en modo oscuro, reemplazando las páginas separadas por un componente
centralizado `AuthView` que maneja ambos flujos mediante tabs.

---

## Diseño Visual de Referencia

**Estilo:** Dark mode sofisticado con paleta azul profundo (`#0B1120`), negro suave,
neón azul eléctrico (`#1A6CF6`) y resplandor de fondo.

**Composición:** Split 50/50 desktop. En mobile, solo se muestra el panel del formulario.

### Columna Izquierda (Marketing)
- Logo **"DBCanvas"** con ícono estilizado de base de datos
- Titular: *"Crea diagramas de bases de datos de forma profesional"*
- Descripción: *"DBCanvas te ayuda a modelar, visualizar y compartir tus bases de datos
  de manera rápida y eficiente."*
- Diagrama SVG animado: nodos de tabla conectados por líneas neón azul
- Barra de features en la parte inferior:
  - 🗃️ "Modela sin límites"
  - 🤝 "Colabora en tiempo real"
  - 📤 "Exporta y comparte"

### Columna Derecha (Formulario — Glassmorphism)
Panel con `backdrop-blur`, borde semitransparente y esquinas redondeadas:

**Tab activo: Iniciar sesión**
- Encabezado: *"Bienvenido de vuelta"* / *"Ingresa a tu cuenta para continuar"*
- Campo **Correo electrónico** (ícono `Mail`) — placeholder: `ejemplo@correo.com`
- Campo **Contraseña** (ícono `Lock`) — toggle show/hide con ícono `Eye`/`EyeOff`
- Link *"¿Olvidaste tu contraseña?"* → `/forgot-password`
- Checkbox **"Recordarme"** (shadcn `Checkbox`)
- Botón **"Iniciar sesión →"** — `bg-[#1A6CF6]`, full width
- Separador *"o continúa con"*
- Botones sociales: **Google** (SVG nativo) y **GitHub** (SVG nativo — evita error
  de export de `lucide-react@1.14.0` que no incluye `Github`)
- Footer del panel: *"¿No tienes cuenta? Crear cuenta"*

**Tab activo: Crear cuenta**
- Encabezado: *"Crea tu cuenta"*
- Campos: Nombre completo, Correo electrónico, Contraseña, Confirmar contraseña
- Botón **"Crear cuenta →"**
- Footer del panel: *"¿Ya tienes cuenta? Iniciar sesión"*

**Pie de página global:** *"© 2026 DBCanvas — UPT. Todos los derechos reservados."*

---

## Archivos Creados / Modificados

### ✅ Nuevo: `apps/web/components/auth/AuthView.tsx`
Componente `'use client'` unificado. Recibe prop `defaultTab: "login" | "register"`.

Responsabilidades:
- Renderiza el split layout completo (columna marketing + columna formulario)
- Maneja el estado del tab activo con `useState`
- Transiciones suaves entre tabs con `framer-motion`
- Diagrama SVG inline en la columna izquierda (neón azul animado con `@keyframes`)
- Integra `loginAction` y `registerAction` (Server Actions existentes — sin modificar)
- Checkbox "Recordarme" usando `@/components/ui/checkbox` (shadcn)
- Toggle de visibilidad de contraseña con `useState`
- Botones sociales con SVG nativos para evitar dependencias de lucide faltantes

### ✅ Modificado: `apps/web/app/(auth)/login/page.tsx`
```tsx
import AuthView from "@/components/auth/AuthView";
export default function LoginPage() {
  return <AuthView defaultTab="login" />;
}
```

### ✅ Modificado: `apps/web/app/(auth)/register/page.tsx`
```tsx
import AuthView from "@/components/auth/AuthView";
export default function RegisterPage() {
  return <AuthView defaultTab="register" />;
}
```

---

## Decisiones Técnicas

| Decisión | Justificación |
|---|---|
| Componente único `AuthView` en vez de dos páginas separadas | Evita duplicación, facilita mantener consistencia visual entre login/register |
| SVG nativo para Google y GitHub | `lucide-react@1.14.0` no exporta `Github`; SVG nativo es más fiable en Next.js 15 |
| `framer-motion` para transición de tabs | Ya instalado desde issue #37; sin costo adicional de bundle |
| Columna izquierda `hidden lg:flex` | Mobile-first: en pantallas pequeñas solo se muestra el formulario |
| `shadcn/ui Checkbox` para "Recordarme" | Consistencia con el sistema de componentes ya establecido en el proyecto |
| Server Actions existentes sin modificar | `loginAction` y `registerAction` mantienen `name="email"`, `name="password"` intactos |
| Keyframes en `globals.css` | Tailwind v4 no usa `tailwind.config.ts` — los `@keyframes` van en CSS global |
| Diagrama SVG inline animado | Reemplaza `AnimatedCanvas` del landing para tener control total del estilo neón |

---

## Dependencias Instaladas

```bash
pnpm dlx shadcn@latest add checkbox --cwd apps/web -y
```

> `framer-motion` ya estaba disponible desde issue #37.

---

## Reglas Respetadas

- ✅ `proxy.ts` y `middleware.ts` — no tocados
- ✅ `name="email"`, `name="password"` — sin cambios
- ✅ Server Actions de Supabase — intactas
- ✅ Tailwind v4 — sin `tailwind.config.ts`, keyframes en `globals.css`
- ✅ `'use client'` + patrón `mounted` en componentes con estado
- ✅ `pnpm build` — pasa sin errores
- ✅ `.ia/PROGRESS.md` — actualizado con issue #39 ✅

---

## Verificación

```bash
pnpm build --filter web   # ✅ Sin errores
git log --oneline -1      # feat: rediseño de UI de login y register unificados (#39)
```