# ==============================================================================
# Dockerfile Multi-Stage para el Frontend React + Vite
# ==============================================================================

# ------------------------------------------------------------------------------
# Etapa 1: Construcción y Compilación con Node.js 20
# ------------------------------------------------------------------------------
FROM node:20-alpine AS build

# Establecer el directorio de trabajo del contenedor
WORKDIR /app

# Copiar archivos de dependencias e instalarlas aprovechando la caché de Docker
COPY package*.json ./
RUN npm ci

# Copiar el resto del código fuente del frontend
COPY . .

# Variables de entorno para la compilación de Vite
ARG VITE_API_URL=http://localhost:8080
ENV VITE_API_URL=$VITE_API_URL

# Compilar la aplicación para producción (genera la carpeta /dist)
RUN npm run build

# ------------------------------------------------------------------------------
# Etapa 2: Servidor Nginx Ultraliviano para Servir los Archivos Estáticos
# ------------------------------------------------------------------------------
FROM nginx:alpine AS final

# Copiar nuestra configuración personalizada de Nginx para SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar los archivos estáticos construidos en la Etapa 1
COPY --from=build /app/dist /usr/share/nginx/html

# Exponer el puerto estándar HTTP
EXPOSE 80

# Iniciar Nginx en primer plano
CMD ["nginx", "-g", "daemon off;"]
