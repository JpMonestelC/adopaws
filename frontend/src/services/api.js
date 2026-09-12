import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "/api";

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Adjunta el JWT (si existe) a cada request saliente. Ningún endpoint
// exige autenticación todavía ([Authorize] no está en los controladores),
// pero el token ya viaja listo para cuando se protejan rutas.
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

// ─── Favorites (simulado: no hay endpoint de backend aún) ─
// Se guarda una lista de ids de mascota en localStorage por usuario,
// para que "Mis favoritos" funcione de forma consistente sin backend.
const FAVORITES_KEY = "adopaws_favorites";

function readFavoriteIds() {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeFavoriteIds(ids) {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(ids));
}

export const favoriteService = {
  // Devuelve las mascotas favoritas completas (no solo ids), trayendo
  // el detalle de cada una desde /api/pets/{id}.
  getFavorites: async () => {
    const ids = readFavoriteIds();
    if (ids.length === 0) return { data: [] };
    const results = await Promise.allSettled(
      ids.map((id) => api.get(`/pets/${id}`)),
    );
    const pets = results
      .filter((r) => r.status === "fulfilled")
      .map((r) => r.value.data);
    return { data: pets };
  },

  isFavorite: (petId) => readFavoriteIds().includes(Number(petId)),

  toggle: (petId) => {
    const id = Number(petId);
    const ids = readFavoriteIds();
    const next = ids.includes(id)
      ? ids.filter((existing) => existing !== id)
      : [...ids, id];
    writeFavoriteIds(next);
    return next.includes(id);
  },
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

// ─── Shelters (simulado: son usuarios con userType === 'shelter') ─────────────
export const shelterService = {
  // Trae todos los usuarios y filtra los que son refugio
  getAll: async () => {
    const res = await api.get("/users");
    const shelters = (Array.isArray(res.data) ? res.data : []).filter(
      (u) => u.userType === "shelter" || u.userType === "Shelter",
    );
    return { data: shelters };
  },

  // Trae un refugio por id (es un usuario)
  getById: async (id) => {
    const res = await api.get(`/users/${id}`);
    return res;
  },

  // Trae las mascotas de un refugio específico (idUser = id del refugio)
  getPetsByShelterId: async (shelterId) => {
    const res = await api.get("/pets");
    const pets = (Array.isArray(res.data) ? res.data : []).filter(
      (p) => p.idUser === parseInt(shelterId),
    );
    return { data: pets };
  },

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
