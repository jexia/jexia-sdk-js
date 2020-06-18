import * as faker from "faker";
import { IAuthOptions } from "../api/core/tokenManager";
import { API, API_SUFFIX, DEFAULT_PROJECT_ZONE, getApiUrl } from "./config";

describe("get api url", () => {
  const createAuthOptions = ({
    projectID = faker.random.uuid(),
    zone = faker.helpers.randomize(["NL00", "NL01", "NL03"]) as string | null,
    projectURL = null as string | null,
    config = { projectID, zone, projectURL } as IAuthOptions,
  } = {}) => {
    return config;
  };

  it("should return composed url", () => {
    const authOptions = createAuthOptions();

    expect(getApiUrl(authOptions)).toEqual(
      API.PROTOCOL
      + "://"
      + authOptions.projectID
      + "."
      + authOptions.zone
      + "."
      + API_SUFFIX,
    );
  });

  it("should return given project URL when provided", () => {
    const projectURL = faker.internet.url();
    const authOptions = createAuthOptions({ projectURL });

    expect(getApiUrl(authOptions)).toEqual(projectURL);
  });

  it("should return url with given zone", () => {
    const authOptions = createAuthOptions();

    expect(getApiUrl(authOptions)).toContain("." + authOptions.zone);
  });

  it(`should return url with default zone when given zone is undefined`, () => {
    const authOptions = { projectID: faker.random.uuid() };

    expect(getApiUrl(authOptions)).toContain("." + DEFAULT_PROJECT_ZONE);
  });

  ["", null].forEach((zone) => {
    it(`should return url with default zone when given zone is "${zone}"`, () => {
      const authOptions = createAuthOptions({ zone });

      expect(getApiUrl(authOptions)).toContain("." + DEFAULT_PROJECT_ZONE);
    });
  });
});
