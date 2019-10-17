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

  describe("when executing a succesful query", () => {
    it("should return the data", async () => {
      expect.assertions(1);

      const { subject, data } = createSubject({
        data: [
          { id: faker.random.uuid() },
          { id: faker.random.uuid() },
          { id: faker.random.uuid() },
        ],
      });

      try {
        const responseData = await subject.execute(faker.random.uuid(), { headers: {} });

        expect(responseData).toEqual(data);
      } catch (err) {
        expect(err).not.toBeDefined();
      }
    });

    it("should return empty object when response body is empty", async () => {
      expect.assertions(1);

      const { subject } = createSubject({
        data: "",
      });

      try {
        const responseData = await subject.execute(faker.random.uuid(), { headers: {} });

        expect(responseData).toEqual({});
      } catch (err) {
        expect(err).not.toBeDefined();
      }
    });

    describe("when calling fetch fails", () => {
      it("should cause fetch error", async () => {
        expect.assertions(1);

        const { subject, status, statusText } = createSubject({
          status: 401,
          statusText: faker.lorem.sentence(),
        });

        try {
          await subject.execute(faker.random.uuid(), { headers: {} });

          expect(false).toBeTruthy();
        } catch (err) {
          expect(err.httpStatus).toEqual({ code: status, status: statusText });
        }
      });
    });
  });
});
