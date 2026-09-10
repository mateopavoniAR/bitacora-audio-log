# Bitácora de Sesiones & Audio Log

## Descripción General
Sistema fullstack para el registro y gestión de notas de audio y frecuencias de prueba. Proyecto desarrollado dentro del programa de Onboarding (Niveles 1 y 2) para validar arquitectura multicapa, contenedorización local y despliegue continuo en entornos aislados.

## Arquitectura del Sistema
- **Patrón:** Monorepo con desacoplamiento Backend / Frontend.
- **Backend (`/backend`):** .NET 8 Web API. Implementa Entity Framework Core con Npgsql y xUnit para testing unitario.
- **Frontend (`/frontend`):** React + Vite. Integración con Web Audio API nativa.
- **Persistencia:** PostgreSQL.
- **Orquestación Local:** Docker Compose.

## Estrategia de Entornos y Git
- `desarrollo`: Rama por defecto para desarrollo local orquestado con Docker Compose.
- `homologacion`: Entorno de QA en la nube. Despliegue automático vía GitHub Actions tras aprobación de suite de tests.
- `produccion`: Entorno de Producción. Actualización exclusiva mediante Pull Request aprobado desde homologación.
- **Aislamiento:** Cada entorno cuenta con su propia instancia de base de datos PostgreSQL.