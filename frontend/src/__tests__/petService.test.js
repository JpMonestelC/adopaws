import { describe, it, expect, beforeEach } from "vitest";
import MockAdapter from "axios-mock-adapter";
import api, { petService } from "../services/api";

const mock = new MockAdapter(api);

beforeEach(() => {
  mock.reset();
});

describe("petService", () => {
  // ─── getAll ───────────────────────────────────────────
  describe("getAll", () => {
    it("debe retornar lista de mascotas", async () => {
      const mascotas = [
        { idPet: 1, name: "Firulais", petType: "dog" },
        { idPet: 2, name: "Michi", petType: "cat" },
      ];
      mock.onGet("/pets").reply(200, mascotas);

      const res = await petService.getAll();
      expect(res.data).toEqual(mascotas);
    });

    it("debe retornar lista vacía si no hay mascotas", async () => {
      mock.onGet("/pets").reply(200, []);

      const res = await petService.getAll();
      expect(res.data).toEqual([]);
    });
  });

  // ─── getById ──────────────────────────────────────────
  describe("getById", () => {
    it("debe retornar una mascota por id", async () => {
      const mascota = { idPet: 1, name: "Firulais", petType: "dog" };
      mock.onGet("/pets/1").reply(200, mascota);

      const res = await petService.getById(1);
      expect(res.data).toEqual(mascota);
    });

    it("debe fallar si la mascota no existe", async () => {
      mock.onGet("/pets/999").reply(404);

      await expect(petService.getById(999)).rejects.toThrow();
    });
  });

  // ─── create ───────────────────────────────────────────
  describe("create", () => {
    it("debe crear una mascota correctamente", async () => {
      const nueva = {
        idUser: 1,
        name: "Rex",
        petType: "dog",
        breed: "Labrador",
        age: 2,
        gender: "male",
        size: "large",
        vaccinated: true,
        sterilized: false,
        description: "Muy juguetón",
        region: "San José",
      };
      const respuesta = { idPet: 3, ...nueva };
      mock.onPost("/pets").reply(201, respuesta);

      const res = await petService.create(nueva);
      expect(res.data.idPet).toBe(3);
      expect(res.data.name).toBe("Rex");
    });

    it("debe fallar si el servidor retorna error", async () => {
      mock.onPost("/pets").reply(500);

      await expect(petService.create({})).rejects.toThrow();
    });
  });

  // ─── update ───────────────────────────────────────────
  describe("update", () => {
    it("debe actualizar una mascota correctamente", async () => {
      const actualizado = { name: "Rex Actualizado", region: "Alajuela" };
      mock.onPut("/pets/1").reply(200, { idPet: 1, ...actualizado });

      const res = await petService.update(1, actualizado);
      expect(res.data.name).toBe("Rex Actualizado");
    });

    it("debe fallar si la mascota no existe", async () => {
      mock.onPut("/pets/999").reply(404);

      await expect(petService.update(999, {})).rejects.toThrow();
    });
  });

  // ─── delete ───────────────────────────────────────────
  describe("delete", () => {
    it("debe eliminar una mascota correctamente", async () => {
      mock.onDelete("/pets/1").reply(200);

      const res = await petService.delete(1);
      expect(res.status).toBe(200);
    });

    it("debe fallar si la mascota no existe", async () => {
      mock.onDelete("/pets/999").reply(404);

      await expect(petService.delete(999)).rejects.toThrow();
    });
  });
});