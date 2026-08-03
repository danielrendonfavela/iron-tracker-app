# Spec 002: Autenticación Multi-Usuario e Integración Firestore

## 🎯 Objetivo
Permitir que múltiples atletas se registren e inicien sesión, garantizando el aislamiento total de datos por usuario y la sincronización en tiempo real desde la nube de Google Firebase.

## 🛠️ Cambios Realizados
- Integración de Firebase SDK (Auth + Firestore + Hosting).
- Creación de `firebaseService.ts` con manejo de autenticación:
  - Registro e Inicio de Sesión con Correo/Contraseña.
  - 1-Click Sign-In con Google y Apple.
- Modelo de Datos por Usuario en Firestore:
  - `users/{uid}/workouts`
  - `users/{uid}/exercises`
  - `users/{uid}/settings/whoop`
- Componente `AuthModal.tsx` integrado en la barra superior del encabezado.
- Configuración transparente de credenciales vía variables de entorno (`.env`).
