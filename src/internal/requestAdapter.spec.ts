import * as faker from "faker";
import { IHTTPResponse, IRequestOptions, RequestAdapter } from "./requestAdapter";

describe("Class: RequestAdapter", () => {
  function createSubject({
    data = {},
    status = 200,
    statusText = "",
  } = {}) {
    const stringifiedData = typeof data !== "string" ? JSON.stringify(data as any) : data;
    const promise = Promise.resolve({
      ok: status === 200,
      status,
      statusText,
      text: () => Promise.resolve(stringifiedData),
    } as IHTTPResponse);

    const mockFetch = (uri: string, opts?: IRequestOptions): Promise<IHTTPResponse> => promise;

    return {
      subject: new RequestAdapter(mockFetch),
      data,
      status,
      statusText,
    };
  }

  describe("when creating the RequestAdapter", () => {
    it("should create a valid object", () => {
      const { subject } = createSubject();
      expect(subject).toBeDefined();
    });
  });

  describe("when executing a successful query", () => {
    it("should return the data", (done) => {
      expect.assertions(1);

      const { subject, data } = createSubject({
        data: [
          { id: faker.random.uuid() },
          { id: faker.random.uuid() },
          { id: faker.random.uuid() },
        ],
      });

      subject.execute(faker.random.uuid(), { headers: {} }).subscribe(
        (response) => expect(response).toEqual(data),
        done,
        done,
      );
    });

    it("should return empty object when response body is empty", (done) => {
      expect.assertions(1);

      const { subject } = createSubject({
        data: "",
      });

      subject.execute(faker.random.uuid(), { headers: {} }).subscribe(
        (response) => expect(response).toEqual({}),
        done,
        done,
      );
    });

    describe("when calling fetch fails", () => {
      it("should cause fetch error", (done) => {
        expect.assertions(1);

        const { subject, status, statusText } = createSubject({
          status: 401,
          statusText: faker.lorem.sentence(),
        });

        subject.execute(faker.random.uuid(), { headers: {} }).subscribe(
          () => done("do not cause fetch error"),
          ({ httpStatus }) => {
            expect(httpStatus).toEqual({code: status, status: statusText});
            done();
          },
        );
      });
    });
  });
});
