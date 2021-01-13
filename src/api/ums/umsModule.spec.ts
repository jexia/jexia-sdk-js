// tslint:disable:no-string-literal
import * as faker from "faker";
import { ReflectiveInjector } from "injection-js";
import { of } from "rxjs";
import { createMockFor, SpyObj } from "../../../spec/testUtils";
import { API, getApiUrl, MESSAGE } from "../../config";
import { RequestExecuter } from "../../internal/executer";
import { RequestAdapter, RequestMethod } from "../../internal/requestAdapter";
import { deferPromise, parseQueryParams, toQueryParams } from "../../internal/utils";
import { Client } from "../core/client";
import { DeleteQuery } from "../core/queries/deleteQuery";
import { SelectQuery } from "../core/queries/selectQuery";
import { UpdateQuery } from "../core/queries/updateQuery";
import { AuthOptions, TokenManager } from "../core/tokenManager";
import { Dispatcher, DispatchEvents } from "../core/dispatcher";
import { UMSModule } from "./umsModule";
import { OAuthActionType } from "./ums.types";
import { getSignInParams } from "./ums.functions";
import { createTestToken } from "../../../spec/token";

describe("UMS Module", () => {
  const fakeOAuthActionType = (): OAuthActionType => faker.helpers.randomize(["sign-in", "sign-up"]);

  function createSubject({
    projectId = faker.random.uuid(),
    access_token = createTestToken(),
    refresh_token = faker.random.uuid(),
    email = faker.internet.email(),
    user = {
      email,
      password: faker.internet.password(),
    },
    userResponse = {
      email,
      id: faker.random.uuid(),
    },
    tokenAlias = faker.random.word(),
    signInOptions = {
      default: false,
      alias: tokenAlias,
    },
    oAuthOptions = {
      code: faker.random.word(),
      state: fakeOAuthActionType(),
    },
    oAuthInitOptions = {
      action: fakeOAuthActionType(),
      provider: faker.helpers.randomize(["google", "facebook", "twitter"]),
      redirect: faker.internet.url(),
    },
    tokenValidatedResult = tokenAlias,
    tokenManagerMock = createMockFor(TokenManager, {}, {
      token: () => of(access_token),
      validateTokenAlias: () => tokenValidatedResult,
    }),
    requestAdapterReturnValue = userResponse,
    requestAdapterMock = createMockFor(RequestAdapter, {
      returnValue: of(requestAdapterReturnValue),
    }),
    requestExecuterMock = createMockFor(RequestExecuter),
    systemDefer = deferPromise<Client>(),
    injectorMock = createMockFor(["get", "resolveAndCreateChild"]) as SpyObj<ReflectiveInjector>,
    dispatcherMock = createMockFor(Dispatcher),
  } = {}) {
    const authOptions = { projectID: projectId };
    const injectorMap = new Map<any, any>([
      [TokenManager, tokenManagerMock],
      [RequestAdapter, requestAdapterMock],
      [AuthOptions, authOptions],
      [RequestExecuter, requestExecuterMock],
      [Dispatcher, dispatcherMock],
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
      userResponse,
      signInOptions,
      oAuthOptions,
      oAuthInitOptions,
      tokenManagerMock,
      requestAdapterMock,
      systemDefer,
      injectorMock,
      authOptions,
      dispatcherMock,
      init() {
        return subject.init(injectorMock);
      },
    };
  }

  describe("get url", () => {
    it("should return base api url + endpoint", async () => {
      const { subject, authOptions, systemDefer, init } = createSubject();
      systemDefer.resolve();
      await init();

      const randomEndpoint = faker.random.word().toLowerCase();
      const expectedUrl = `${getApiUrl(authOptions)}/${API.UMS.ENDPOINT}/${randomEndpoint}`;
      expect(subject.getUrl(randomEndpoint)).toEqual(expectedUrl);
    });

    it("should NOT prepend UMS when flag is false", async () => {
      const { subject, authOptions, systemDefer, init } = createSubject();
      systemDefer.resolve();
      await init();

      const randomEndpoint = faker.random.word().toLowerCase();
      const expectedUrl = `${getApiUrl(authOptions)}/${randomEndpoint}`;

      expect(subject.getUrl(randomEndpoint, false)).toEqual(expectedUrl);
    });
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

  describe("init oauth", () => {
    let assignSpy;

    beforeEach(() => {
      assignSpy = jest.fn();
      jest.spyOn(global as any, "window", "get").mockReturnValue({
        location: {
          assign: assignSpy,
        },
      });
    });

    it("should call correct API with correct data", async () => {
      const { subject, oAuthInitOptions, systemDefer, requestAdapterMock, init } = createSubject();

      systemDefer.resolve();
      await init();
      subject.initOAuth(oAuthInitOptions);

      expect(requestAdapterMock.execute).toBeCalledWith(
        subject.getUrl(API.OAUTH.INIT, false) + parseQueryParams(toQueryParams(oAuthInitOptions)),
        { method: RequestMethod.GET },
      );
    });

  it("should resolve to URL", async () => {
      const url = faker.internet.url();
      const { subject, oAuthInitOptions, systemDefer, init } = createSubject({
        requestAdapterReturnValue: { oauth_url: url },
      });

      systemDefer.resolve();
      await init();

      subject.initOAuth(oAuthInitOptions).subscribe((oAuthUrl) => {
        expect(oAuthUrl).toEqual(url);
      });
    });

    describe("when redirect is true (default)", () => {
      it("should navigate to url", async () => {
        const url = faker.internet.url();
        const { subject, oAuthInitOptions, systemDefer, init } = createSubject({
          requestAdapterReturnValue: { oauth_url: url },
        });

        systemDefer.resolve();
        await init();

        subject.initOAuth(oAuthInitOptions).subscribe();

        expect(assignSpy).toHaveBeenCalledWith(url);
      });

      it("should NOT navigate when window is NOT an object (NodeJS)", async () => {
        const { subject, oAuthInitOptions, systemDefer, init } = createSubject();

        systemDefer.resolve();
        await init();

        jest.spyOn(global as any, "window", "get").mockReturnValue(undefined);
        subject.initOAuth(oAuthInitOptions).subscribe();

        expect(assignSpy).not.toHaveBeenCalled();
      });
    });

    describe("when redirect is false", () => {
      it("should NOT navigate to url", async () => {
        const { subject, oAuthInitOptions, systemDefer, init } = createSubject();

        systemDefer.resolve();
        await init();

        subject.initOAuth(oAuthInitOptions, false).subscribe();

        expect(assignSpy).not.toHaveBeenCalled();
      });
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
      const { subject, user, systemDefer, requestAdapterMock, init } = createSubject();
      systemDefer.resolve();
      await init();
      await subject.signUp(user);
      expect(requestAdapterMock.execute).toBeCalledWith(
        subject.getUrl(API.UMS.SIGNUP),
        {
          body: user,
          method: "POST",
        },
      );
    });

    it("should call correct API with correct data if there is extra field", async () => {
      const { subject, user, systemDefer, requestAdapterMock, init } = createSubject();
      systemDefer.resolve();
      await init();
      await subject.signUp({...user, extraField: true });
      expect(requestAdapterMock.execute).toBeCalledWith(
        subject.getUrl(API.UMS.SIGNUP),
        {
          body: {
            ...user,
            extraField: true,
          },
          method: "POST",
        },
      );
    });
  });

  describe("user sign-in", () => {
    describe("with credentials", () => {
      it("should call correct API with correct data", async () => {
        const { subject, user, systemDefer, requestAdapterMock, init } = createSubject();
        const signInParams = getSignInParams(user);

        systemDefer.resolve();
        await init();
        await subject.signIn(user);

        expect(requestAdapterMock.execute).toBeCalledWith(
          subject.getUrl(API.AUTH, false),
          {
            body: signInParams.body,
            method: RequestMethod.POST,
          },
        );
      });

      describe("if alias has been provided", () => {
        it("should add it to the token manager", async () => {
          const { subject, tokenManagerMock, systemDefer, init, user } = createSubject();
          const alias = faker.random.word();

          const { aliases } = getSignInParams({ ...user, alias });

          systemDefer.resolve();
          await init();
          await subject.signIn({ ...user, alias }).toPromise();

          const { calls: [ [tokenManagerAliases] ] } = tokenManagerMock.addTokens.mock;

          expect(tokenManagerAliases).toEqual(aliases);
        });
      });

      it("should dispatch an event", async () => {
        const { subject, user, systemDefer, init, dispatcherMock } = createSubject();

        systemDefer.resolve();
        await init();
        await subject.signIn(user).toPromise();

        expect(dispatcherMock.emit).toHaveBeenCalledWith(DispatchEvents.UMS_LOGIN);
      });
    });

    describe("OAuth", () => {
      it("should call correct API with correct data", async () => {
        const { subject, oAuthOptions, systemDefer, requestAdapterMock, init } = createSubject();
        const signInParams = getSignInParams(oAuthOptions);

        systemDefer.resolve();
        await init();
        await subject.signIn(oAuthOptions);

        expect(requestAdapterMock.execute).toBeCalledWith(
          subject.getUrl(signInParams.endpoint, false),
          {
            body: signInParams.body,
            method: RequestMethod.POST,
          },
        );
      });

      describe("if alias has been provided", () => {
        it("should add it to the token manager", async () => {
          const { subject, tokenManagerMock, systemDefer, init, oAuthOptions } = createSubject();
          const alias = faker.random.word();

          const { aliases } = getSignInParams({ ...oAuthOptions, alias });

          systemDefer.resolve();
          await init();
          await subject.signIn({ ...oAuthOptions, alias }).toPromise();

          const { calls: [ [tokenManagerAliases] ] } = tokenManagerMock.addTokens.mock;
          expect(tokenManagerAliases).toEqual(aliases);
        });
      });
    });

    it("should return user object", async () => {
      const { subject, user, systemDefer, init, userResponse } = createSubject();
      systemDefer.resolve();
      await init();
      const response = await subject.signIn(user).toPromise();

      expect(response).toEqual(userResponse);
    });
  });

  describe("user sign-out", () => {
    it("should clear tokens", async () => {
      const tokenAlias = faker.random.word();
      const { subject, tokenManagerMock, init } = createSubject({ tokenAlias });

      await init();
      subject.signOut(tokenAlias);

      expect(tokenManagerMock.removeTokens).toHaveBeenCalledWith(tokenAlias);
    });

    it("should reset the currentUser object", async () => {
      const tokenAlias = faker.random.word();
      const { subject, init, userResponse } = createSubject({ tokenAlias });

      await init();
      (subject as any).currentUserObject = userResponse;
      subject.signOut(tokenAlias);

      expect(subject.currentUser).toBeNull();
    });

    it("should NOT sign out when an invalid token is given or no default alias is set", async () => {
      const { subject, tokenManagerMock, init } = createSubject({ tokenValidatedResult : false });

      await init();
      subject.signOut();

      expect(tokenManagerMock.removeTokens).not.toHaveBeenCalled();
    });

    it("should dispatch an event", async () => {
      const { subject, init, dispatcherMock } = createSubject();

      await init();
      subject.signOut();

      expect(dispatcherMock.emit).toHaveBeenCalledWith(DispatchEvents.UMS_LOGOUT);
    });
  });

  describe("user is-logged-in", () => {
    it("should return FALSE when no valid alias has been found", async () => {
      const { subject, init } = createSubject({ tokenValidatedResult : false });

      await init();

      subject.isLoggedIn().subscribe(
        isLoggedIn => expect(isLoggedIn).toBe(false),
      );
    });

    it("should return FALSE when the given token does not exists", async () => {
      const { subject, tokenManagerMock, init } = createSubject();

      jest.spyOn((tokenManagerMock as any), "token").mockReturnValue(of(new Error("Token alias not found")));

      await init();

      subject.isLoggedIn().subscribe(
        isLoggedIn => expect(isLoggedIn).toBe(false),
      );
    });

    it("should return TRUE when the given token exists or a custom default has been set", async () => {
      const { subject, init } = createSubject();

      await init();

      subject.isLoggedIn().subscribe(
        isLoggedIn => expect(isLoggedIn).toBe(true),
      );
    });

    it("should fetch the User info when the user is loggedIn but the currentUser is NULL", async () => {
      const { subject, init, userResponse } = createSubject();

      await init();
      (subject as any).currentUserObject = null;

      await subject.isLoggedIn().subscribe();

      // test that the currentUser object is updated, as we cannot test if subject.getUser has been called or not,
      // because its always called due the nature of the iif()
      expect(subject.currentUser).toEqual(userResponse);
    });

    it("should NOT fetch the User info when the user is loggedIn and the currentUser is valid", async () => {
      const { subject, init, userResponse } = createSubject();

      await init();
      (subject as any).currentUserObject = {
        email: faker.internet.email(),
        id: faker.random.uuid(),
      };

      await subject.isLoggedIn().subscribe();

      // test that the currentUser object is NOT updated, as we cannot test if subject.getUser has been called or not,
      // because its always called due the nature of the iif()
      expect(subject.currentUser).not.toEqual(userResponse);
    });
  });

  describe("switch user", () => {
    it("should set default token by alias", () => {
      const { subject, init, tokenManagerMock, signInOptions } = createSubject({ tokenValidatedResult: true });
      init();
      subject.switchUser(signInOptions.alias);
      expect(tokenManagerMock.setDefault).toHaveBeenCalledWith(signInOptions.alias);
    });

    it("should throw an error when the alias has not been found", () => {
      const { subject, init, signInOptions } = createSubject({ tokenValidatedResult: false });
      init();
      expect(() => subject.switchUser(signInOptions.alias)).toThrow(MESSAGE.TOKEN_MANAGER.ALIAS_NOT_FOUND);
    });

    it("should dispatch an event", async () => {
      const { subject, init, signInOptions, dispatcherMock } = createSubject();

      await init();
      subject.switchUser(signInOptions.alias);

      expect(dispatcherMock.emit).toHaveBeenCalledWith(DispatchEvents.UMS_SWITCH_USER);
    });
  });

  describe("token management", () => {
    it("should reset to default token", () => {
      const { subject, init, tokenManagerMock } = createSubject();
      init();
      subject.resetDefault();
      expect(tokenManagerMock.resetDefault).toHaveBeenCalled();
    });
  });

  describe("user management", () => {

    describe("get current user", () => {
      it("should return error if alias does not exists", async () => {
        const { subject, signInOptions, tokenManagerMock, systemDefer, init } = createSubject({ tokenValidatedResult: false });
        jest.spyOn(tokenManagerMock, "token");
        systemDefer.resolve();
        await init();
        expect(() => subject.getUser(signInOptions.alias)).toThrow(MESSAGE.TOKEN_MANAGER.ALIAS_NOT_FOUND);
      });

      it("should get token from token manager by provided alias", async () => {
        const { subject, signInOptions, tokenManagerMock, systemDefer, init } = createSubject();
        jest.spyOn(tokenManagerMock, "token");
        systemDefer.resolve();
        await init();
        await subject.getUser(signInOptions.alias);
        expect(tokenManagerMock.token).toHaveBeenCalledWith(signInOptions.alias);
      });

      it("should call correct API to get current user", async () => {
        const { subject, access_token, signInOptions, requestAdapterMock, systemDefer, init } = createSubject();
        systemDefer.resolve();
        await init();
        await subject.getUser(signInOptions.alias).subscribe();
        expect(requestAdapterMock.execute).toHaveBeenCalledWith(
          subject.getUrl(API.UMS.USER),
          {
            headers: { Authorization: `Bearer ${access_token}`},
          },
        );
      });

      it("should save the current user", async () => {
        const { subject, signInOptions, systemDefer, init, userResponse } = createSubject();
        systemDefer.resolve();
        await init();
        await subject.getUser(signInOptions.alias).subscribe();
        expect(subject.currentUser).toEqual(userResponse);
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
        const { subject, user, signInOptions, access_token, requestAdapterMock, systemDefer, init } = createSubject();
        const newPassword = faker.internet.password();
        systemDefer.resolve();
        await init();
        await subject.changePassword(signInOptions.alias, user.password, newPassword).subscribe();
        expect(requestAdapterMock.execute).toHaveBeenCalledWith(
          subject.getUrl(API.UMS.CHANGEPASSWORD),
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
        const { subject, user, access_token, signInOptions, requestAdapterMock, systemDefer, init } = createSubject();
        systemDefer.resolve();
        await init();
        await subject.deleteUser(signInOptions.alias, user.password).subscribe();
        expect(requestAdapterMock.execute).toHaveBeenCalledWith(
          subject.getUrl(API.UMS.USER),
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
          subject.getUrl(API.UMS.RESETPASSWORD),
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
          subject.getUrl(API.UMS.RESETPASSWORD + `/${token}`),
          {
            body: { new_password: newPassword },
            method: RequestMethod.POST,
          },
        );
      });
    });
  });

});
