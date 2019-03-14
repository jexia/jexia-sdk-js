// tslint:disable:no-string-literal
import { ReflectiveInjector } from "injection-js";
import { createMockFor, SpyObj } from "../../../spec/testUtils";
import { API } from "../../config";
import { RequestAdapter } from "../../internal/requestAdapter";
import { deferPromise } from "../../internal/utils";
import { Client, ClientInit } from "../core/client";
import { AuthOptions, TokenManager } from "../core/tokenManager";
import { UMSModule } from "./umsModule";

describe('UMS Module', () => {
  const projectID = "projectIDTest";
  const tokenTest = "tokenTest";
  const testUser = {
    email: 'test@email.com',
    password: 'testPassword',
    default: false,
    auth: 'testAuth',
  };
  const signedInResult = {
    id: 'testUserId',
  };

  function createSubject({
    tokenPromise = Promise.resolve(tokenTest),
    tokenManagerMock = createMockFor(TokenManager),
    requestAdapterMock = createMockFor(RequestAdapter, {
      returnValue: Promise.resolve(signedInResult)
    }),
    // @ts-ignore
    systemDefer = deferPromise<Client>(),
    systemInitMock = systemDefer.promise,
    injectorMock = createMockFor(["get"]) as SpyObj<ReflectiveInjector>,
  } = {}) {
    (tokenManagerMock as any)["token"] = tokenPromise;
    const injectorMap = new Map<any, any>([
      [TokenManager, tokenManagerMock],
      [RequestAdapter, requestAdapterMock],
      [ClientInit, systemInitMock],
      [AuthOptions, { projectID }],
    ]);
    injectorMock.get.mockImplementation((key: any) => injectorMap.get(key));
    const subject = new UMSModule();

    return {
      subject,
      tokenManagerMock,
      requestAdapterMock,
      systemDefer,
      systemInitMock,
      injectorMock,
      init() {
        return subject.init(injectorMock);
      }
    };
  }

  describe('on initialize', () => {

    it('should get tokenManager from the injector', async () => {
      const { subject, tokenManagerMock, init } = createSubject();
      await init();
      expect((subject as any).tokenManager).toEqual(tokenManagerMock);
    });

    it('should get requestAdapter from the injector', async () => {
      const { subject, requestAdapterMock, init } = createSubject();
      await init();
      expect((subject as any).requestAdapter).toEqual(requestAdapterMock);
    });

    it('should get systemInit from the injector', async () => {
      const { subject, systemInitMock, init } = createSubject();
      await init();
      expect((subject as any).systemInit).toEqual(systemInitMock);
    });

    it('should get project id from the injector', async () => {
      const { subject, init } = createSubject();
      await init();
      expect((subject as any).projectId).toEqual(projectID);
    });

  });

  describe('on terminate', () => {

    it('should return resolved promise of itself', async () => {
      const { subject } = createSubject();
      const result = await subject.terminate();
      expect(result).toEqual(subject);
    });

  });

  describe('user sign-in', () => {

    it('should call correct API with correct data', async () => {
      const { subject, systemDefer, systemInitMock, requestAdapterMock, init } = createSubject();
      systemDefer.resolve();
      await systemInitMock.promise;
      await init();
      await subject.signIn(testUser);
      expect(requestAdapterMock.execute).toBeCalledWith(
        `${API.PROTOCOL}://${projectID}.${API.HOST}.${API.DOMAIN}:${API.PORT}/${API.AUTH.UMS}`,
        {
          body: {
            email: testUser.email,
            password: testUser.password
          },
          headers: {
            Authorization: `Bearer ${tokenTest}`
          },
          method: 'POST'
        }
      );
    });

  });

});
