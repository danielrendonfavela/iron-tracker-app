# AGENTS.md - Contexto y Guía para Asistentes de IA (Antigravity & Claude)

Bienvenido al proyecto **IRON TRACKER**. Este archivo contiene el contexto fundamental del proyecto, arquitectura, reglas de gobernanza y punteros a la documentación histórica para que cualquier sesión de agente pueda operar con total claridad.

---

## 📌 Resumen del Proyecto y Stack Tecnológico

- **Aplicación**: Web App Progresiva (PWA) de entrenamiento de hipertrofia y autoregulación biométrica.
- **Tecnologías Core**: React 18, TypeScript (modo estricto), Vite, Tailwind CSS (Tema "Iron" oscuro/neón).
- **Backend / Nube**: Google Firebase (Firebase Auth + Cloud Firestore + Firebase Hosting).
- **IA**: Gemini 2.5 Flash API (IRON COACH AI con ejecución de comandos de base de datos).
- **Biometría**: WHOOP Developer API Integration (Recovery, HRV, Strain, Sueño).

---

## 📜 Reglas de Gobernanza e Ingeniería (OBLIGATORIAS)

1. **Flujo Automatizado de Issues & PRs (`iron-issue-workflow`)**:
   - Todo Bug o User Story detectado debe primero **registrarse como Issue en GitHub** con criterios de aceptación.
   - El trabajo de código se delega a un **Subagente en un Git Worktree aislado** (`Workspace: 'share'`) bajo la rama `fix/issue-XX` o `feature/issue-XX`.

2. **Cero Auto-Merge / Cero Push Directo a `uat` o `prod`**:
   - Todo cambio debe realizarse en su propia rama y enviarse mediante un **Pull Request (PR) a `develop`** para la **aprobación manual del usuario**.

3. **Verificación Pre-Merge**:
   - Todo código debe ser validado ejecutando `npm run build` sin errores ni advertencias de TypeScript antes de solicitar revisión de PR.

4. **Historial de Features en `docs/specs/`**:
   - Cada nueva especificación, plan de implementación o cambio arquitectónico debe registrarse en la carpeta `docs/specs/` con nomenclatura incremental (`001-...md`, `002-...md`).

---

## 🗂️ Registro de Funcionalidades e Historial (`docs/specs/`)

Consulta los documentos históricos en la carpeta `docs/specs/` para conocer el detalle técnico de lo que se ha construido hasta la fecha:

- [`docs/specs/001-vite-react-ts-architecture.md`](file:///c:/Users/Danie/Documents/Gym_App/docs/specs/001-vite-react-ts-architecture.md): Refactorización inicial de prototipo monolítico a Vite + React + TS.
- [`docs/specs/002-firebase-multi-user-auth.md`](file:///c:/Users/Danie/Documents/Gym_App/docs/specs/002-firebase-multi-user-auth.md): Autenticación multi-usuario e integración Firestore por usuario.
- [`docs/specs/003-whoop-biometric-integration.md`](file:///c:/Users/Danie/Documents/Gym_App/docs/specs/003-whoop-biometric-integration.md): Widget de recuperación WHOOP y Coach IA biométrico.
- [`docs/specs/004-git-flow-pr-governance.md`](file:///c:/Users/Danie/Documents/Gym_App/docs/specs/004-git-flow-pr-governance.md): Gobernanza de ramas (develop, uat, prod) y flujo de PRs.
- [`docs/specs/005-automated-issue-subagent-workflow.md`](file:///c:/Users/Danie/Documents/Gym_App/docs/specs/005-automated-issue-subagent-workflow.md): Protocolo de automatización de GitHub Issues y subagentes en Git Worktrees.
