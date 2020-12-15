import * as faker from "faker";
import { untilTokenExpired, delayTokenRefresh, isTokenExpired } from "./token";
import { createTestToken } from "../../../spec/token";

const expiredToken = createTestToken(true);
const futureToken = createTestToken();

describe("Token utils", () => {
  describe("getting time until token expired", () => {
    it("should return '0' when the token got expired", () => {
      const time = untilTokenExpired(expiredToken);
      expect(time).toBe(0);
    });

    it("should return time until the token got expired", () => {
      const time = untilTokenExpired(futureToken);
      expect(time).toBeGreaterThan(0);
    });
  });

  describe("calculating time for delay", () => {
    it("should return '0' when the token got expired", () => {
      const time = delayTokenRefresh(expiredToken);
      expect(time).toBe(0);
    });

    it("should return time until the token got expired", () => {
      const time = delayTokenRefresh(futureToken);
      expect(time).toBeGreaterThan(0);
    });
  });

  describe.only("token expired", () => {
    it("should return 'false' when the token got expired", () => {
      const expired = isTokenExpired(expiredToken);
      expect(expired).toBe(true);
    });

    it("should return 'true' when the token got expired", () => {
      const expired = isTokenExpired(futureToken);
      expect(expired).toBe(false);
    });

    it("should return 'true' when dealing with an invalid token", () => {
      const expired = isTokenExpired(faker.random.word());
      expect(expired).toBe(true);
    });
  });
});
