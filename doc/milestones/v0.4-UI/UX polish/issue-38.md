# Issue #38 — SonarQube Workflow + Quality Gate

**Milestone:** v0.4 — UI/UX Polish
**Branch:** `chore/issue-38-sonarqube-action`
**Responsable:** Jefferson
**Estado:** ⬜ Pendiente

---

## Historia de Usuario

Como responsable de la calidad, quiero análisis estático automatizado con SonarCloud para cumplir los criterios de evaluación.

---

## Criterios de Aceptación

- [ ] `.github/workflows/sonarqube.yml` existe y corre en push/PR
- [ ] `SONAR_TOKEN` configurado como GitHub Secret
- [ ] Quality Gate falla si hay vulnerabilidades críticas

---

## Arquitectura

### Setup en SonarCloud (hacer ANTES del código)

1. Ir a [sonarcloud.io](https://sonarcloud.io) → Login con GitHub
2. Crear organización vinculada a tu cuenta/organización de GitHub
3. Importar el repositorio del proyecto
4. En SonarCloud → Project → Administration → Analysis Method → seleccionar "GitHub Actions"
5. Copiar el `SONAR_TOKEN` que genera SonarCloud
6. Ir a GitHub → Settings del repo → Secrets → Actions → New secret:
   - Name: `SONAR_TOKEN`
   - Value: el token copiado

### Archivos a crear

```
raíz del monorepo/
├── sonar-project.properties   ← NUEVO
└── .github/workflows/
    └── sonarqube.yml           ← NUEVO
```

---

## Patrones y Reglas

### sonar-project.properties (raíz del monorepo)

```properties
sonar.projectKey=TU_ORG_sonarcloud_TU_PROYECTO
sonar.organization=TU_ORG_sonarcloud
sonar.projectName=DBCanvas
sonar.projectVersion=1.0

# Rutas del código fuente (monorepo)
sonar.sources=apps/web/app,apps/web/components,apps/web/lib,apps/web/actions,apps/web/store
sonar.exclusions=**/node_modules/**,**/.next/**,**/dist/**,**/e2e/**,**/*.test.ts,**/*.spec.ts

# TypeScript
sonar.typescript.lcov.reportPaths=apps/web/coverage/lcov.info

# Encoding
sonar.sourceEncoding=UTF-8
```

> **Importante:** Reemplazar `TU_ORG_sonarcloud` y la `projectKey` con los valores reales de SonarCloud.

### .github/workflows/sonarqube.yml

```yaml
name: SonarCloud Analysis

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  sonarcloud:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0  # Necesario para análisis de blame/historial

      - uses: pnpm/action-setup@v4
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Build
        run: pnpm build --filter web
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}

      - name: SonarCloud Scan
        uses: SonarSource/sonarcloud-github-action@master
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
```

### Añadir secrets en GitHub

Los secrets necesarios en GitHub → Settings → Secrets → Actions:
- `SONAR_TOKEN` — generado en SonarCloud
- `NEXT_PUBLIC_SUPABASE_URL` — ya debería existir
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — ya debería existir

---

## Errores Comunes y Cómo Evitarlos

| Error | Causa | Solución |
|---|---|---|
| `Project not found` en SonarCloud | `projectKey` incorrecto en properties | Copiar exactamente desde SonarCloud → Project → Information |
| `SONAR_TOKEN not found` | Secret no añadido en GitHub | Verificar GitHub → Settings → Secrets → Actions |
| Quality Gate falla por cobertura 0% | No hay tests de cobertura configurados | Añadir `sonar.coverage.exclusions=**` para desactivar el check de cobertura en esta versión |
| `fetch-depth: 0` faltante | Checkout shallow no permite análisis de blame | Siempre usar `fetch-depth: 0` con SonarCloud |

---

## Verificación Final

1. Push a `main` o `develop` → workflow aparece en Actions ✅
2. SonarCloud muestra el análisis del proyecto ✅
3. Badge verde "Quality Gate Passed" en SonarCloud ✅
4. Actualizar `.ia/PROGRESS.md` marcando Issue #38 como ✅ y **Milestone v0.4 COMPLETADO** 🏆
5. `git add . && git commit -m "chore: SonarCloud quality gate workflow (#38)"`
