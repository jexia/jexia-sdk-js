import * as Promise from "bluebird";
import fetch from "node-fetch";
import {Response} from "node-fetch";

export function createFetchMockForSuccesfulAuthRequest(): Function {
  return createFetchMockForSuccesfulRequest({ refreshToken: "refresh_token", token: "token" });
}

export function createFetchMockForSuccesfulRequest(fetchResponseMock: Object): Function {
  let returnVal = new Promise<Response>( (resolve, reject) => {
    resolve(new Response(JSON.stringify(fetchResponseMock), {status: 200, statusText: "OK"}));
  });
  return createFetchMock(returnVal);
}

export function createFetchMockForFailedAuthRequest(): Function {
  return createFetchMockForFailedRequest("ERROR: invalid user or password (SQLSTATE 28P01)");
}

export function createFetchMockForFailedRequest(errorMessage: string): Function {
  let returnVal = new Promise<Response>( (resolve, reject) => {
    resolve(new Response(JSON.stringify({ errors: [errorMessage]}), {status: 400, statusText: "ERROR"}));
  });
  return createFetchMock(returnVal);
}

export function createGenericSuccesfulRequestMock(): Function {
  let returnVal = new Promise<Response>( (resolve, reject) => {
    resolve(new Response(JSON.stringify({ Status: "OK" }), {status: 200, statusText: "OK"}));
  });
  return createFetchMock(returnVal);
}

export function createFetchMock(response: Promise<Response>): Function {
  return jasmine.createSpy("fetch", fetch).and.returnValue(response);
}
