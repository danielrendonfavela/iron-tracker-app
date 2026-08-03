---
name: iron-git-flow
description: Workflow estandarizado de Git Flow de 3 ramas (develop -> uat -> prod), Conventional Commits y despliegues verificados para IRON TRACKER.
---

# IRON TRACKER - Git Flow & Deployment Workflow

Esta habilidad define la disciplina de control de versiones y gestión de ramas para el proyecto **IRON TRACKER**.

## 🌲 Estructura de Ramas

1. **`develop`** (Rama principal de trabajo):
   - Todo el código nuevo, correcciones de errores y nuevas funcionalidades se desarrollan y prueban en `develop`.
   - **Regla**: Nunca hacer commit directo a `prod`.

2. **`uat`** (User Acceptance Testing / Pruebas):
   - Rama para congelar versiones de prueba.
   - Se promueve mediante merge desde `develop` cuando una funcionalidad o versión está lista para revisión.

3. **`prod`** (Producción Oficial):
   - La rama oficial de producción.
   - Única rama vinculada a **Firebase Hosting** (`https://iron-tracker-gym.web.app`).

---

## 📝 Convención de Commits (Conventional Commits)

Cada commit debe usar un prefijo estandarizado:
- `feat:` Nueva funcionalidad o pantalla de UI (ej: `feat: add Whoop recovery gauge`).
- `fix:` Corrección de errores de ejecución o UI (ej: `fix: resolve timer reset state`).
- `refactor:` Reestructuración de código sin cambiar comportamiento externo.
- `config:` Cambios en variables de entorno, Firebase o configuración del proyecto.
- `ci:` Cambios en integraciones de empaquetado o despliegue.

---

## ⚡ Regla de Verificación Pre-Merge (Build Check)

Antes de fusionar código hacia `uat` o `prod`, **SIEMPRE** se debe ejecutar:

```bash
npm run build
```

Si la compilación de TypeScript o el empaquetado de Vite fallan, se prohíbe realizar el merge o push hacia `uat` o `prod`.

---

## 🔄 Comandos de Promoción Rápidos

### 1. Promover cambios de `develop` ➔ `uat`:
```bash
git checkout uat
git merge develop
git push origin uat
git checkout develop
```

### 2. Promover y Desplegar de `uat` ➔ `prod` (Firebase Hosting):
```bash
git checkout prod
git merge uat
git push origin prod
npx -y firebase-tools@latest deploy --only hosting --project=iron-tracker-gym
git checkout develop
```
