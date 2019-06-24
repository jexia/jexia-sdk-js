// tslint:disable:no-string-literal
import * as faker from "faker";
import { ResourceType } from "../src/api/core/resource";
import { FilesetInterface, FilesetMultipart, IFileStatus } from "../src/api/fileops/fileops.interfaces";
import { EventSubscriptionType, RealTimeEventMessage } from "../src/api/realtime/realTime.interfaces";
import { RequestExecuter } from "../src/internal/executer";
import { IHTTPResponse, IRequestOptions, RequestAdapter } from "../src/internal/requestAdapter";

export class RequestAdapterMockFactory {
  public genericSuccesfulExecution(): RequestAdapter {
    return createMockFor(RequestAdapter, { returnValue: createGenericSuccesfulResponse() });
  }

  public withResponse(response: Promise<any>): RequestAdapter {
    return createMockFor(RequestAdapter, { returnValue: response });
  }

  public succesfulExecution(response: object): RequestAdapter {
    return createMockFor(RequestAdapter, { returnValue: createResponseForSuccesfulRequest(response) });
  }

  public failedExecution(errorMessage: string): RequestAdapter {
    return createMockFor(RequestAdapter, { returnValue: createResponseForFailedRequest(errorMessage) });
  }
}

export function requestAdapterMockFactory() {
  return new RequestAdapterMockFactory();
}

export function createResponseForSuccesfulRequest(fetchResponseMock: Object): Promise<any> {
  return Promise.resolve(fetchResponseMock);
}

export function createResponseForFailedRequest(errorMessage: string): Promise<any> {
  return new Promise<any>( (resolve, reject) => {
    throw new Error(errorMessage);
  });
}

export function createGenericSuccesfulResponse(): Promise<any> {
  return Promise.resolve({ Status: "OK" });
}

export function createRequestExecuterMock(): RequestExecuter {
  return createMockFor(RequestExecuter, { returnValue: createGenericSuccesfulResponse() });
}

export interface ISpyOptions {
  returnValue?: any;
  callFake?: (...args: Function[]) => any;
  callThrough?: boolean;
}

interface IConstructor<T> {
  new(...args: any[]): T;
}

export type SpyObj<T> = T & {
  [k in keyof T]: jest.Mock<T>;
};

export function createMockFor<T, K extends keyof T = Extract<keyof T, string>>
    (obj: IConstructor<T> | K[] | any[], spyOptions?: ISpyOptions, defaultProps?: object): SpyObj<T> {
  const methodNames: K[] = Array.isArray(obj) ? obj : getMethodNamesOf(obj);
  if (!methodNames.length && spyOptions) {
    throw new Error("Given blueprint has no methods to spyOn");
  }
  const spyObj = {} as SpyObj<T>;

  methodNames.forEach((m) => {
    const spy = jest.fn();
    if (spyOptions) {
      setSpyOptions(spy, spyOptions);
    }
    (spyObj as any)[m] = jest.fn();
  });

  if (spyOptions) {
    methodNames.forEach((m) => { setSpyOptions(spyObj[m] as any, spyOptions); });
  }
  if (defaultProps) {
    Object.entries(defaultProps)
      .forEach(([key, value]) => (spyObj as any)[key] = value);
  }
  return spyObj;
}

export function mockPrototypeOf(obj: any, spyOptions: ISpyOptions = {}, defaultProps: any = {}): void {
  getMethodNamesOf(obj)
    .forEach((m) => {
      const descriptor = Object.getOwnPropertyDescriptor(obj.prototype, m);
      if (!descriptor || !descriptor.set && !descriptor.get) {
        setSpyOptions(spyOn(obj.prototype, m), spyOptions);
      }
    });
}

function getMethodNamesOf<T extends Function, K extends keyof T>(obj: T): K[] {
  return Object.getOwnPropertyNames(obj.prototype).filter((i) => i !== "constructor") as K[];
}

function setSpyOptions(spy: jest.Mock | jasmine.Spy, opts: ISpyOptions = {}) {
  if (spy.hasOwnProperty("and")) {
    if (opts.returnValue !== undefined) {
      (spy as jasmine.Spy).and.returnValue(opts.returnValue);
    }
    if (opts.callFake !== undefined) {
      (spy as jasmine.Spy).and.callFake(opts.callFake);
    }
    if (opts.callThrough !== undefined) {
      (spy as jasmine.Spy).and.callThrough();
    }
    return;
  }
  if (opts.returnValue !== undefined) {
    (spy as jest.Mock).mockReturnValue(opts.returnValue);
  }
  if (opts.callFake !== undefined) {
    (spy as jest.Mock).mockImplementation(opts.callFake);
  }
  if (opts.callThrough !== undefined) {
    (spy as jest.Mock).mockClear();
  }
}

export function deepFreeze<T>(obj: T): T {
  Object.getOwnPropertyNames(obj)
    .forEach((name) => {
      const prop = (obj as any)[name];
      if (typeof prop === "object" && prop !== null) {
        deepFreeze(prop);
      }
    });
  return Object.freeze(obj);
}

export function deepClone<T>(obj: T): T {
  if (Array.isArray(obj)) {
    return obj.map(deepClone) as any;
  }
  const clone: any = Object.assign({}, obj);
  Object.getOwnPropertyNames(clone)
    .forEach((name) => {
      const prop = clone[name];
      if (typeof prop === "object" && prop !== null) {
        clone[name] = deepClone(prop);
      }
    });
  return clone;
}

export const validClientOpts = {
  key: "validKey",
  projectID: "validProjectID",
  refreshInterval: 500,
  secret: "validSecret",
};

export const fetchWithRequestMockOk = (uri: string, opts?: IRequestOptions): Promise<IHTTPResponse> => {
  return Promise.resolve({
    json: () => Promise.resolve({
      access_token: "access_token",
      refresh_token: "refresh_token"
    }), ok: true, status: 200,
  } as IHTTPResponse);
};

export const mockFilesList = (n: number = 1): Array<FilesetMultipart<any, any>> => {
  return new Array(n).fill({});
};

export const mockFileRecord = (status: IFileStatus): FilesetInterface<{}> => ({
  id: faker.random.uuid(),
  created_at: new Date().toDateString(),
  updated_at: new Date().toDateString(),
  name: "",
  size: "",
  status,
});

export const mockFileEvent = (id: string, action: EventSubscriptionType): RealTimeEventMessage => ({
  action,
  resource: { type: ResourceType.Fileset, name: "" },
  modifier: { type: "", id: "" },
  timestamp: new Date().toDateString(),
  data: [ { id }],
});

export * from "./queryAction";
export * from "./queryActionType";
export * from "./filtering";
