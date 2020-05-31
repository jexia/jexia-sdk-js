// tslint:disable:no-string-literal
import * as faker from "faker";
import { ReflectiveInjector } from "injection-js";
import { of } from "rxjs";
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
  function createSubject({
    projectId = faker.random.uuid(),
    access_token = faker.random.uuid(),
    refresh_token = faker.random.uuid(),
    user = {
      email: faker.internet.email(),
      password: faker.internet.password(),
    },
    signInOptions = {
      default: false,
      alias: faker.random.word(),
    },
    tokenManagerMock = createMockFor(TokenManager, {}, {
      token: () => of(access_token),
    }),
    requestAdapterMock = createMockFor(RequestAdapter, {
      returnValue: of({ access_token, refresh_token }),
    }),
    requestExecuterMock = createMockFor(RequestExecuter),
    systemDefer = deferPromise<Client>(),
    injectorMock = createMockFor(["get", "resolveAndCreateChild"]) as SpyObj<ReflectiveInjector>,
  } = {}) {
    const injectorMap = new Map<any, any>([
      [TokenManager, tokenManagerMock],
      [RequestAdapter, requestAdapterMock],
      [AuthOptions, { projectID: projectId }],
      [RequestExecuter, requestExecuterMock]
    ]);
    injectorMock.get.mockImplementation((key: any) => injectorMap.get(key));
    injectorMock.resolveAndCreateChild.mockImplementation(() => injectorMock);
    const subject = new UMSModule();

    return {
      subject,
      projectId,
      access_token,
      refresh_token,
      user,
      signInOptions,
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
    const { subject, projectId, systemDefer, init } = createSubject();
    systemDefer.resolve();
    await init();
    expect(subject.basePath).toEqual(`${API.PROTOCOL}://${projectId}.${API.HOST}.${API.DOMAIN}:${API.PORT}`);
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
      const { subject, init, projectId } = createSubject();
      await init();
      expect((subject as any).projectId).toEqual(projectId);
    });

    it("should throw correct error if initialized incorrectly", () => {
      expect(() => (UMSModule as any)()).toThrow(new Error("UMS module initialized incorrectly, you need to include 'new'"));
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
      const { subject, user, projectId, systemDefer, requestAdapterMock, init } = createSubject();
      systemDefer.resolve();
      await init();
      await subject.signUp(user);
      expect(requestAdapterMock.execute).toBeCalledWith(
        `${API.PROTOCOL}://${projectId}.${API.HOST}.${API.DOMAIN}:${API.PORT}/${API.UMS.ENDPOINT}/${API.UMS.SIGNUP}`,
        {
          body: user,
          method: "POST"
        }
      );
    });

    it("should call correct API with correct data if there is extra field", async () => {
      const { subject, user, projectId, systemDefer, requestAdapterMock, init } = createSubject();
      systemDefer.resolve();
      await init();
      await subject.signUp({...user, extraField: true });
      expect(requestAdapterMock.execute).toBeCalledWith(
        `${API.PROTOCOL}://${projectId}.${API.HOST}.${API.DOMAIN}:${API.PORT}/${API.UMS.ENDPOINT}/${API.UMS.SIGNUP}`,
        {
          body: {
            ...user,
            extraField: true,
          },
          method: "POST"
        }
      );
    });
  });

  describe("user sign-in", () => {

    it("should call correct API with correct data", async () => {
      const { subject, user, projectId, systemDefer, requestAdapterMock, init } = createSubject();
      systemDefer.resolve();
      await init();
      await subject.signIn(user);
      expect(requestAdapterMock.execute).toBeCalledWith(
        `${API.PROTOCOL}://${projectId}.${API.HOST}.${API.DOMAIN}:${API.PORT}/${API.AUTH}`,
        {
          body: {
            method: "ums",
            ...user,
          },
          method: "POST"
        }
      );
    });

    it("should use user's email as a default alias", async () => {
      const { subject, user, tokenManagerMock, access_token, refresh_token, systemDefer, init } = createSubject();
      systemDefer.resolve();
      await init();
      await subject.signIn(user).toPromise();

      expect(tokenManagerMock.addTokens).toHaveBeenCalledWith(
        [user.email], { access_token, refresh_token }, undefined);
    });

    describe("if alias has been provided", () => {
      it("should add it to the token manager", async () => {
        const { subject, tokenManagerMock, systemDefer, init, user } = createSubject();
        const alias = faker.random.word();
        systemDefer.resolve();
        await init();
        await subject.signIn({ ...user, alias }).toPromise();

        const { calls: [ [aliases] ] } = tokenManagerMock.addTokens.mock;

        expect(aliases).toEqual([user.email, alias]);
      });
    });

    it("should return access token", async () => {
      const { subject, user, access_token, systemDefer, init } = createSubject();
      systemDefer.resolve();
      await init();
      const token = await subject.signIn(user).toPromise();

      expect(token).toEqual(access_token);
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
        const { subject, signInOptions, tokenManagerMock, systemDefer, init } = createSubject();
        jest.spyOn(tokenManagerMock, "token");
        systemDefer.resolve();
        await init();
        await subject.getUser(signInOptions.alias);
        expect(tokenManagerMock.token).toHaveBeenCalledWith(signInOptions.alias);
      });

      it("should call correct API to get current user", async () => {
        const { subject, access_token, signInOptions, projectId, requestAdapterMock, systemDefer, init } = createSubject();
        systemDefer.resolve();
        await init();
        await subject.getUser(signInOptions.alias).subscribe();
        expect(requestAdapterMock.execute).toHaveBeenCalledWith(
          `${API.PROTOCOL}://${projectId}.${API.HOST}.${API.DOMAIN}:${API.PORT}/${API.UMS.ENDPOINT}/${API.UMS.USER}`,
          {
            headers: { Authorization: `Bearer ${access_token}`},
          },
        );
      });
    });

    describe("update password", () => {
      it("should get token from token manager by provided alias", async () => {
        const { subject, user, signInOptions, tokenManagerMock, systemDefer, init } = createSubject();
        jest.spyOn(tokenManagerMock, "token");
        systemDefer.resolve();
        await init();
        await subject.changePassword(signInOptions.alias, user.password, faker.internet.password());
        expect(tokenManagerMock.token).toHaveBeenCalledWith(signInOptions.alias);
      });

      it("should call correct API to update password", async () => {
        const { subject, user, signInOptions, access_token, projectId, requestAdapterMock, systemDefer, init } = createSubject();
        const newPassword = faker.internet.password();
        systemDefer.resolve();
        await init();
        await subject.changePassword(signInOptions.alias, user.password, newPassword).subscribe();
        expect(requestAdapterMock.execute).toHaveBeenCalledWith(
          // tslint:disable-next-line
          `${API.PROTOCOL}://${projectId}.${API.HOST}.${API.DOMAIN}:${API.PORT}/${API.UMS.ENDPOINT}/${API.UMS.CHANGEPASSWORD}`,
          {
            body: {
              old_password: user.password,
              new_password: newPassword,
            },
            headers: { Authorization: `Bearer ${access_token}`},
            method: RequestMethod.POST,
          },
        );
      });
    });

    describe("delete current user", () => {
      it("should get token from token manager by provided alias", async () => {
        const { subject, user, signInOptions, tokenManagerMock, systemDefer, init } = createSubject();
        jest.spyOn(tokenManagerMock, "token");
        systemDefer.resolve();
        await init();
        await subject.deleteUser(signInOptions.alias, user.password);
        expect(tokenManagerMock.token).toHaveBeenCalledWith(signInOptions.alias);
      });

      it("should call correct API to delete current user", async () => {
        const { subject, user, access_token, projectId, signInOptions, requestAdapterMock, systemDefer, init } = createSubject();
        systemDefer.resolve();
        await init();
        await subject.deleteUser(signInOptions.alias, user.password).subscribe();
        expect(requestAdapterMock.execute).toHaveBeenCalledWith(
          `${API.PROTOCOL}://${projectId}.${API.HOST}.${API.DOMAIN}:${API.PORT}/${API.UMS.ENDPOINT}/${API.UMS.USER}`,
          {
            body: { password: user.password },
            headers: { Authorization: `Bearer ${access_token}`},
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
