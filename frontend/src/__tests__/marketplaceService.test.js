import { describe, it, expect, beforeEach } from "vitest";
import MockAdapter from "axios-mock-adapter";
import api, { marketplaceService } from "../services/api";

const mock = new MockAdapter(api);

beforeEach(() => {
  mock.reset();
});

describe("marketplaceService", () => {
  // ─── getAll ───────────────────────────────────────────
  describe("getAll", () => {
    it("debe retornar lista de artículos", async () => {
      const articulos = [
        { idMarketplaceItem: 1, title: "Collar para perro", price: 5000 },
        { idMarketplaceItem: 2, title: "Cama para gato", price: 12000 },
      ];
      mock.onGet("/marketplace-items").reply(200, articulos);

      const res = await marketplaceService.getAll();
      expect(res.data).toEqual(articulos);
    });

    it("debe retornar lista vacía si no hay artículos", async () => {
      mock.onGet("/marketplace-items").reply(200, []);

      const res = await marketplaceService.getAll();
      expect(res.data).toEqual([]);
    });
  });

  // ─── getById ──────────────────────────────────────────
  describe("getById", () => {
    it("debe retornar un artículo por id", async () => {
      const articulo = { idMarketplaceItem: 1, title: "Collar para perro", price: 5000 };
      mock.onGet("/marketplace-items/1").reply(200, articulo);

      const res = await marketplaceService.getById(1);
      expect(res.data).toEqual(articulo);
    });

    it("debe fallar si el artículo no existe", async () => {
      mock.onGet("/marketplace-items/999").reply(404);

      await expect(marketplaceService.getById(999)).rejects.toThrow();
    });
  });

  // ─── create ───────────────────────────────────────────
  describe("create", () => {
    it("debe crear un artículo correctamente", async () => {
      const nuevo = {
        idUser: 1,
        title: "Juguete para perro",
        category: "Juguetes",
        description: "Juguete resistente",
        itemCondition: "new",
        price: 3500,
        region: "San José",
        mainPhoto: "",
      };
      const respuesta = { idMarketplaceItem: 3, ...nuevo };
      mock.onPost("/marketplace-items").reply(201, respuesta);

      const res = await marketplaceService.create(nuevo);
      expect(res.data.idMarketplaceItem).toBe(3);
      expect(res.data.title).toBe("Juguete para perro");
    });

    it("debe fallar si el servidor retorna error", async () => {
      mock.onPost("/marketplace-items").reply(500);

      await expect(marketplaceService.create({})).rejects.toThrow();
    });
  });

  // ─── update ───────────────────────────────────────────
  describe("update", () => {
    it("debe actualizar un artículo correctamente", async () => {
      const actualizado = { title: "Juguete actualizado", price: 4000 };
      mock.onPut("/marketplace-items/1").reply(200, { idMarketplaceItem: 1, ...actualizado });

      const res = await marketplaceService.update(1, actualizado);
      expect(res.data.title).toBe("Juguete actualizado");
    });

    it("debe fallar si el artículo no existe", async () => {
      mock.onPut("/marketplace-items/999").reply(404);

      await expect(marketplaceService.update(999, {})).rejects.toThrow();
    });
  });

  // ─── delete ───────────────────────────────────────────
  describe("delete", () => {
    it("debe eliminar un artículo correctamente", async () => {
      mock.onDelete("/marketplace-items/1").reply(200);

      const res = await marketplaceService.delete(1);
      expect(res.status).toBe(200);
    });

    it("debe fallar si el artículo no existe", async () => {
      mock.onDelete("/marketplace-items/999").reply(404);

      await expect(marketplaceService.delete(999)).rejects.toThrow();
    });
  });
});