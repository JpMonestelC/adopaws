import { describe, it, expect, beforeEach } from "vitest";
import MockAdapter from "axios-mock-adapter";
import api, { adoptionService } from "../services/api";

const mock = new MockAdapter(api);

beforeEach(() => {
  mock.reset();
});

describe("adoptionService", () => {
  // ─── getById ──────────────────────────────────────────
  describe("getById", () => {
    it("debe retornar una solicitud por id", async () => {
      const solicitud = { idAdoptionRequest: 1, idPet: 1, idUser: 2 };
      mock.onGet("/adoption-requests/1").reply(200, solicitud);

      const res = await adoptionService.getById(1);
      expect(res.data).toEqual(solicitud);
    });

    it("debe fallar si la solicitud no existe", async () => {
      mock.onGet("/adoption-requests/999").reply(404);

      await expect(adoptionService.getById(999)).rejects.toThrow();
    });
  });

  // ─── getByPet ─────────────────────────────────────────
  describe("getByPet", () => {
    it("debe retornar solicitudes por mascota", async () => {
      const solicitudes = [{ idAdoptionRequest: 1, idPet: 1, idUser: 2 }];
      mock.onGet("/adoption-requests/by-pet/1").reply(200, solicitudes);

      const res = await adoptionService.getByPet(1);
      expect(res.data).toEqual(solicitudes);
    });

    it("debe retornar lista vacía si no hay solicitudes", async () => {
      mock.onGet("/adoption-requests/by-pet/1").reply(200, []);

      const res = await adoptionService.getByPet(1);
      expect(res.data).toEqual([]);
    });
  });

  // ─── getByUser ────────────────────────────────────────
  describe("getByUser", () => {
    it("debe retornar solicitudes por usuario", async () => {
      const solicitudes = [{ idAdoptionRequest: 1, idPet: 1, idUser: 2 }];
      mock.onGet("/adoption-requests/by-user/2").reply(200, solicitudes);

      const res = await adoptionService.getByUser(2);
      expect(res.data).toEqual(solicitudes);
    });
  });

  // ─── create ───────────────────────────────────────────
  describe("create", () => {
    it("debe crear una solicitud correctamente", async () => {
      const nueva = {
        idPet: 1,
        idUser: 2,
        address: "San José",
        housingType: "house",
        petExperience: "yes",
        hasOtherPets: false,
        contactPhone: "88881111",
        adoptionReason: "Quiero una mascota",
      };
      const respuesta = { idAdoptionRequest: 1, ...nueva };
      mock.onPost("/adoption-requests").reply(201, respuesta);

      const res = await adoptionService.create(nueva);
      expect(res.data.idAdoptionRequest).toBe(1);
    });

    it("debe fallar si el servidor retorna error", async () => {
      mock.onPost("/adoption-requests").reply(500);

      await expect(adoptionService.create({})).rejects.toThrow();
    });
  });

  // ─── updateStatus ─────────────────────────────────────
  describe("updateStatus", () => {
    it("debe actualizar el estado de una solicitud", async () => {
      mock.onPatch("/adoption-requests/1/status").reply(200, {
        idAdoptionRequest: 1,
        requestStatus: "approved",
      });

      const res = await adoptionService.updateStatus(1, "approved");
      expect(res.data.requestStatus).toBe("approved");
    });

    it("debe fallar si la solicitud no existe", async () => {
      mock.onPatch("/adoption-requests/999/status").reply(404);

      await expect(adoptionService.updateStatus(999, "approved")).rejects.toThrow();
    });
  });

  // ─── delete ───────────────────────────────────────────
  describe("delete", () => {
    it("debe eliminar una solicitud correctamente", async () => {
      mock.onDelete("/adoption-requests/1").reply(200);

      const res = await adoptionService.delete(1);
      expect(res.status).toBe(200);
    });

    it("debe fallar si la solicitud no existe", async () => {
      mock.onDelete("/adoption-requests/999").reply(404);

      await expect(adoptionService.delete(999)).rejects.toThrow();
    });
  });
});