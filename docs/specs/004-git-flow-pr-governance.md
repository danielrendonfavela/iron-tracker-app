# Spec 004: Git Flow y Gobernanza de Pull Requests

## 🎯 Objetivo
Establecer un flujo de ingeniería disciplinado con 3 ramas de entorno (`develop`, `uat`, `prod`), desarrollo atómico en ramas `feature/*` y revisión manual obligatoria del usuario mediante Pull Requests (PRs).

## 🛠️ Cambios Realizados
- Creación y sincronización de ramas `develop`, `uat` y `prod` en GitHub.
- Creación de la skill personalizada `.agents/skills/iron-git-flow/SKILL.md`.
- Regla de Gobernanza: Prohibición de auto-merges y push directo a `prod`.
- Vincular el despliegue automático de Firebase Hosting exclusivamente a la rama `prod`.
- Creación del archivo `AGENTS.md` como punto de entrada de contexto para futuras sesiones de agentes IA.
