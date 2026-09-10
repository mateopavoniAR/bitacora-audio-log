# ==========================================
# Etapa 1: Base Runtime para .NET 8
# ==========================================
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080
ENV ASPNETCORE_HTTP_PORTS=8080
ENV ASPNETCORE_ENVIRONMENT=Production

# ==========================================
# Etapa 2: Build y Restauración de dependencias
# ==========================================
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src

# Copiar csproj y restaurar capas de caché
COPY ["BitacoraAudio.Api.csproj", "./"]
RUN dotnet restore "BitacoraAudio.Api.csproj"

# Copiar el código fuente completo del backend
COPY . .
WORKDIR "/src"
RUN dotnet build "BitacoraAudio.Api.csproj" -c $BUILD_CONFIGURATION -o /app/build

# ==========================================
# Etapa 3: Publicación binaria optimizada
# ==========================================
FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "BitacoraAudio.Api.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

# ==========================================
# Etapa 4: Imagen Final de Producción (Non-Root)
# ==========================================
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .

# Usuario no-root por seguridad en .NET 8
USER app

ENTRYPOINT ["dotnet", "BitacoraAudio.Api.dll"]
