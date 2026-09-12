import { describe, it, expect, beforeEach } from "vitest";
import MockAdapter from "axios-mock-adapter";
import api, { authService } from "../services/api";

const mock = new MockAdapter(api);

beforeEach(() => {
  mock.reset();
});

describe("authService", () => {
  // ─── login ────────────────────────────────────────────
  describe("login", () => {
    it("debe retornar el usuario y el token si las credenciales son válidas", async () => {
      const respuesta = {
        token: "fake.jwt.token",
        expiresAtUtc: "2026-09-10T12:00:00Z",
        user: { idUser: 1, fullName: "Juan", email: "juan@test.com", userType: "adopter" },
      };
      mock.onPost("/auth/login").reply(200, respuesta);

      const res = await authService.login({ email: "juan@test.com", password: "1234" });

      expect(res.id).toBe(1);
      expect(res.idUser).toBe(1);
      expect(res.email).toBe("juan@test.com");
      expect(res.token).toBe("fake.jwt.token");
    });

    it("debe lanzar el mensaje de error que devuelve el backend si las credenciales son inválidas", async () => {
      mock.onPost("/auth/login").reply(401, {
        statusCode: 401,
        message: "Correo o contraseña incorrectos.",
        timestamp: "2026-09-10T12:00:00Z",
      });

      await expect(
        authService.login({ email: "juan@test.com", password: "mala-clave" }),
      ).rejects.toThrow("Correo o contraseña incorrectos.");
    });

    it("debe enviar el email y password al endpoint real de login", async () => {
      mock.onPost("/auth/login").reply((config) => {
        const body = JSON.parse(config.data);
        expect(body).toEqual({ email: "juan@test.com", password: "1234" });
        return [200, { token: "t", user: { idUser: 1, email: "juan@test.com" } }];
      });

      await authService.login({ email: "juan@test.com", password: "1234" });
    });

    it("debe usar un mensaje por defecto si el backend no envía uno", async () => {
      mock.onPost("/auth/login").reply(500);

      await expect(
        authService.login({ email: "juan@test.com", password: "1234" }),
      ).rejects.toThrow("Correo o contraseña incorrectos.");
    });
  });

  // ─── register ─────────────────────────────────────────
  describe("register", () => {
    it("debe registrar un usuario nuevo y devolver el usuario con token", async () => {
      const respuesta = {
        token: "fake.jwt.token",
        expiresAtUtc: "2026-09-10T12:00:00Z",
        user: { idUser: 3, fullName: "Carlos", email: "carlos@test.com", userType: "adopter" },
      };
      mock.onPost("/auth/register").reply(201, respuesta);

      const res = await authService.register({
        fullName: "Carlos",
        email: "carlos@test.com",
        password: "1234",
        userType: "adopter",
        phone: "88881111",
        region: "San José",
        profileDescription: "",
      });

      expect(res.id).toBe(3);
      expect(res.email).toBe("carlos@test.com");
      expect(res.token).toBe("fake.jwt.token");
    });

    it("debe lanzar el mensaje de error del backend si el email ya existe", async () => {
      mock.onPost("/auth/register").reply(400, {
        statusCode: 400,
        message: "Ya existe una cuenta con ese correo.",
        timestamp: "2026-09-10T12:00:00Z",
      });

      await expect(
        authService.register({ fullName: "Carlos", email: "carlos@test.com", password: "1234" }),
      ).rejects.toThrow("Ya existe una cuenta con ese correo.");
    });

    it("debe usar 'adopter' como userType por defecto si no se especifica", async () => {
      mock.onPost("/auth/register").reply((config) => {
        const body = JSON.parse(config.data);
        expect(body.userType).toBe("adopter");
        expect(body.phone).toBe("");
        expect(body.region).toBe("");
        return [201, { token: "t", user: { idUser: 4, email: "nuevo@test.com" } }];
      });

      const res = await authService.register({
        fullName: "Nuevo",
        email: "nuevo@test.com",
        password: "1234",
      });
      expect(res.id).toBe(4);
    });
  });
});
