# Spec 003: Integración Biométrica WHOOP y Coach IA

## 🎯 Objetivo
Capturar datos biométricos de Whoop (Recovery, Strain, HRV, Sueño) e integrarlos con Gemini 2.5 Flash para ofrecer recomendaciones automáticas de autorregulación y volumen.

## 🛠️ Cambios Realizados
- Creación de `whoopService.ts` y tipos biométricos `types/whoop.ts`.
- Componente `WhoopWidget.tsx`:
  - Indicador de color de recuperación (🟩 Verde >66%, 🟨 Amarillo 33-66%, 🟥 Rojo <33%).
  - Métrica de HRV, Frecuencia Cardíaca en Reposo, Strain y Horas de Sueño.
  - Simulador interactivo en vivo para pruebas instantáneas.
  - Panel OAuth 2.0 para conectar Client ID de Whoop Developer Portal.
- Actualización de `geminiService.ts`:
  - Inyección del contexto biométrico de Whoop en el prompt del sistema.
  - El Coach sugiere días de descarga (Deload) en zona roja o récords personales en zona verde.
