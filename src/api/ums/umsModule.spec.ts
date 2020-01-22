// tslint:disable:no-string-literal
import * as faker from "faker";
import { ReflectiveInjector } from "injection-js";
import { createMockFor, SpyObj } from "../../../spec/testUtils";
import { API } from "../../config";
import { RequestExecuter } from "../../internal/executer";
import { RequestAdapter, RequestMethod } from "../../internal/requestAdapter";
import { deferPromise } from "../../internal/utils";
import { Client } from "../core/client";
import { DeleteQuery } from "../core/queries/deleteQuery";
import { SelectQuery } from "../core/queries/selectQuery";
import { UpdateQuery } from "../core/queries/updateQuery";
import { AuthOptions, TokenManager } from "../core/tokenManager";
import { UMSModule } from "./umsModule";

describe("UMS Module", () => {
  const projectID = faker.random.uuid();
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
    requestExecuterMock = createMockFor(RequestExecuter),
    // @ts-ignore
    systemDefer = deferPromise<Client>(),
    injectorMock = createMockFor(["get", "resolveAndCreateChild"]) as SpyObj<ReflectiveInjector>,
  } = {}) {
    (tokenManagerMock as any)["token"] = () => tokenPromise;
    const injectorMap = new Map<any, any>([
      [TokenManager, tokenManagerMock],
      [RequestAdapter, requestAdapterMock],
      [AuthOptions, { projectID }],
      [RequestExecuter, requestExecuterMock]
    ]);
    injectorMock.get.mockImplementation((key: any) => injectorMap.get(key));
    injectorMock.resolveAndCreateChild.mockImplementation(() => injectorMock);
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

  it("should get a base path based on project id", async () => {
    const { subject, systemDefer, init } = createSubject();
    systemDefer.resolve();
    await init();
    expect(subject.basePath).toEqual(`${API.PROTOCOL}://${projectID}.${API.HOST}.${API.DOMAIN}:${API.PORT}`);
  });

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

    it("should be able start a select query", async () => {
      const { subject, init } = createSubject();
      await init();
      expect(subject.select() instanceof SelectQuery).toBeTruthy();
    });

    it("should be able start a update query", async () => {
      const { subject, init } = createSubject();
      await init();
      expect(subject.update({}) instanceof UpdateQuery).toBeTruthy();
    });

    it("should be able start a delete query", async () => {
      const { subject, init } = createSubject();
      await init();
      expect(subject.delete() instanceof DeleteQuery).toBeTruthy();
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

    it("should call correct API with correct data if there is extra field", async () => {
      const { subject, systemDefer, requestAdapterMock, init } = createSubject();
      systemDefer.resolve();
      await init();
      await subject.signUp(testCredentials, { extraField: true });
      expect(requestAdapterMock.execute).toBeCalledWith(
        `${API.PROTOCOL}://${projectID}.${API.HOST}.${API.DOMAIN}:${API.PORT}/${API.UMS.ENDPOINT}/${API.UMS.SIGNUP}`,
        {
          body: {
            email: testCredentials.email,
            password: testCredentials.password,
            extraField: true,
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

    describe("request user's password reset", () => {
      it("should call API with correct parameters", async () => {
        const { subject, requestAdapterMock, systemDefer, init } = createSubject();
        const email = faker.internet.email();
        systemDefer.resolve();
        await init();
        await subject.requestResetPassword(email);

        expect(requestAdapterMock.execute).toHaveBeenCalledWith(
          `${subject.basePath}/${API.UMS.ENDPOINT}/${API.UMS.RESETPASSWORD}`,
          {
            body: { email },
            method: RequestMethod.POST,
          },
        );
      });
    });

    describe("when request user's password reset", () => {
      it("should call API with correct parameters", async () => {
        const { subject, requestAdapterMock, systemDefer, init } = createSubject();
        const token = faker.random.alphaNumeric(12);
        const newPassword = faker.random.alphaNumeric(12);

        systemDefer.resolve();
        await init();
        await subject.resetPassword(token, newPassword);

        expect(requestAdapterMock.execute).toHaveBeenCalledWith(
          `${subject.basePath}/${API.UMS.ENDPOINT}/${API.UMS.RESETPASSWORD}/${token}`,
          {
            body: { new_password: newPassword },
            method: RequestMethod.POST,
          },
        );
      });
    });
  });

});
