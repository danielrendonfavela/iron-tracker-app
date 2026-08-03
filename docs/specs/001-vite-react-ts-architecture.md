# Spec 001: Arquitectura Base Vite + React + TypeScript + Tailwind CSS

## 🎯 Objetivo
Transformar el archivo monolítico `iron_tracker.tsx` en una aplicación modular, con tipado estricto en TypeScript, diseño moderno y soporte offline-first.

## 🛠️ Cambios Realizados
- Creación del proyecto Vite 5 + React 18 + TypeScript.
- Configuración del tema visual oscuro "Iron" con Tailwind CSS (paleta Zinc / Crimson).
- Componentización modular:
  - `Header.tsx` (Cronómetro e indicadores).
  - `Navbar.tsx` (Navegación inferior).
  - `SessionTab.tsx` (Registro de entrenamientos).
  - `HistoryTab.tsx` (Historial y edición modal de marcas).
  - `CoachTab.tsx` (Chat interactivo con Gemini).
  - `ProgressTab.tsx` (Gráfica SVG de peso máximo).
  - `ToolsTab.tsx` (Calculadora 1RM y conversor KG/LB).
- Corrección de bugs de runtime (función de borrado y reintentos HTTP de la IA).
