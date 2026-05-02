# Issue #28 — Tests E2E Playwright: Flujo Completo

**Milestone:** v0.3 — Realtime + Versiones
**Branch:** `chore/issue-28-e2e-playwright`
**Depende de:** Toda la lógica core implementada ✅
**Estado:** ⬜ Pendiente

---

## Historia de Usuario

Como encargado de calidad, quiero pruebas E2E automatizadas con Playwright para garantizar que el flujo principal (login → crear diagrama → SQL → nodo visible) no se rompa ante futuros cambios.

---

## Criterios de Aceptación

- [ ] `@playwright/test` instalado y configurado en el monorepo
- [ ] Test del flujo principal: login → nuevo proyecto → SQL → nodo en DOM
- [ ] Pruebas pasan en local y en CI (GitHub Actions)

---

## Arquitectura

### Instalación en el monorepo

```bash
# Instalar en apps/web (donde corre la app)
pnpm add -D @playwright/test --filter web
pnpm exec playwright install chromium --with-deps
```

### Estructura de archivos

```
apps/web/
├── playwright.config.ts        ← NUEVO
└── e2e/
    ├── auth.setup.ts           ← setup de autenticación (reutilizable)
    └── core-workflow.spec.ts   ← test principal del flujo
```

---

## Patrones y Reglas

### playwright.config.ts

```typescript
// apps/web/playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  retries: process.env.CI ? 2 : 0,
  timeout: 30_000,
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    // Setup de auth se ejecuta primero
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
    },
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: '.playwright/auth.json',  // reutilizar sesión
      },
      dependencies: ['setup'],
    },
  ],
  // Levantar el servidor de Next.js automáticamente en CI
  webServer: process.env.CI ? {
    command: 'pnpm start --filter web',
    url: 'http://localhost:3000',
    reuseExistingServer: false,
  } : undefined,
})
```

### auth.setup.ts — login reutilizable

```typescript
// e2e/auth.setup.ts
import { test as setup, expect } from '@playwright/test'

const TEST_EMAIL = process.env.TEST_USER_EMAIL ?? 'test@dbcanvas.dev'
const TEST_PASS  = process.env.TEST_USER_PASS  ?? 'TestPass123!'

setup('authenticate', async ({ page }) => {
  await page.goto('/login')
  await page.fill('input[type="email"]', TEST_EMAIL)
  await page.fill('input[type="password"]', TEST_PASS)
  await page.click('button[type="submit"]')
  await page.waitForURL('/dashboard', { timeout: 10_000 })
  // Guardar estado de sesión para reutilizar en los tests
  await page.context().storageState({ path: '.playwright/auth.json' })
})
```

### core-workflow.spec.ts — test principal

```typescript
// e2e/core-workflow.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Core Workflow', () => {

  test('login → nuevo proyecto → SQL → nodo visible', async ({ page }) => {
    // 1. Dashboard (ya autenticado gracias al setup)
    await page.goto('/dashboard')
    await expect(page).toHaveURL('/dashboard')

    // 2. Crear nuevo proyecto
    await page.click('button:has-text("Nuevo")')
    // Esperar redirección al editor
    await page.waitForURL(/\/editor\//, { timeout: 10_000 })

    // 3. Esperar que el Monaco Editor cargue
    const monacoEditor = page.locator('.monaco-editor').first()
    await expect(monacoEditor).toBeVisible({ timeout: 10_000 })

    // 4. Limpiar y escribir DDL en el editor
    // Clic en el área del editor para enfocarlo
    await monacoEditor.click()
    await page.keyboard.press('Control+A')
    await page.keyboard.type('CREATE TABLE t1 (id INT PRIMARY KEY, name TEXT);')

    // 5. Verificar que el nodo aparece en React Flow
    // El parser puede tener debounce de 300-500ms
    const node = page.locator('.react-flow__node').filter({ hasText: 't1' })
    await expect(node).toBeVisible({ timeout: 5_000 })
  })

  test('canvas vacío muestra estado inicial correcto', async ({ page }) => {
    await page.goto('/dashboard')
    await page.click('button:has-text("Nuevo")')
    await page.waitForURL(/\/editor\//, { timeout: 10_000 })

    // El canvas debe existir aunque esté vacío
    const canvas = page.locator('.react-flow__renderer')
    await expect(canvas).toBeVisible()
  })

})
```

### GitHub Actions CI (.github/workflows/e2e.yml)

```yaml
# .github/workflows/e2e.yml
name: E2E Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  e2e:
    runs-on: ubuntu-latest
    env:
      NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
      NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
      TEST_USER_EMAIL: ${{ secrets.TEST_USER_EMAIL }}
      TEST_USER_PASS: ${{ secrets.TEST_USER_PASS }}
      PLAYWRIGHT_BASE_URL: http://localhost:3000
      CI: true

    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Install Playwright browsers
        run: pnpm exec playwright install chromium --with-deps
        working-directory: apps/web

      - name: Build app
        run: pnpm build --filter web
        env:
          NODE_ENV: production

      - name: Run E2E tests
        run: pnpm exec playwright test
        working-directory: apps/web

      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: apps/web/playwright-report/
```

### Añadir script en package.json de apps/web

```json
// apps/web/package.json — añadir en scripts:
"test:e2e": "playwright test",
"test:e2e:ui": "playwright test --ui"
```

### Añadir .playwright/ al .gitignore

```
# .gitignore (raíz del monorepo)
.playwright/
apps/web/playwright-report/
apps/web/test-results/
```

---

## Errores Comunes y Cómo Evitarlos

| Error | Causa | Solución |
|---|---|---|
| `storageState` no persiste la sesión | Supabase usa cookies httpOnly | Verificar que el login crea las cookies correctamente antes de `storageState` |
| Nodo no aparece en 5 segundos | El parser tiene debounce largo | Aumentar timeout a `{ timeout: 8_000 }` o reducir el debounce en dev |
| Monaco no recibe el texto con `keyboard.type` | El editor tiene un shadow DOM propio | Usar el botón de Monaco para enfocar y luego `page.keyboard.type()` |
| Tests fallan en CI pero pasan en local | Variables de entorno faltantes en GitHub | Añadir todos los secrets necesarios en GitHub → Settings → Secrets |
| Chromium no instala en CI | Falta `--with-deps` en el install | Siempre usar `playwright install chromium --with-deps` en CI |

---

## Verificación Final

```bash
# Local
pnpm dev --filter web  # en una terminal
pnpm test:e2e --filter web  # en otra terminal

# Resultado esperado:
# ✓ login → nuevo proyecto → SQL → nodo visible (5.2s)
# ✓ canvas vacío muestra estado inicial correcto (2.1s)
# 2 passed
```

Actualizar `.ia/PROGRESS.md` marcando Issue #28 como ✅ y **Milestone v0.3 como COMPLETADO (8/8)**.

```bash
pnpm build  # Sin errores
git add . && git commit -m "chore: setup E2E tests con Playwright (#28)"
```
