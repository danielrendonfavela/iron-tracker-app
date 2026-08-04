# Spec 006: Drawer de Perfil y Menú de Ajustes Estilo App Nativa (US-007)

## 📌 Contexto & Objetivo

El objetivo de esta especificación es reemplazar el modal genérico de Ajustes por un **Drawer / Panel Deslizante lateral de Perfil** estilo App Nativa (`ProfileDrawer.tsx`), mejorando la experiencia de usuario (UX/UI) y manteniendo limpia la barra inferior de navegación (Navbar) para los 4 accesos principales de entrenamiento.

---

## 🎯 Criterios de Aceptación Cumplidos (Issue #17)

1. **Profile Drawer Lateral (Estilo App Nativa)**:
   - Panel lateral con deslizamiento suave (slide-over), efecto Glassmorphism (`backdrop-blur-2xl`), fondo semitransparente oscuro (`zinc-950/95`) y tema neón/Iron.
   - Indicador superior tipo drag handle para pantallas móviles.

2. **Estado de Sincronización Amigable**:
   - Muestra claramente el estado de los datos:
     - `🟢 Sincronizado en la Nube` cuando Google Cloud Firebase está activo.
     - `🟡 Modo Local` cuando la información reside localmente en el navegador.

3. **Integración Completa en el Drawer**:
   - **Perfil de Usuario & Auth**: Muestra avatar del atleta, nombre, correo y botón de "CERRAR SESIÓN" (o "INICIAR SESIÓN / CREAR CUENTA").
   - **Selector de Temas**: Integración directa de `ThemeSelector` (Claro, Oscuro, Sistema).
   - **Biometría WHOOP**: Resumen biométrico (Recovery, HRV, Strain, Sueño), simulación rápida de estados (Verde/Amarillo/Rojo) y configuración de Client ID / OAuth 2.0.
   - **Acceso Directo a Herramientas**: Botón directo para la Calculadora 1RM y Conversor de Peso.
   - **Guía PWA iPhone**: Pasos desplegables para instalación en pantalla de inicio de Safari.

4. **Navegación Limpia (Navbar con 4 Accesos Principales)**:
   - La barra de navegación inferior (`Navbar.tsx`) se simplificó a **4 pestañas principales de entrenamiento**:
     - `SESIÓN` (Entrenamiento activo)
     - `COACH` (IRON COACH AI con Gemini 2.5 Flash)
     - `PROGRESO` (Gráficas y estadísticas)
     - `MARCAS` (Historial de sesiones)

---

## 🏗️ Componentes Creados & Modificados

- `src/components/ProfileDrawer.tsx` (Nuevo): Componente principal del Drawer nativo.
- `src/components/Header.tsx`: Actualizado para abrir el Profile Drawer al pulsar en el perfil o ícono de estado.
- `src/components/Navbar.tsx`: Simplificado a 4 accesos principales de entrenamiento.
- `src/App.tsx`: Integración del estado y callbacks del Profile Drawer y AuthModal.
