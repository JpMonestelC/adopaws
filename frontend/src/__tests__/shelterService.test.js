import { describe, it, expect, beforeEach } from "vitest";
import MockAdapter from "axios-mock-adapter";
import api, { shelterService } from "../services/api";

const mock = new MockAdapter(api);

beforeEach(() => {
  mock.reset();
});

describe("shelterService", () => {
  // ─── getAll ───────────────────────────────────────────
  describe("getAll", () => {
    it("debe retornar la lista de refugios desde /shelters", async () => {
      const refugios = [
        { idUser: 1, fullName: "Refugio Feliz", userType: "shelter" },
        { idUser: 2, fullName: "Patitas Contentas", userType: "shelter" },
      ];
      mock.onGet("/shelters").reply(200, refugios);

      const res = await shelterService.getAll();
      expect(res.data).toEqual(refugios);
    });

    it("debe retornar lista vacía si no hay refugios", async () => {
      mock.onGet("/shelters").reply(200, []);

      const res = await shelterService.getAll();
      expect(res.data).toEqual([]);
    });
  });

  // ─── getById ──────────────────────────────────────────
  describe("getById", () => {
    it("debe retornar un refugio por id", async () => {
      const refugio = { idUser: 1, fullName: "Refugio Feliz", userType: "shelter" };
      mock.onGet("/shelters/1").reply(200, refugio);

      const res = await shelterService.getById(1);
      expect(res.data).toEqual(refugio);
    });

    it("debe fallar (404) si el id no es de un refugio", async () => {
      mock.onGet("/shelters/999").reply(404);

      await expect(shelterService.getById(999)).rejects.toThrow();
    });
  });

  // ─── getPetsByShelterId ───────────────────────────────
  describe("getPetsByShelterId", () => {
    it("debe retornar las mascotas del refugio", async () => {
      const mascotas = [{ idPet: 10, idUser: 1, name: "Luna" }];
      mock.onGet("/shelters/1/pets").reply(200, mascotas);

      const res = await shelterService.getPetsByShelterId(1);
      expect(res.data).toEqual(mascotas);
    });
  });
});
