# Frontend: Bitácora de Sesiones & Audio Log

SPA desarrollada con **React 19 + TypeScript + Vite 8** para la gestión de notas de audio y frecuencias de prueba acústica (Hz). Consume la API REST de `backend/` y reproduce los tonos mediante la **Web Audio API** (`AudioContext`).

## Stack

- React 19 + TypeScript 6
- Vite 8 (build/dev con HMR)
- Fetch API nativa (sin librerías HTTP)
- Web Audio API para síntesis de tonos en tiempo real
- Oxlint para linting
- Estética retro analógica con variables CSS (rojo/marfil)

## Requisitos

- Node.js 20 LTS o superior (recomendado: 22 LTS)
- npm 10+

## Instalación

```bash
cd frontend
npm install
```

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo con HMR en `http://localhost:5173` |
| `npm run build` | Verifica tipos (`tsc -b`) y genera el build de producción en `dist/` |
| `npm run lint` | Ejecuta Oxlint sobre `src/` |
| `npm run preview` | Previsualiza el build de producción localmente |

## Configuración de entorno

La URL de la API se define con la variable `VITE_API_URL` (se inyecta en tiempo de build). Si no está definida, se usa el fallback `http://localhost:8080`.

```bash
VITE_API_URL=https://bitacora-audio-log.onrender.com npm run build
```

## Estructura

```
src/
  components/    UI: NotaForm, NotaList, EditNotaModal, ConfirmModal, AutoDismissAlert
  services/      Cliente de API (api.ts): CRUD de notas + healthcheck
  types/         Tipos compartidos con el contrato de la API (notaAudio.ts)
  utils/         Sintetizador acústico (audioSynth.ts)
  App.tsx        Orquestación principal y banner de errores
```

## Funcionalidades

- Registrar, editar y eliminar notas de audio (título, etiqueta, frecuencia en Hz).
- Prueba acústica en tiempo real antes de guardar (Web Audio API).
- Paginación local de la lista de notas.
- Alertas temporales de éxito/error y normalización de mensajes de fallo de red.

## Despliegue

- **Contenedor:** `docker build -t bitacora-frontend:latest -f frontend/Dockerfile frontend/` (Nginx sirve el build en el puerto 80).
- **Vercel:** el proyecto se despliega desde las ramas `homologacion` (preview) y `produccion` (producción); el ruteo SPA lo resuelve `vercel.json`.

## Verificación de CI

El build incluye chequeo estricto de tipos con `tsc -b`; el lint no bloquea el pipeline de CI/CD. Ambos están cubiertos en `.github/workflows/ci-cd.yml`.