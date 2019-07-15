import * as faker from "faker";
import * as Joi from "joi";
// @ts-ignore
import * as joiAssert from "joi-assert";
import { IUMSUser } from "../../../src/api/ums/umsModule";
import { LoggerModule, LogLevel } from "../../../src/node";
import { DatasetRecordSchema } from "../../lib/dataset";
import { UserSchema } from "../../lib/ums";
import { Management } from "../../management";
import { cleaning, dom, init, initWithUMS, terminate, ums } from "../../teardowns";

jest.setTimeout(15000);

const management = new Management();

describe("User Management Service", () => {

  const credentials = {
    email: faker.internet.email(),
    password: faker.internet.password(),
    alias: faker.name.firstName(),
  };
  let user: IUMSUser;

  describe("initialize without API key", () => {

    const wrongCredentialsError = new Error(
      "There was an error on the back-end as a result of your request: 400 Bad Request",
    );

    beforeAll(async () => await initWithUMS());

    afterAll(async () => await terminate());

    describe("when user sign-up", () => {
      it("should create a new user", async () => {
        user = await ums.signUp(credentials);
        joiAssert(user, UserSchema);
      });

      it("should create an active user", () => {
        expect(user.active).toBeTruthy();
      });

      it("should have the same email", () => {
        expect(user.email).toEqual(credentials.email);
      });
    });

    describe("when created user sign-in", () => {

      it("should get a token", async () => {
        const token = await ums.signIn({ ...credentials, default: true });
        expect(token).toBeDefined();
      });

      it("should get an error if credentials are incorrect", (done) => {
        ums.signIn({
          email: "wrong@email.com",
          password: "wrongPassword",
        })
          .then(() => {
            done("should not be able to sign in with wrong credentials");
          })
          .catch((error) => {
            expect(error).toEqual(wrongCredentialsError);
            done();
          });
      });
    });

    describe("signed user", () => {
      let dataset: { id: string };
      let policy: { id: string };

      beforeAll(async () => {
        await management.login();
        dataset = await management.createDataset("testUms");
        await management.createDatasetField(dataset.id, "name", { type: "string" });
        policy = await management.createPolicy([dataset], ["ums:<.*>"]);
      });

      afterAll(async () => {
        await management.deletePolicy(policy.id);
        await management.deleteDataset(dataset.id);
      });

      it("should have access to the dataset", async () => {
        const records = await dom.dataset("testUms")
          .insert([
            { name: "testRecord" },
          ])
          .execute();
        joiAssert(records, Joi.array()
          .items(DatasetRecordSchema.append({
            name: Joi.string().valid("testRecord").required()
          }))
          .length(1));
      });

      it("should fetch himself by alias", async () => {
        const fetchedUSer = await ums.getUser(credentials.alias);
        joiAssert(fetchedUSer, UserSchema.keys({
          email: Joi.string().equal(credentials.email),
        }));
      });

      // TODO Does not work until alias/email token key will be developed
      xit("should fetch himself by email", async () => {
        const fetchedUSer = await ums.getUser(credentials.email);
        joiAssert(fetchedUSer, UserSchema);
      });

      it("should be able to change own password", async () => {
        const newPassword = faker.internet.password();
        await ums.changePassword(credentials.alias, credentials.password, newPassword);
        credentials.password = newPassword;
        const token = await ums.signIn({ ...credentials, default: true });
        expect(token).toBeDefined();
      });

      it("should be able to delete himself", async (done) => {
        await ums.deleteUser(credentials.alias, credentials.password);
        try {
          await ums.signIn(credentials);
        } catch (error) {
          expect(error).toEqual(wrongCredentialsError);
          done();
          return;
        }
        done("should not be able to sign in after self deleting");
      });
    });

  });

  describe("initialize with API key", () => {

    beforeAll(async () => {
      await init("umsTestDataset", [{ name: "name", type: "string" }],
        [ums, dom, new LoggerModule(LogLevel.ERROR)]);
      await ums.signUp(credentials);
    });

    afterAll(async () => await cleaning());

    describe("UMS user", () => {

      const accessError = new Error("There was an error on the back-end as a result of your request: 403 Forbidden");

      it("should be able to sign-in", async () => {
        const token = await ums.signIn({ ...credentials, default: true });
        expect(token).toBeDefined();
      });

      it("should not have access to the dataset", (done) => {
        dom.dataset("umsTestDataset")
          .insert([{ name: "field" }])
          .execute()
          .then(() => done("should not have access to the dataset"))
          .catch((err) => {
            expect(err).toEqual(accessError);
            done();
          });
      });

      it("should be able to switch to the api key auth", async () => {
        ums.resetDefault();
        const records = await dom.dataset("umsTestDataset")
          .insert([
            { name: "testRecord" },
          ])
          .execute();
        joiAssert(records, Joi.array()
          .items(DatasetRecordSchema.append({
            name: Joi.string().valid("testRecord").required()
          }))
          .length(1));
      });

      it("should be able to use user authorization in dataset request", (done) => {
        dom.dataset("umsTestDataset", credentials.alias)
          .insert([{ name: "field" }])
          .execute()
          .then(() => done("should not have access to the dataset"))
          .catch((err) => {
            expect(err).toEqual(accessError);
            done();
          });
      });

      it("should be able to switch back to the user auth", (done) => {
        ums.setDefault(credentials.alias);
        dom.dataset("umsTestDataset")
          .insert([{ name: "field" }])
          .execute()
          .then(() => done("should not have access to the dataset"))
          .catch((err) => {
            expect(err).toEqual(accessError);
            done();
          });
      });

      it("should be able to use apikey auth in dataset request", async () => {
        const records = await dom.dataset("umsTestDataset", "apikey")
          .insert([
            { name: "testRecord" },
          ])
          .execute();
        joiAssert(records, Joi.array()
          .items(DatasetRecordSchema.append({
            name: Joi.string().valid("testRecord").required()
          }))
          .length(1));
      });
    });
  });

});
