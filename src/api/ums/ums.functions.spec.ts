import * as faker from "faker";
import { getSignInParams, getSignInBody } from "./ums.functions";

const user = () => ({
  email: faker.internet.email(),
  password: faker.internet.password(),
});
const oauth = () => ({
  code: faker.random.word(),
  state: faker.helpers.randomize(["sign-in", "sign-up"]),
});
const signInOptions = () => ({
  default: false,
  alias: faker.random.word(),
});

function credentialsOptions() {
  return {
    ...user(),
    ...signInOptions(),
  };
}

function oAuthOptions() {
  return {
    ...oauth(),
    ...signInOptions(),
  };
}

describe("Sign in body", () => {
  it("should return credentials object", async () => {
    const options = user();

    const body = getSignInBody(options);

    expect(body).toEqual({
      method: "ums",
      ...options,
    });
  });

  it("should return oauth object", async () => {
    const options = oauth();

    const body = getSignInBody(options);

    expect(body).toEqual({
      method: "oauth",
      ...options,
    });
  });
});

describe("Sign in params", () => {
  it("should use append alias to the aliases", async () => {
    const options = faker.helpers.randomize([credentialsOptions(), oAuthOptions()]);

    const { aliases } = getSignInParams(options);

    expect(aliases).toContain(options.alias);
  });

  it("should return sign in body", async () => {
    const options = faker.helpers.randomize([credentialsOptions(), oAuthOptions()]);

    const { body } = getSignInParams(options);
    expect(body).toEqual(getSignInBody(options));
  });

  describe("for user credentials", () => {
    it("should use email as a default alias", async () => {
      const options = user();

      const { aliases } = getSignInParams(options);

      expect(aliases).toEqual([options.email]);
    });
  });

  describe("for oauth", () => {
    it("should use 'oauth' as a default alias", async () => {
      const options = oauth();

      const { aliases } = getSignInParams(options);

      expect(aliases).toEqual(["oauth"]);
    });
  });
});

