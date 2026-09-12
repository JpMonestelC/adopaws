# Adopaws Frontend

SPA React para la plataforma de adopción de mascotas Adopaws.

## Stack

- **React 18** + **Vite**
- **React Router v6** (SPA routing)
- **Axios** (HTTP client con interceptores JWT)
- **CSS Modules** (estilos con design system de tokens CSS)

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
| Refugios | — | ⚠️ Simulado: `shelterService` filtra `/api/users` por `userType === 'shelter'` |
| Favoritos | — | ⚠️ Simulado: `favoriteService` guarda ids en `localStorage` (no hay endpoint de backend) |

El token JWT se almacena en `localStorage` (junto con el resto del usuario, bajo la key `adopaws_user`) y se adjunta automáticamente a cada request vía interceptor de axios en `services/api.js`. Ningún endpoint del backend exige el token todavía (`[Authorize]` no está aplicado en los controladores), así que por ahora viaja "listo" para cuando se protejan rutas.

## Roles

- `adopter` — Puede explorar, guardar favoritos, y enviar solicitudes
- `shelter` — Todo lo anterior + acceso al `/dashboard` para gestionar sus mascotas

## Build para producción

```bash
npm run build                  # Genera /dist
npm run preview                # Preview del build
```
