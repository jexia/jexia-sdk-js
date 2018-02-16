  // tslint:disable:no-string-literal
import { TokenManager } from "../src/api/core/tokenManager";
import { RequestExecuter } from "../src/internal/executer";
import { QueryExecuterBuilder } from "../src/internal/queryExecuterBuilder";
import { IRequestAdapter, IRequestOptions } from "../src/internal/requestAdapter";

export class RequestAdapterMockFactory {
  public genericSuccesfulExecution(): IRequestAdapter {
    return {
      execute(uri: string, opt: IRequestOptions): Promise<any> {
        return createGenericSuccesfulResponse();
      },
    };
  }

  public succesfulExecution(response: object): IRequestAdapter {
    return {
      execute(uri: string, opt: IRequestOptions): Promise<any> {
        return createResponseForSuccesfulRequest(response);
      },
    };
  }

  public failedExecution(errorMesage: string): IRequestAdapter {
    return {
      execute(uri: string, opt: IRequestOptions): Promise<any> {
        return createResponseForFailedRequest(errorMesage);
      },
    };
  }
}

export function requestAdapterMockFactory() {
  return new RequestAdapterMockFactory();
}

export function createResponseForSuccesfulRequest(fetchResponseMock: Object): Promise<any> {
  return new Promise<any>( (resolve, reject) => {
    resolve(fetchResponseMock);
  });
}

export function createResponseForFailedRequest(errorMessage: string): Promise<any> {
  return new Promise<any>( (resolve, reject) => {
    throw new Error(errorMessage);
  });
}

export function createGenericSuccesfulResponse(): Promise<any> {
  return new Promise<any>( (resolve, reject) => {
    resolve({ Status: "OK" });
  });
}

export function createRequestExecuterMock(projectID: string, datasetName: string): RequestExecuter {
  let reqAdapterMock = requestAdapterMockFactory().genericSuccesfulExecution();
  let tokenManagerMock = new TokenManager(reqAdapterMock);
  let qefMock = new QueryExecuterBuilder(projectID, reqAdapterMock, tokenManagerMock);
  return qefMock.createQueryExecuter(datasetName);
}

export interface ISpyOptions {
  returnValue?: any;
  callFake?: (...args: Function[]) => any;
  callThrough?: boolean;
}

interface IConstructor<T> {
  new(...args: any[]): T;
}

export function createMockFor<T>
    (obj: IConstructor<T>, spyOptions?: ISpyOptions, defaultProps?: object): jasmine.SpyObj<T> {
  const methodNames = Array.isArray(obj) ? obj : getMethodNamesOf(obj);
  if (!methodNames.length && spyOptions) {
    throw new Error("Given blueprint has no methods to spyOn");
  }
  const spyObj = methodNames.length ?
    jasmine.createSpyObj((obj as any)["name"] || methodNames[0], methodNames) : {};

  if (spyOptions) {
    methodNames.forEach((m) => { setSpyOptions(spyObj[m], spyOptions); });
  }
  if (defaultProps) {
    Object.entries(defaultProps)
      .forEach(([key, value]: any) => spyObj[key] = value);
  }
  return spyObj;
}

export function mockPrototypeOf(obj: any, spyOptions: ISpyOptions = {}, defaultProps: any = {}): void {
  getMethodNamesOf(obj)
    .forEach((m) => {
      const descriptor = Object.getOwnPropertyDescriptor(obj.prototype, m);
      if (descriptor && descriptor.get) {
        const getter = spyOnProperty(obj.prototype, m, "get");
        const defaultValue = defaultProps[m];
        if (defaultValue) {
          getter.and.returnValue(defaultValue);
        }
      }
      if (descriptor && descriptor.set) {
        spyOnProperty(obj.prototype, m, "set");
      }
      if (!descriptor || !descriptor.set && !descriptor.get) {
        setSpyOptions(spyOn(obj.prototype, m), spyOptions);
      }
    });
}

function getMethodNamesOf(obj: any) {
  return Object.getOwnPropertyNames(obj.prototype).filter((i) => i !== "constructor");
}

function setSpyOptions(spy: jasmine.Spy, opts: ISpyOptions = {}) {
  if (opts.returnValue !== undefined) {
    spy.and.returnValue(opts.returnValue);
  }
  if (opts.callFake !== undefined) {
    spy.and.callFake(opts.callFake);
  }
  if (opts.callThrough !== undefined) {
    spy.and.callThrough();
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
