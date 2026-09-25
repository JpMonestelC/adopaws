import { describe, it, expect, beforeEach } from "vitest";
import MockAdapter from "axios-mock-adapter";
import api, { favoriteService } from "../services/api";

const mock = new MockAdapter(api);

beforeEach(() => {
  mock.reset();
});

describe("favoriteService", () => {
  // ─── getFavorites ─────────────────────────────────────
  describe("getFavorites", () => {
    it("debe retornar las mascotas favoritas (extraídas de cada favorito)", async () => {
      const favoritos = [
        {
          idFavorite: 1,
          idPet: 10,
          createdDate: "2026-09-25T00:00:00Z",
          pet: { idPet: 10, name: "Luna", petType: "cat" },
        },
        {
          idFavorite: 2,
          idPet: 11,
          createdDate: "2026-09-24T00:00:00Z",
          pet: { idPet: 11, name: "Rex", petType: "dog" },
        },
      ];
      mock.onGet("/favorites").reply(200, favoritos);

      const res = await favoriteService.getFavorites();
      expect(res.data).toEqual([favoritos[0].pet, favoritos[1].pet]);
    });

    it("debe retornar lista vacía si no hay favoritos", async () => {
      mock.onGet("/favorites").reply(200, []);

      const res = await favoriteService.getFavorites();
      expect(res.data).toEqual([]);
    });

    it("debe fallar si no hay sesión (401)", async () => {
      mock.onGet("/favorites").reply(401);

      await expect(favoriteService.getFavorites()).rejects.toThrow();
    });
  });

  // ─── isFavorite ───────────────────────────────────────
  describe("isFavorite", () => {
    it("debe retornar true si el backend confirma que es favorito", async () => {
      mock.onGet("/favorites/check/10").reply(200, { isFavorite: true });

      const result = await favoriteService.isFavorite(10);
      expect(result).toBe(true);
    });

    it("debe retornar false si el backend confirma que no lo es", async () => {
      mock.onGet("/favorites/check/10").reply(200, { isFavorite: false });

      const result = await favoriteService.isFavorite(10);
      expect(result).toBe(false);
    });

    it("debe retornar false (no lanzar) si la llamada falla", async () => {
      mock.onGet("/favorites/check/10").reply(500);

      const result = await favoriteService.isFavorite(10);
      expect(result).toBe(false);
    });
  });

  // ─── add / remove ─────────────────────────────────────
  describe("add", () => {
    it("debe agregar un favorito nuevo", async () => {
      mock.onPost("/favorites/10").reply(201, { idFavorite: 1, idPet: 10 });

      const res = await favoriteService.add(10);
      expect(res.status).toBe(201);
      expect(res.data.idPet).toBe(10);
    });
  });

  describe("remove", () => {
    it("debe quitar un favorito existente", async () => {
      mock.onDelete("/favorites/10").reply(204);

      const res = await favoriteService.remove(10);
      expect(res.status).toBe(204);
    });

    it("debe fallar si el favorito no existía", async () => {
      mock.onDelete("/favorites/999").reply(404);

      await expect(favoriteService.remove(999)).rejects.toThrow();
    });
  });
});
