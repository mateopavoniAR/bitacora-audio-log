# Contexto del Proyecto: Bitácora de Sesiones & Audio Log

## 1. Descripción del Sistema y Propósito de Negocio
**Bitácora de Sesiones & Audio Log** es un sistema fullstack orientado a la captura, bitácora y catalogación de notas acústicas y frecuencias de calibración sonora (medidas en Hertz). 

El proyecto resuelve la necesidad de registrar sesiones de prueba de audio, pruebas de respuesta en frecuencia de equipamiento, tonos de afinación estándar (como el tono de concierto A4 a 440 Hz) y notas descriptivas con etiquetas temáticas. En conjunto con el frontend previsto, permite a técnicos, diseñadores de sonido o desarrolladores disparar y escuchar la síntesis de dichas frecuencias mediante la Web Audio API nativa del navegador.

## 2. Contexto Institucional y Formativo
- **Programa:** Proyecto formativo y de validación técnica dentro del programa de Onboarding (Niveles 1 y 2). `[FACT: CONTEXT.md]`
- **Objetivos Técnicos:**
  1. Validar arquitectura desacoplada multicapa (.NET Backend + React Frontend en monorepo). `[FACT: CONTEXT.md]`
  2. Implementar persistencia relacional con PostgreSQL y Entity Framework Core. `[FACT: CONTEXT.md, Program.cs]`
  3. Contenedorizar servicios con Docker y Docker Compose para desarrollo local reproducible. `[FACT: CONTEXT.md, Dockerfile]`
  4. Diseñar y ejecutar pipeline de integración y despliegue continuo (CI/CD) con ambientes aislados. `[FACT: CONTEXT.md]`

## 3. Consumidores del Sistema
1. **Frontend SPA (React + Vite):** Consumidor primario que presentará la interfaz visual para listar notas de audio, crear nuevos registros de frecuencias, eliminarlos y reproducir el tono sinusoidal/onda acústica usando la Web Audio API. `[FACT: CONTEXT.md]`
2. **Desarrolladores y QA (Swagger UI / cURL / Postman):** Consumidores técnicos que auditan la API REST a través de la documentación interactiva OpenAPI en `/swagger`. `[FACT: Program.cs, README.md]`
3. **Sistemas de Monitoreo / Orquestación:** Consumo del endpoint `/health` para validación de liveness y readiness del contenedor. `[FACT: Program.cs]`

## 4. Alcance Funcional Actual vs. Futuro

### Alcance Actual (Backend Implementado) `[FACT]`
- Gestión CRUD de la entidad `NotaAudio`:
  - Listado completo de notas ordenadas cronológicamente descendente.
  - Consulta de una nota individual por ID.
  - Creación de una nota con validaciones de campos (título, etiqueta, frecuencia en Hz > 0).
  - **Edición de Título, Etiqueta y FrecuenciaHz vía `PUT /api/notasaudio/{id}`, con marca de tiempo `FechaModificacion` (UTC) asignada automáticamente.**
  - Eliminación física de una nota por ID.
- Healthcheck básico del servicio en `/health`.
- Documentación OpenAPI / Swagger activa en todos los entornos estándar.
- Verificación automática de creación de esquema de base de datos (`EnsureCreated()`). Existe la migración EF `AddFechaModificacion` como evolución documentada del esquema.

### Alcance No Implementado / Fuera de Alcance Actual
- **Autenticación y Autorización:** No existe login, usuarios ni roles. Todos los recursos son públicos. `[FACT]`
- **Almacenamiento de Archivos de Audio Binarios:** El sistema almacena metadatos y valores numéricos de frecuencia (`frecuenciaHz`), no archivos de audio (WAV, MP3) en disco o blob storage. `[FACT]`
- **Paginación y Filtros Avanzados en Servidor:** La API no soporta query params para paginar (`page`, `pageSize`) ni filtrar por etiqueta o texto. El frontend implementa paginación local en memoria. `[FACT]`

## 5. Estrategia de Ramas y Entornos
Según `CONTEXT.md` del repositorio:
- **`desarrollo`:** Rama activa por defecto para el trabajo diario local orquestado con Docker Compose. `[FACT: git branch, CONTEXT.md]`
- **`homologacion`:** Entorno de QA / staging en la nube con despliegue automático tras ejecución exitosa de pruebas. `[ASSUMPTION: documentado en CONTEXT.md, pero sin workflows de GitHub Actions implementados en el repo actual]`
- **`produccion`:** Entorno productivo con actualización exclusiva mediante Pull Request aprobado. `[ASSUMPTION: documentado en CONTEXT.md, pero sin infraestructura de despliegue en código]`
- **Aislamiento de Datos:** Cada entorno debe disponer de su propia instancia de base de datos PostgreSQL. `[FACT: CONTEXT.md]`
