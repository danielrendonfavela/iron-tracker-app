# Spec 005: Automatización de GitHub Issues y Subagentes en Git Worktrees

## 🎯 Objetivo
Automatizar el ciclo completo de reporte y resolución de bugs o características: Registrar el Issue en GitHub ➔ Desplegar Subagente en Git Worktree aislado ➔ Verificar Build ➔ Abrir Pull Request vinculado al Issue.

## 🛠️ Componentes Creados
- Skill `.agents/skills/iron-issue-workflow/SKILL.md`: Guía procedimental del flujo en 5 pasos.
- Script `scripts/create_issue.js`: Integración con la API REST de GitHub para registrar Issues de forma automática.
- Actualización de `AGENTS.md`: Incorporación de la regla de automatización de Worktrees y asignación de subagentes.
