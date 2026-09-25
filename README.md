# Adopaws

Plataforma full-stack de adopción de mascotas: publicación de mascotas por refugios/usuarios, solicitudes de adopción, marketplace de artículos para mascotas, consultas entre usuarios, y un motor de **compatibilidad usuario–mascota** (reglas + IA opcional vía Claude) que recomienda mascotas según el perfil del adoptante.

Este repositorio es un **monorepo**: un backend y un frontend independientes que juntos forman una sola aplicación.

```
adopaws/
├── backend/    # API REST — .NET 10, ASP.NET Core, EF Core, Clean Architecture
└── frontend/   # SPA — React 18 + Vite 5
```

## Stack

| Capa | Tecnología |
|---|---|
| Backend | .NET 10, ASP.NET Core Web API, Entity Framework Core 10, SQL Server |
| Auth | JWT Bearer + BCrypt (hash de contraseñas) |
| IA | Integración opcional con la API de Claude (Anthropic) para explicaciones de compatibilidad en lenguaje natural, con fallback basado en reglas si no hay API key configurada |
| Frontend | React 18, Vite 8, React Router v7, Axios, CSS Modules |
| Testing | Backend: xUnit + Moq (unit) + `WebApplicationFactory` con EF Core InMemory (integración). Frontend: Vitest + axios-mock-adapter |
| Docs | Swagger / OpenAPI (Swashbuckle) |

## Cómo correrlo

Cada carpeta tiene su propio README con instrucciones detalladas:
- [`backend/README.md`](./backend/README.md) — instalación, migraciones de EF Core, variables de entorno, cómo correr los tests.
- [`frontend/README.md`](./frontend/README.md) — instalación, variables de entorno, cómo correr los tests.

En resumen, con el backend corriendo en `http://localhost:5000` (puerto fijado en `backend/Adopaws.Api/Properties/launchSettings.json`) y el frontend apuntando ahí vía `VITE_API_URL` (`frontend/.env`, copiar desde `.env.example`), ambos quedan conectados sin configuración adicional.

## Funcionalidad principal

- **Autenticación real**: registro e inicio de sesión con contraseñas hasheadas (BCrypt) y JWT firmado.
- **Rutas protegidas y ownership real**: casi todas las rutas de escritura (y varias de lectura) exigen un JWT válido (`[Authorize]`), y las que afectan un recurso propio (perfil, mascotas, artículos del marketplace, favoritos, consultas) verifican que el dueño del recurso sea el usuario del token — nunca el que venga en el body o la URL — devolviendo `403 Forbidden` si no coincide. Ver `backend/README.md` para la tabla completa ruta por ruta.
- **Validación de entrada**: todos los DTOs de request validan con DataAnnotations (`[Required]`, `[EmailAddress]`, `[Range]`, longitudes mínimas/máximas, etc.), rechazando payloads inválidos con `400 Bad Request` antes de llegar a la lógica de negocio.
- **Mascotas**: publicación, listado y detalle de mascotas en adopción.
- **Favoritos**: guardar/quitar mascotas favoritas — endpoint real (`/api/favorites`) resuelto por el usuario autenticado, ya no vive en `localStorage`.
- **Refugios**: directorio público de refugios y sus mascotas — endpoint real (`/api/shelters`) que filtra `Users` por `userType` en el backend, ya no se arma filtrando `/api/users` en el cliente.
- **Solicitudes de adopción**: un adoptante solicita una mascota; el refugio/publicador gestiona el estado de la solicitud.
- **Compatibilidad con IA**: cada mascota muestra un puntaje de compatibilidad (0–100) y una explicación en español para el usuario logueado; la página de inicio recomienda las mascotas más compatibles. El motor combina reglas determinísticas (tipo de mascota, tamaño, experiencia previa, región) con una explicación generada por Claude cuando hay una API key configurada.
- **Marketplace**: publicación de artículos relacionados con mascotas entre usuarios.
- **Consultas**: mensajería simple entre usuarios (ej. adoptante-refugio).

## Skills demostradas

| Categoría | Evidencia |
|---|---|
| Backend / API design | Clean Architecture (Api/Application/Domain/Infrastructure) en .NET 10, controladores delgados, patrón Repository |
| Seguridad | Hash de contraseñas con BCrypt, autenticación JWT de punta a punta, endpoints que nunca exponen contraseñas, autorización (`[Authorize]`) + verificación de ownership en cada recurso escribible, validación de entrada (DataAnnotations) en todos los DTOs |
| Testing | Tests unitarios (Moq) y de integración end-to-end reales (`WebApplicationFactory` + EF Core InMemory) |
| Frontend / SPA | React 18, enrutamiento protegido por rol, consumo de API con Axios e interceptores |
| Integración de IA | Diseño de un servicio con fallback (reglas si no hay IA disponible, explicación de Claude si la hay) — patrón robusto para producción, no solo una demo de IA |
| Base de datos | Entity Framework Core con migraciones versionadas, SQL Server |
| Buenas prácticas de repo | `.gitignore` correcto, variables de entorno vía `.env`/`appsettings.json` (sin secretos reales commiteados), documentación honesta de lo que falta |

## Historia del proyecto

AdoPaws se restauró a partir de una copia de trabajo recuperada tras la pérdida del entregable original. Durante la restauración se hizo una auditoría completa del código (backend y frontend) que encontró y corrigió, entre otras cosas:

- El "login" del frontend era completamente simulado: comparaba credenciales contra `GET /api/users`, un endpoint que además devolvía las contraseñas de todos los usuarios en texto plano. Se implementó autenticación real de punta a punta (`POST /api/auth/login` / `POST /api/auth/register`, BCrypt + JWT) y se eliminó la exposición de contraseñas.
- Un bug de compilación real y no evidente en el proyecto de tests (`WebApplicationFactory<Program>` no podía acceder a la clase `Program` porque nunca se expuso como `public partial`).
- Un bug silencioso en el frontend: el mapa de colores de los niveles de compatibilidad usaba claves en inglés (`Excellent/Good/Fair/Low`) mientras el backend siempre responde en español (`Excelente/Buena/Regular/Baja`) — el color/estilo caía siempre al valor por defecto sin ningún error visible.
- Una página (`Favoritos`) que llamaba a un método inexistente y crasheaba silenciosamente.
- Puertos e inconsistencias de configuración entre el backend y el frontend, corregidos y documentados.

La verificación se hizo hasta donde el entorno de desarrollo lo permitió: el frontend se verificó de punta a punta (build de producción real, suite de tests automatizados, y una prueba end-to-end con un navegador real contra un backend simulado que replica el contrato exacto del backend real). El backend, por una restricción de red del entorno de trabajo usado durante la restauración (sin acceso a NuGet), se verificó mediante compilación parcial (capas sin dependencias externas), un verificador de balance de sintaxis sobre todo el código, comparación cruzada de cada interfaz contra su implementación, y revisión manual exhaustiva de los archivos críticos de autenticación — quedando pendiente una compilación completa (`dotnet build`/`dotnet test`) en un entorno con acceso normal a internet.

### Ronda de optimización — autorización, validación y endpoints reales

Sobre esa base restaurada, se hizo una segunda ronda para llevar el backend de "autenticación funciona pero nada está protegido" a un esquema de autorización real:

- Se agregó `[Authorize]` (más verificación de ownership vía `ClaimsPrincipal.GetUserId()`) a los 9 controladores existentes que lo necesitaban, dejando públicas solo las rutas de solo lectura pensadas para serlo (`GET /api/pets`, `/api/marketplace-items`, `/api/pet-photos/by-pet`) y `/api/auth/*`.
- Se agregó validación de entrada (DataAnnotations) a todos los DTOs de request, que antes no validaban nada.
- Se actualizaron las dependencias del frontend con vulnerabilidades conocidas (`react-router-dom` v6→v7, `vite` v5→v8, `vitest` v1→v5), verificado con `npm audit` (0 vulnerabilidades tras la actualización), la suite de tests completa, un build de producción real, y una prueba end-to-end con navegador real ejercitando el nuevo flujo de Favoritos con JWT real.
- Se convirtieron **Favoritos** y **Refugios** — antes simulados enteramente en el frontend (`localStorage` y un filtro client-side de `/api/users`, respectivamente) — en endpoints reales del backend (`/api/favorites`, `/api/shelters`), con su propia entidad, migración de EF Core, repositorio, servicio, controlador y tests.

Esta ronda se verificó con la misma metodología que la restauración original (sin compilador de C# disponible en este entorno): balance de sintaxis sobre todos los archivos `.cs`, comparación cruzada interfaz-vs-implementación, auditoría de registro de dependencias, y — a diferencia de la ronda anterior — reescritura completa de los tests unitarios y de integración afectados por los nuevos requisitos de autenticación. Sigue pendiente, igual que antes, una compilación completa (`dotnet build`/`dotnet test`) en un entorno con acceso normal a NuGet — con énfasis particular esta vez en la migración de EF Core de `Favorites`, escrita a mano y nunca compilada por un compilador real.

## Licencia

MIT — ver [`LICENSE`](./LICENSE).
