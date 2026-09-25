import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "/api";

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Adjunta el JWT (si existe) a cada request saliente. La mayoría de rutas
// de escritura y varias de lectura ahora exigen [Authorize] en el backend
// (favoritos, mascotas/marketplace propios, solicitudes de adopción,
// consultas, compatibilidad, /api/users) — ver los controladores en
// Adopaws.Api/Controllers. Las rutas de solo lectura pensadas para ser
// públicas (pets, marketplace-items, shelters) siguen sin requerir sesión.
api.interceptors.request.use((config) => {
  try {
    const stored = localStorage.getItem("adopaws_user");
    const token = stored ? JSON.parse(stored).token : null;
    if (token) config.headers.Authorization = `Bearer ${token}`;
  } catch {
    // localStorage no disponible o el valor guardado no es JSON válido:
    // seguimos sin token en vez de romper el request.
  }
  return config;
});

// Extrae un mensaje legible del error de axios. El backend responde
// { statusCode, message, timestamp } vía ExceptionHandlingMiddleware.
function extractErrorMessage(err, fallback) {
  const data = err.response?.data;
  if (typeof data === "string" && data.trim()) return data;
  if (data && typeof data.message === "string" && data.message.trim())
    return data.message;
  return fallback;
}

// ─── Auth (real: /api/auth/login y /api/auth/register) ──
export const authService = {
  login: async ({ email, password }) => {
    try {
      const res = await api.post("/auth/login", { email, password });
      const { token, user } = res.data;
      return { ...user, id: user.idUser, token };
    } catch (err) {
      throw new Error(
        extractErrorMessage(err, "Correo o contraseña incorrectos."),
      );
    }
  },

  register: async ({
    fullName,
    email,
    password,
    userType,
    phone,
    region,
    profileDescription,
  }) => {
    try {
      const res = await api.post("/auth/register", {
        fullName,
        email,
        password,
        userType: userType || "adopter",
        phone: phone || "",
        region: region || "",
        profileDescription: profileDescription || "",
      });
      const { token, user } = res.data;
      return { ...user, id: user.idUser, token };
    } catch (err) {
      throw new Error(
        extractErrorMessage(err, "No se pudo completar el registro."),
      );
    }
  },
};

// ─── Compatibility (IA / reglas) ─────────────────────────
export const compatibilityService = {
  getCompatibility: (userId, petId) =>
    api.get(`/compatibility/${userId}/${petId}`),
  getRecommendations: (userId, topN = 10) =>
    api.get(`/compatibility/recommendations/${userId}`, { params: { topN } }),
};

// ─── Favorites (real: GET/POST/DELETE /api/favorites, requiere sesión) ───
// El backend siempre identifica al usuario por el JWT (nunca recibe un
// userId desde aquí), así que estas llamadas solo funcionan autenticado —
// api.js ya adjunta el Bearer token en cada request (ver interceptor arriba).
export const favoriteService = {
  // Devuelve las mascotas favoritas completas (no solo ids): el backend ya
  // trae el detalle de cada mascota embebido en cada favorito.
  getFavorites: async () => {
    const res = await api.get("/favorites");
    const favoritos = Array.isArray(res.data) ? res.data : [];
    return { data: favoritos.map((f) => f.pet) };
  },

  isFavorite: async (petId) => {
    try {
      const res = await api.get(`/favorites/check/${petId}`);
      return Boolean(res.data?.isFavorite);
    } catch {
      return false;
    }
  },

  add: (petId) => api.post(`/favorites/${petId}`),
  remove: (petId) => api.delete(`/favorites/${petId}`),
};

// ─── Users ───────────────────────────────────────────────
// POST   { fullName, email, password, phone, region, userType, profileDescription, profileImage }
// PUT    { fullName, phone, region, profileDescription, profileImage, status }
export const userService = {
  getAll: () => api.get("/users"),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post("/users", data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
};

// ─── Pets ────────────────────────────────────────────────
// POST   { idUser, name, petType, breed, age, gender, size, vaccinated, sterilized, description, region }
// PUT    { name, breed, age, gender, size, vaccinated, sterilized, description, region, publicationStatus }
export const petService = {
  getAll: (params) => api.get("/pets", { params }),
  getById: (id) => api.get(`/pets/${id}`),
  create: (data) => api.post("/pets", data),
  update: (id, data) => api.put(`/pets/${id}`, data),
  delete: (id) => api.delete(`/pets/${id}`),
};

// ─── Pet Photos ──────────────────────────────────────────
// POST   { idPet, photoUrl, isMain }
export const petPhotoService = {
  getByPet: (petId) => api.get(`/pet-photos/by-pet/${petId}`),
  create: (data) => api.post("/pet-photos", data),
  delete: (id) => api.delete(`/pet-photos/${id}`),
};

// ─── Adoption Requests ───────────────────────────────────
// POST   { idPet, idUser, address, housingType, petExperience, hasOtherPets, contactPhone, adoptionReason }
// PATCH  { requestStatus }
export const adoptionService = {
  getById: (id) => api.get(`/adoption-requests/${id}`),
  getByPet: (petId) => api.get(`/adoption-requests/by-pet/${petId}`),
  getByUser: (userId) => api.get(`/adoption-requests/by-user/${userId}`),
  create: (data) => api.post("/adoption-requests", data),
  updateStatus: (id, requestStatus) =>
    api.patch(`/adoption-requests/${id}/status`, { requestStatus }),
  delete: (id) => api.delete(`/adoption-requests/${id}`),
};

// ─── Marketplace Items ───────────────────────────────────
// POST   { idUser, title, category, description, itemCondition, price, region, mainPhoto }
// PUT    { title, category, description, itemCondition, price, region, mainPhoto, publicationStatus }
export const marketplaceService = {
  getAll: () => api.get("/marketplace-items"),
  getById: (id) => api.get(`/marketplace-items/${id}`),
  create: (data) => api.post("/marketplace-items", data),
  update: (id, data) => api.put(`/marketplace-items/${id}`, data),
  delete: (id) => api.delete(`/marketplace-items/${id}`),
};

// ─── Consultations ───────────────────────────────────────
// POST   { senderIdUser, receiverIdUser, subject, message }
// PATCH  { consultationStatus }
export const consultationService = {
  getById: (id) => api.get(`/consultations/${id}`),
  getBySender: (userId) => api.get(`/consultations/by-sender/${userId}`),
  getByReceiver: (userId) => api.get(`/consultations/by-receiver/${userId}`),
  create: (data) => api.post("/consultations", data),
  updateStatus: (id, consultationStatus) =>
    api.patch(`/consultations/${id}/status`, { consultationStatus }),
};

// ─── Consultation Responses ──────────────────────────────
// POST   { idConsultation, idUser, responseMessage }
export const consultationResponseService = {
  getByConsultation: (id) =>
    api.get(`/consultation-responses/by-consultation/${id}`),
  create: (data) => api.post("/consultation-responses", data),
};

export default api;

// ─── Shelters (real: GET /api/shelters, público) ──────────────────────────
// El backend ya filtra server-side por userType === 'shelter' (ver
// SheltersController), así que el directorio público ya no necesita traer
// la tabla completa de usuarios para armarse en el cliente.
export const shelterService = {
  getAll: () => api.get("/shelters"),

  getById: (id) => api.get(`/shelters/${id}`),

  // Trae las mascotas de un refugio específico
  getPetsByShelterId: (shelterId) => api.get(`/shelters/${shelterId}/pets`),

  // Para el dashboard: trae las mascotas del usuario logueado
  getMyPets: async () => {
    const stored = localStorage.getItem("adopaws_user");
    const user = stored ? JSON.parse(stored) : null;
    if (!user?.id) return { data: [] };
    const res = await api.get("/pets");
    const pets = (Array.isArray(res.data) ? res.data : []).filter(
      (p) => p.idUser === user.id,
    );
    return { data: pets };
  },
};
