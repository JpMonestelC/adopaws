import { describe, it, expect, beforeEach } from "vitest";
import MockAdapter from "axios-mock-adapter";
import api, { consultationService, consultationResponseService } from "../services/api";

const mock = new MockAdapter(api);

beforeEach(() => {
  mock.reset();
});

describe("consultationService", () => {
  // ─── getById ──────────────────────────────────────────
  describe("getById", () => {
    it("debe retornar una consulta por id", async () => {
      const consulta = { idConsultation: 1, subject: "Mi perro está enfermo" };
      mock.onGet("/consultations/1").reply(200, consulta);

      const res = await consultationService.getById(1);
      expect(res.data).toEqual(consulta);
    });

    it("debe fallar si la consulta no existe", async () => {
      mock.onGet("/consultations/999").reply(404);

      await expect(consultationService.getById(999)).rejects.toThrow();
    });
  });

  // ─── getBySender ──────────────────────────────────────
  describe("getBySender", () => {
    it("debe retornar consultas por usuario emisor", async () => {
      const consultas = [{ idConsultation: 1, senderIdUser: 2 }];
      mock.onGet("/consultations/by-sender/2").reply(200, consultas);

      const res = await consultationService.getBySender(2);
      expect(res.data).toEqual(consultas);
    });

    it("debe retornar lista vacía si no hay consultas", async () => {
      mock.onGet("/consultations/by-sender/2").reply(200, []);

      const res = await consultationService.getBySender(2);
      expect(res.data).toEqual([]);
    });
  });

  // ─── getByReceiver ────────────────────────────────────
  describe("getByReceiver", () => {
    it("debe retornar consultas por veterinario receptor", async () => {
      const consultas = [{ idConsultation: 1, receiverIdUser: 3 }];
      mock.onGet("/consultations/by-receiver/3").reply(200, consultas);

      const res = await consultationService.getByReceiver(3);
      expect(res.data).toEqual(consultas);
    });
  });

  // ─── create ───────────────────────────────────────────
  describe("create", () => {
    it("debe crear una consulta correctamente", async () => {
      const nueva = {
        senderIdUser: 2,
        receiverIdUser: 3,
        subject: "Mi perro está enfermo",
        message: "Tiene fiebre desde ayer",
      };
      const respuesta = { idConsultation: 1, ...nueva };
      mock.onPost("/consultations").reply(201, respuesta);

      const res = await consultationService.create(nueva);
      expect(res.data.idConsultation).toBe(1);
      expect(res.data.subject).toBe("Mi perro está enfermo");
    });

    it("debe fallar si el servidor retorna error", async () => {
      mock.onPost("/consultations").reply(500);

      await expect(consultationService.create({})).rejects.toThrow();
    });
  });

  // ─── updateStatus ─────────────────────────────────────
  describe("updateStatus", () => {
    it("debe actualizar el estado de una consulta", async () => {
      mock.onPatch("/consultations/1/status").reply(200, {
        idConsultation: 1,
        consultationStatus: "resolved",
      });

      const res = await consultationService.updateStatus(1, "resolved");
      expect(res.data.consultationStatus).toBe("resolved");
    });

    it("debe fallar si la consulta no existe", async () => {
      mock.onPatch("/consultations/999/status").reply(404);

      await expect(consultationService.updateStatus(999, "resolved")).rejects.toThrow();
    });
  });
});

describe("consultationResponseService", () => {
  // ─── getByConsultation ────────────────────────────────
  describe("getByConsultation", () => {
    it("debe retornar respuestas de una consulta", async () => {
      const respuestas = [{ idConsultationResponse: 1, idConsultation: 1 }];
      mock.onGet("/consultation-responses/by-consultation/1").reply(200, respuestas);

      const res = await consultationResponseService.getByConsultation(1);
      expect(res.data).toEqual(respuestas);
    });

    it("debe retornar lista vacía si no hay respuestas", async () => {
      mock.onGet("/consultation-responses/by-consultation/1").reply(200, []);

      const res = await consultationResponseService.getByConsultation(1);
      expect(res.data).toEqual([]);
    });
  });

  // ─── create ───────────────────────────────────────────
  describe("create", () => {
    it("debe crear una respuesta correctamente", async () => {
      const nueva = {
        idConsultation: 1,
        idUser: 3,
        responseMessage: "Dale ibuprofeno",
      };
      const respuesta = { idConsultationResponse: 1, ...nueva };
      mock.onPost("/consultation-responses").reply(201, respuesta);

      const res = await consultationResponseService.create(nueva);
      expect(res.data.idConsultationResponse).toBe(1);
    });

    it("debe fallar si el servidor retorna error", async () => {
      mock.onPost("/consultation-responses").reply(500);

      await expect(consultationResponseService.create({})).rejects.toThrow();
    });
  });
});