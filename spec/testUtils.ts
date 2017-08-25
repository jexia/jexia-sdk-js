import { IRequestAdapter, IRequestOptions } from "../src/requestAdapter";

class RequestAdapterMockFactory {
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
