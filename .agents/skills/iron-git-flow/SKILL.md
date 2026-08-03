---
name: iron-git-flow
description: Workflow estandarizado de Git Flow con ramas protegidas (develop, uat, prod), Cherry-Pick para hotfixes/features pequeñas, Pull Requests (PRs) y despliegues controlados a producción.
---

# IRON TRACKER - Git Flow & Governance Policy

Esta habilidad impone la protección de ramas, promoción por Cherry-Pick y control de calidad mediante **Pull Requests (PRs)** en GitHub.

---

## 🔒 REGLAS DE ORO DE GOBERNANZA

1. **PROHIBIDO ELIMINAR RAMAS NÚCLEO**:
   - Las ramas **`develop`**, **`uat`** y **`prod`** son **ramas protegidas permanentes**.
   - **Nunca** presionar el botón "Delete branch" ni borrarlas en GitHub ni en local.

2. **CERO AUTO-MERGE EN UAT / PROD**:
   - Todo cambio vive en su propia rama `feature/issue-XX` o `fix/issue-XX`.
   - Se requiere **aprobación manual del USUARIO** en el Pull Request de GitHub.

3. **PROMOCIÓN SELECTIVA VÍA CHERRY-PICK**:
   - Para arreglos o características pequeñas, se prefiere la técnica **`git cherry-pick <commit-hash>`** hacia `uat` (y luego hacia `prod`) para promover únicamente el cambio aislado sin arrastrar todo el historial no probado de `develop`.

---

## 🌿 Estructura de Ramas

- **`feature/issue-XX-nombre`** / **`fix/issue-XX-nombre`**: Ramas secundarias atómicas.
- **`develop`**: Integración continua de desarrollo.
- **`uat`**: Entorno de pruebas pre-producción (`https://iron-tracker-uat.web.app`).
- **`prod`**: Entorno oficial de producción (`https://iron-tracker-gym.web.app`).

---

## 🔄 Flujo de Promoción por Cherry-Pick (Fixes / Features pequeñas)

```bash
# 1. Obtener el hash del commit aprobado en develop (ej: abc1234)
git checkout uat
git pull origin uat
git cherry-pick <commit-hash>
git push origin uat
# Despliegue automático o manual a Firebase UAT
git checkout develop
```
