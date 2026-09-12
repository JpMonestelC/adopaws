import { describe, it, expect, beforeEach } from "vitest";
import MockAdapter from "axios-mock-adapter";
import api, { userService } from "../services/api";

const mock = new MockAdapter(api);

beforeEach(() => {
  mock.reset();
});

describe("userService", () => {

  describe("getAll", () => {
    it("debe retornar lista de usuarios", async () => {
      const usuarios = [
        { idUser: 1, fullName: "Juan", email: "juan@test.com" },
        { idUser: 2, fullName: "Ana", email: "ana@test.com" },
      ];
      mock.onGet("/users").reply(200, usuarios);

      const res = await userService.getAll();
      expect(res.data).toEqual(usuarios);
    });

    it("debe retornar lista vacía si no hay usuarios", async () => {
      mock.onGet("/users").reply(200, []);

      const res = await userService.getAll();
      expect(res.data).toEqual([]);
    });
  });


  describe("getById", () => {
    it("debe retornar un usuario por id", async () => {
      const usuario = { idUser: 1, fullName: "Juan", email: "juan@test.com" };
      mock.onGet("/users/1").reply(200, usuario);

      const res = await userService.getById(1);
      expect(res.data).toEqual(usuario);
    });

    it("debe fallar si el usuario no existe", async () => {
      mock.onGet("/users/999").reply(404);

      await expect(userService.getById(999)).rejects.toThrow();
    });
  });

 
  describe("create", () => {
    it("debe crear un usuario correctamente", async () => {
      const nuevo = {
        fullName: "Carlos",
        email: "carlos@test.com",
        password: "1234",
        userType: "adopter",
        phone: "88881111",
        region: "San José",
        profileDescription: "",
        profileImage: "",
      };
      const respuesta = { idUser: 3, ...nuevo };
      mock.onPost("/users").reply(201, respuesta);

      const res = await userService.create(nuevo);
      expect(res.data.idUser).toBe(3);
      expect(res.data.email).toBe("carlos@test.com");
    });

    it("debe fallar si el servidor retorna error", async () => {
      mock.onPost("/users").reply(500);

      await expect(userService.create({})).rejects.toThrow();
    });
  });


  describe("update", () => {
    it("debe actualizar un usuario correctamente", async () => {
      const actualizado = { fullName: "Juan Actualizado", phone: "99990000" };
      mock.onPut("/users/1").reply(200, { idUser: 1, ...actualizado });

      const res = await userService.update(1, actualizado);
      expect(res.data.fullName).toBe("Juan Actualizado");
    });

    it("debe fallar si el usuario no existe", async () => {
      mock.onPut("/users/999").reply(404);

      await expect(userService.update(999, {})).rejects.toThrow();
    });
  });


  describe("delete", () => {
    it("debe eliminar un usuario correctamente", async () => {
      mock.onDelete("/users/1").reply(200);

      const res = await userService.delete(1);
      expect(res.status).toBe(200);
    });

    it("debe fallar si el usuario no existe", async () => {
      mock.onDelete("/users/999").reply(404);

      await expect(userService.delete(999)).rejects.toThrow();
    });
  });
});