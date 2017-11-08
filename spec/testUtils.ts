import { TokenManager } from "../src/api/core/tokenManager";
import { RequestExecuter } from "../src/internal/executer";
import { QueryExecuterBuilder } from "../src/internal/queryExecuterBuilder";
import { IRequestAdapter, IRequestOptions } from "../src/internal/requestAdapter";

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

export function createRequestExecuterMock(projectID: string, datasetName: string): RequestExecuter {
  let reqAdapterMock = requestAdapterMockFactory().genericSuccesfulExecution();
  let tokenManagerMock = new TokenManager(reqAdapterMock);
  let qefMock = new QueryExecuterBuilder(projectID, reqAdapterMock, tokenManagerMock);
  return qefMock.createQueryExecuter(datasetName);
}
