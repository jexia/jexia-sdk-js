// tslint:disable:no-string-literal
import * as faker from "faker";
import { ReflectiveInjector } from "injection-js";
import { createMockFor, SpyObj } from "../../../spec/testUtils";
import { API } from "../../config";
import { RequestAdapter, RequestMethod } from "../../internal/requestAdapter";
import { deferPromise } from "../../internal/utils";
import { Client } from "../core/client";
import { AuthOptions, TokenManager } from "../core/tokenManager";
import { UMSModule } from "./umsModule";

describe("UMS Module", () => {
  const projectID = "projectIDTest";
  const tokenTest = "tokenTest";
  const testUser = {
    email: faker.internet.email(),
    password: faker.internet.password(),
    default: false,
    alias: "testAuth",
  };
  const testCredentials = {
    email: faker.internet.email(),
    password: faker.internet.password(),
  };
  const signedInResult = {
    id: "testUserId",
  };

  function createSubject({
    tokenPromise = Promise.resolve(tokenTest),
    tokenManagerMock = createMockFor(TokenManager),
    requestAdapterMock = createMockFor(RequestAdapter, {
      returnValue: Promise.resolve(signedInResult)
    }),
    // @ts-ignore
    systemDefer = deferPromise<Client>(),
    injectorMock = createMockFor(["get"]) as SpyObj<ReflectiveInjector>,
  } = {}) {
    (tokenManagerMock as any)["token"] = () => tokenPromise;
    const injectorMap = new Map<any, any>([
      [TokenManager, tokenManagerMock],
      [RequestAdapter, requestAdapterMock],
      [AuthOptions, { projectID }],
    ]);
    injectorMock.get.mockImplementation((key: any) => injectorMap.get(key));
    const subject = new UMSModule();

    return {
      subject,
      tokenManagerMock,
      requestAdapterMock,
      systemDefer,
      injectorMock,
      init() {
        return subject.init(injectorMock);
      }
    };
  }

  describe("on initialize", () => {

    it("should get tokenManager from the injector", async () => {
      const { subject, tokenManagerMock, init } = createSubject();
      await init();
      expect((subject as any).tokenManager).toEqual(tokenManagerMock);
    });

    it("should get requestAdapter from the injector", async () => {
      const { subject, requestAdapterMock, init } = createSubject();
      await init();
      expect((subject as any).requestAdapter).toEqual(requestAdapterMock);
    });

    it("should get project id from the injector", async () => {
      const { subject, init } = createSubject();
      await init();
      expect((subject as any).projectId).toEqual(projectID);
    });

    it("should throw correct error if initialized incorrectly", () => {
      expect(() => (UMSModule as any)()).toThrow("UMS module initialized incorrectly, you need to include 'new'");
    });

  });

  describe("when gets a module config", () => {
    it("should return an empty config", () => {
      const { subject } = createSubject();
      expect(subject.getConfig()).toEqual({ ums: {} });
    });
  });

  describe("on terminate", () => {

    it("should return resolved promise of itself", async () => {
      const { subject } = createSubject();
      const result = await subject.terminate();
      expect(result).toEqual(subject);
    });

  });

  describe("on user sign-up", () => {
    it("should call correct API with correct data", async () => {
      const { subject, systemDefer, requestAdapterMock, init } = createSubject();
      systemDefer.resolve();
      await init();
      await subject.signUp(testCredentials);
      expect(requestAdapterMock.execute).toBeCalledWith(
        `${API.PROTOCOL}://${projectID}.${API.HOST}.${API.DOMAIN}:${API.PORT}/${API.UMS.ENDPOINT}/${API.UMS.SIGNUP}`,
        {
          body: {
            email: testCredentials.email,
            password: testCredentials.password
          },
          method: "POST"
        }
      );
    });
  });

  describe("user sign-in", () => {

    it("should call correct API with correct data", async () => {
      const { subject, systemDefer, requestAdapterMock, init } = createSubject();
      systemDefer.resolve();
      await init();
      await subject.signIn(testUser);
      expect(requestAdapterMock.execute).toBeCalledWith(
        `${API.PROTOCOL}://${projectID}.${API.HOST}.${API.DOMAIN}:${API.PORT}/${API.AUTH}`,
        {
          body: {
            method: "ums",
            email: testUser.email,
            password: testUser.password
          },
          method: "POST"
        }
      );
    });

  });

  describe("token management", () => {
    it("should set default token by alias", () => {
      const { subject, init, tokenManagerMock } = createSubject();
      const alias = faker.internet.email();
      init();
      subject.setDefault(alias);
      expect(tokenManagerMock.setDefault).toHaveBeenCalledWith(alias);
    });

    it("should reset to default token", () => {
      const { subject, init, tokenManagerMock } = createSubject();
      init();
      subject.resetDefault();
      expect(tokenManagerMock.resetDefault).toHaveBeenCalled();
    });
  });

  describe("user management", () => {

    describe("get current user", () => {
      it("should get token from token manager by provided alias", async () => {
        const { subject, tokenManagerMock, systemDefer, init } = createSubject();
        jest.spyOn(tokenManagerMock, "token");
        systemDefer.resolve();
        await init();
        await subject.getUser(testUser.alias);
        expect(tokenManagerMock.token).toHaveBeenCalledWith(testUser.alias);
      });

      it("should call correct API to get current user", async () => {
        const { subject, requestAdapterMock, systemDefer, init } = createSubject();
        systemDefer.resolve();
        await init();
        await subject.getUser(testUser.alias);
        expect(requestAdapterMock.execute).toHaveBeenCalledWith(
          `${API.PROTOCOL}://${projectID}.${API.HOST}.${API.DOMAIN}:${API.PORT}/${API.UMS.ENDPOINT}/${API.UMS.USER}`,
          {
            headers: { Authorization: `Bearer ${tokenTest}`},
          },
        );
      });
    });

    describe("update password", () => {
      it("should get token from token manager by provided alias", async () => {
        const { subject, tokenManagerMock, systemDefer, init } = createSubject();
        jest.spyOn(tokenManagerMock, "token");
        systemDefer.resolve();
        await init();
        await subject.changePassword(testUser.alias, testUser.password, faker.internet.password());
        expect(tokenManagerMock.token).toHaveBeenCalledWith(testUser.alias);
      });

      it("should call correct API to update password", async () => {
        const { subject, requestAdapterMock, systemDefer, init } = createSubject();
        const newPassword = faker.internet.password();
        systemDefer.resolve();
        await init();
        await subject.changePassword(testUser.alias, testUser.password, newPassword);
        expect(requestAdapterMock.execute).toHaveBeenCalledWith(
          // tslint:disable-next-line
          `${API.PROTOCOL}://${projectID}.${API.HOST}.${API.DOMAIN}:${API.PORT}/${API.UMS.ENDPOINT}/${API.UMS.CHANGEPASSWORD}`,
          {
            body: {
              old_password: testUser.password,
              new_password: newPassword,
            },
            headers: { Authorization: `Bearer ${tokenTest}`},
            method: RequestMethod.POST,
          },
        );
      });
    });

    describe("delete current user", () => {
      it("should get token from token manager by provided alias", async () => {
        const { subject, tokenManagerMock, systemDefer, init } = createSubject();
        jest.spyOn(tokenManagerMock, "token");
        systemDefer.resolve();
        await init();
        await subject.deleteUser(testUser.alias, testUser.password);
        expect(tokenManagerMock.token).toHaveBeenCalledWith(testUser.alias);
      });

      it("should call correct API to delete current user", async () => {
        const { subject, requestAdapterMock, systemDefer, init } = createSubject();
        systemDefer.resolve();
        await init();
        await subject.deleteUser(testUser.alias, testUser.password);
        expect(requestAdapterMock.execute).toHaveBeenCalledWith(
          `${API.PROTOCOL}://${projectID}.${API.HOST}.${API.DOMAIN}:${API.PORT}/${API.UMS.ENDPOINT}/${API.UMS.USER}`,
          {
            body: { password: testUser.password },
            headers: { Authorization: `Bearer ${tokenTest}`},
            method: RequestMethod.DELETE,
          },
        );
      });
    });
  });

});
