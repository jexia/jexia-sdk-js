import { encode } from "jwt-simple";
import { randomNumber } from "./testUtils";

export function createTestToken(expired = false): string {
  const year = expired? new Date().getFullYear() - 1 : new Date().getFullYear() + 1;
  const month = (randomNumber(1, 12));
  const day = (randomNumber(1, 25));
  const hour = (randomNumber(1, 12));
  const minutes = (randomNumber(1, 59));

  return encode({
    iss: "Jexia.com",
    iat: new Date(new Date().getFullYear(), month, day, hour, minutes).getTime() / 1000,
    exp: new Date(year, month, day, hour, minutes).getTime() / 1000,
    aud: "jexia.com",
    sub: "support@jexia.com",
  }, "secretJexia");
}
