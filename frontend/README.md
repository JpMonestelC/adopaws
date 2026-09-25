# Adopaws Frontend

SPA React para la plataforma de adopción de mascotas Adopaws.

## Stack

- **React 18** + **Vite 8**
- **React Router v7** (SPA routing)
- **Axios** (HTTP client con interceptores JWT)
- **CSS Modules** (estilos con design system de tokens CSS)
- **Vitest 5** (unit tests) + `axios-mock-adapter`

## Estructura

```
src/
├── App.jsx                    # Routing raíz
├── main.jsx                   # Entry point
├── index.css                  # Design system (CSS variables globales)
│
├── context/
│   └── AuthContext.jsx        # Estado global de autenticación (JWT)
│
├── services/
│   └── api.js                 # Capa de servicios HTTP (axios + interceptores)
│
├── components/
│   ├── auth/
│   │   └── ProtectedRoute.jsx # HOC para rutas protegidas
│   ├── layout/
│   │   ├── Layout.jsx         # Layout raíz (Navbar + Outlet + Footer)
│   │   ├── Navbar.jsx         # Navbar responsiva con menú de usuario
│   │   └── Footer.jsx         # Footer con links y redes sociales
│   ├── pets/
│   │   └── PetCard.jsx        # Tarjeta de mascota reutilizable
│   └── ui/
│       └── Button.jsx         # Botón con variantes (primary, secondary, ghost, accent)
│
└── pages/
    ├── Home.jsx               # Landing page con hero, featured pets, pasos
    ├── Pets.jsx               # Listado con filtros sidebar (especie, edad, tamaño, género)
    ├── PetDetail.jsx          # Detalle de mascota + solicitud de adopción
    ├── Login.jsx              # Login con JWT
    ├── Register.jsx           # Registro (adoptante / refugio)
    ├── Profile.jsx            # Perfil de usuario (protegida)
    ├── MyApplications.jsx     # Mis solicitudes de adopción (protegida)
    ├── Favorites.jsx          # Mascotas favoritas (protegida)
    ├── Shelters.jsx           # Listado de refugios
    ├── ShelterDetail.jsx      # Detalle de refugio + sus mascotas
    ├── HowItWorks.jsx         # Cómo funciona la plataforma
    ├── Dashboard.jsx          # Panel para refugios (protegida, rol: shelter)
    └── NotFound.jsx           # 404
```

## Instalación

```bash
cd adopaws-frontend
cp .env.example .env           # Configura la URL del API
npm install
npm run dev                    # http://localhost:5173
```

## Integración con el backend

El frontend espera que el API (.NET) esté en la URL configurada en `.env`.

### Endpoints esperados

| Servicio | Endpoint | Estado |
|---------|----------|--------|
| Login | `POST /api/auth/login` → `{ token, expiresAtUtc, user }` | ✅ Real (JWT + BCrypt) |
| Registro | `POST /api/auth/register` → `{ token, expiresAtUtc, user }` | ✅ Real (JWT + BCrypt) |
| Mascotas | `GET /api/pets` | ✅ Real |
| Mascota | `GET /api/pets/:id` | ✅ Real |
| Solicitud de adopción | `POST /api/adoption-requests` | ✅ Real |
| Compatibilidad usuario–mascota | `GET /api/compatibility/:userId/:petId` | ✅ Real (reglas + IA opcional) |
| Recomendaciones | `GET /api/compatibility/recommendations/:userId?topN=` | ✅ Real (reglas + IA opcional) |
| Refugios | `GET /api/shelters`, `/api/shelters/:id`, `/api/shelters/:id/pets` | ✅ Real (endpoint público, filtra `Users` por `userType === 'shelter'` en el backend) |
| Favoritos | `GET/POST/DELETE /api/favorites` | ✅ Real (requiere sesión; el usuario siempre se identifica por el JWT, nunca se envía un `userId` desde el frontend) |

El token JWT se almacena en `localStorage` (junto con el resto del usuario, bajo la key `adopaws_user`) y se adjunta automáticamente a cada request vía interceptor de axios en `services/api.js`. La mayoría de rutas de escritura y varias de lectura ahora exigen `[Authorize]` en el backend (favoritos, mascotas/marketplace propios, solicitudes de adopción, consultas, compatibilidad, `/api/users`); las rutas de solo lectura pensadas para ser públicas (`pets`, `marketplace-items`, `shelters`) siguen sin requerir sesión. Ver `backend/README.md` para el detalle completo de qué ruta exige qué.

## Roles

- `adopter` — Puede explorar, guardar favoritos, y enviar solicitudes
- `shelter` — Todo lo anterior + acceso al `/dashboard` para gestionar sus mascotas

## Build para producción

```bash
npm run build                  # Genera /dist
npm run preview                # Preview del build
```
