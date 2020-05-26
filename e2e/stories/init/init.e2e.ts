import * as faker from "faker";
import { IAuthOptions, jexiaClient } from "../../../src/node";

describe("initialize client", () => {
  it("should throw an error if project id is not provided", (done) => {
    const options = {
      key: faker.random.uuid(),
      secret: faker.random.word(),
    } as IAuthOptions;

    jexiaClient().init(options)
      .then(() => done.fail("successfully initialized"))
      .catch(error => {
        expect(error.message).toEqual("Please supply a valid Jexia project ID.");
        done();
      });
  });

  it("should throw an error if project is not found", (done) => {
    const options = {
      projectID: faker.random.uuid(),
      key: faker.random.uuid(),
      secret: faker.random.word(),
    }

    jexiaClient().init(options)
      .then(() => done.fail("successfully initialized"))
      .catch(error => {
        expect(error.message).toEqual(`Authorization failed: project ${options.projectID} not found.`);
        done();
      });
  });

  it("should throw an error if credentials are incorrect", (done) => {
    const options = {
      projectID: process.env.E2E_PROJECT_ID as string,
      key: faker.random.uuid(),
      secret: faker.random.word(),
    }

    jexiaClient().init(options)
      .then(() => done.fail("successfully initialized"))
      .catch(error => {
        expect(error.message).toEqual(`Authorization failed: incorrect key/secret`);
        done();
      });
  });
});
