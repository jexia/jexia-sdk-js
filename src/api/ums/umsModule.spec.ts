// tslint:disable:no-string-literal
import * as faker from 'faker';
import { ReflectiveInjector } from 'injection-js';
import { createMockFor, SpyObj } from '../../../spec/testUtils';
import { API } from '../../config';
import { RequestAdapter } from '../../internal/requestAdapter';
import { deferPromise } from '../../internal/utils';
import { Client } from '../core/client';
import { AuthOptions, TokenManager } from '../core/tokenManager';
import { UMSModule } from './umsModule';

describe('UMS Module', () => {
  const projectID = 'projectIDTest';
  const tokenTest = 'tokenTest';
  const testUser = {
    email: faker.internet.email(),
    password: faker.internet.password(),
    default: false,
    auth: 'testAuth',
  };
  const testCredentials = {
    email: faker.internet.email(),
    password: faker.internet.password(),
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
    injectorMock = createMockFor(['get']) as SpyObj<ReflectiveInjector>,
  } = {}) {
    (tokenManagerMock as any)['token'] = () => tokenPromise;
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

  describe('on user sign-up', () => {
    it('should call correct API with correct data', async () => {
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
          method: 'POST'
        }
      );
    });
  });

  describe('user sign-in', () => {

    it('should call correct API with correct data', async () => {
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
          method: 'POST'
        }
      );
    });

  });

  describe('token management', () => {
    it('should set default token by alias', () => {
      const { subject, init, tokenManagerMock } = createSubject();
      const alias = faker.internet.email();
      init();
      subject.setDefault(alias);
      expect(tokenManagerMock.setDefault).toHaveBeenCalledWith(alias);
    });

    it('should reset to default token', () => {
      const { subject, init, tokenManagerMock } = createSubject();
      init();
      subject.resetDefault();
      expect(tokenManagerMock.resetDefault).toHaveBeenCalled();
    });
  });

});
