import * as faker from "faker";
import { IAuthOptions } from "../api/core/tokenManager";
import {
  API,
  API_SUFFIX,
  DEFAULT_PROJECT_ZONE,
  getApiUrl,
  stripUrlSlashes,
  getRtcUrl,
  REALTIME_SUFFIX,
  getZone,
  getProjectId,
} from "./config";

const createAuthOptions = ({
  projectID = faker.random.uuid(),
  zone = faker.helpers.randomize(["nl00", "nl01", "nl03"]) as string | null,
  projectURL = null as string | null,
  config = { projectID, zone, projectURL } as IAuthOptions,
} = {}) => config;

describe("get api url", () => {
  it("should return composed url", () => {
    const authOptions = createAuthOptions();

    expect(getApiUrl(authOptions)).toEqual([
      API.PROTOCOL,
      authOptions.projectID + ".",
      getZone(authOptions.zone) + ".",
      API_SUFFIX,
    ].join(""));
  });

  it("should return given project URL when provided", () => {
    const projectURL = faker.internet.url();
    const authOptions = createAuthOptions({ projectURL });

    expect(getApiUrl(authOptions)).toEqual(stripUrlSlashes(projectURL));
  });

  ["", null].forEach((zone) => {
    it(`should return url with default zone when given zone is "${zone}"`, () => {
      const authOptions = createAuthOptions({ zone });

      expect(getApiUrl(authOptions)).toContain("." + DEFAULT_PROJECT_ZONE);
    });
  });
});

describe("get rtc url", () => {
  const generateToken = () => {
    const token = faker.random.alphaNumeric(36);
    return { token, expectedParam: `?access_token=${token}` };
  };

  it("should return composed url", () => {
    const authOptions = createAuthOptions();
    const { token, expectedParam } = generateToken();

    expect(getRtcUrl(authOptions, token)).toEqual([
      API.REAL_TIME.PROTOCOL,
      authOptions.projectID + ".",
      getZone(authOptions.zone) + ".",
      REALTIME_SUFFIX,
      expectedParam,
    ].join(""));
  });

  it("should return given project URL formatted", () => {
    const domain = faker.internet.domainName();
    const projectURL = `${faker.internet.protocol()}://${domain}`;
    const authOptions = createAuthOptions({ projectURL });
    const { token, expectedParam } = generateToken();

    expect(getRtcUrl(authOptions, token)).toEqual([
      API.REAL_TIME.PROTOCOL,
      domain,
      API.REAL_TIME.ENDPOINT,
      expectedParam,
    ].join(""));
  });

  ["", null].forEach((zone) => {
    it(`should return url with default zone when given zone is "${zone}"`, () => {
      const authOptions = createAuthOptions({ zone });
      const { token } = generateToken();

      expect(getRtcUrl(authOptions, token)).toContain("." + DEFAULT_PROJECT_ZONE);
    });
  });
});

describe("get zone", () => {
  it("should return given zone when isn't nullish", () => {
    const zone = faker.random.word();

    expect(getZone(zone)).toEqual(zone);
  });

  [undefined, null, ""].forEach((zone) => {
    it(`should return default zone when provided one is "${zone}"`, () => {
      expect(getZone(zone)).toEqual(DEFAULT_PROJECT_ZONE);
    });
  });
});

describe("strip url slashes", () => {
  it("should return given project URL without changes when it doesn't contain slashes", () => {
    const projectURL = faker.internet.url();

    expect(stripUrlSlashes(projectURL)).toEqual(projectURL);
  });

  it("should strip trailling slashes", () => {
    const projectURL = faker.internet.url();
    const times = faker.random.number({ min: 1, max: 10 });

    expect(stripUrlSlashes(projectURL + "/".repeat(times))).toEqual(projectURL);
  });

  [undefined, null, ""].forEach((url) => {
    it(`should return empty string when url is "${url}"`, () => {
      expect(stripUrlSlashes(url)).toEqual("");
    });
  });
});

describe("get project id", () => {
  it("should return project id when config object has it", () => {
    const config = {
      projectID: faker.random.uuid(),
      projectURL: faker.internet.url(),
    };

    expect(getProjectId(config)).toEqual(config.projectID);
  });

  it("should get id from URL when id is not provided", () => {
    const projectID = faker.random.uuid();
    const config = {
      projectURL: `https://${projectID}.com`,
    };

    expect(getProjectId(config)).toEqual(projectID);
  });

  it("should return empty string when there is no id in URL", () => {
    const config = {
      projectURL: faker.internet.url(),
    };

    expect(getProjectId(config)).toEqual("");
  });
});
