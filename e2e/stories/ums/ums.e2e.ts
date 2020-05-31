import * as faker from "faker";
import * as Joi from "joi";
// @ts-ignore
import * as joiAssert from "joi-assert";
import { UsersInterface } from "../../../src/api/ums/umsModule";
import { LoggerModule, LogLevel } from "../../../src/node";
import { BackendErrorSchema } from "../../lib/common";
import { DatasetRecordSchema } from "../../lib/dataset";
import { UserSchema } from "../../lib/ums";
import { Management } from "../../management";
import { cleaning, dom, init, initWithUMS, terminate, ums } from "../../teardowns";

jest.setTimeout(15000);

const management = new Management();

// FIXME Tests do not work as expected since necessary activation was introduced
xdescribe("User Management Service", () => {

  const credentials = {
    email: faker.internet.email(),
    password: faker.internet.password(),
    alias: faker.name.firstName(),
  };
  let user: UsersInterface<{}>;

  describe("initialize without API key", () => {

    beforeAll(async () => await initWithUMS());

    afterAll(async () => await terminate());

    describe("when user sign-up", () => {
      it("should create a new user", (done) => {
        ums.signUp({ email: credentials.email, password: credentials.password }).subscribe((signedUser) => {
          user = signedUser;
          joiAssert(user, UserSchema);
          done();
        })
      });

      it("should create an inactive user", () => {
        expect(user.active).toBeFalsy();
      });

      it("should have the same email", () => {
        expect(user.email).toEqual(credentials.email);
      });

      describe("additional fields", () => {
        let creds;
        let createdUser: any;

        it("should create a user with extra fields", (done) => {
          creds = {
            email: faker.internet.email(),
            password: faker.internet.password(),
            bool: faker.random.boolean(),
            num: faker.random.number(),
            str: faker.random.alphaNumeric(),
          };

          ums.signUp(creds).subscribe((response) => {
            createdUser = response;
            joiAssert(createdUser, UserSchema.append({
              bool: Joi.boolean().required(),
              num: Joi.number().required(),
              str: Joi.string().required()
            }));
            done();
          });
        });

        it("should return the same values of extra fields", () => {
          const { bool, num, str } = createdUser;
          const { email, password, ...extra } = creds;

          expect({ bool, num, str }).toEqual(extra);
        });
      });
    });

    describe("when created user sign-in", () => {

      it("should get a token", (done) => {
        ums.signIn({ ...credentials, default: true }).subscribe((token) => {
          expect(token).toBeDefined();
          done();
        })
      });

      it("should get an error if credentials are incorrect", (done) => {
        ums.signIn({
          email: "wrong@email.com",
          password: "wrongPassword",
        }).subscribe(
          () => done("should not be able to sign in with wrong credentials"),
          (error) => {
            joiAssert(error, BackendErrorSchema);
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
        await management.createDatasetField(dataset.id, { name: "name", type: "string" });
        policy = await management.createPolicy([dataset], ["ums:<.*>"]);
      });

      afterAll(async () => {
        await management.deletePolicy(policy.id);
        await management.deleteDataset(dataset.id);
      });

      it("should have access to the dataset", (done) => {
        dom.dataset("testUms")
          .insert([
            { name: "testRecord" },
          ])
          .subscribe((records) => {
            joiAssert(records, Joi.array()
              .items(DatasetRecordSchema.append({
                name: Joi.string().valid("testRecord").required()
              }))
              .length(1));

            done();
          }, done.fail);
      });

      it("should fetch himself by alias", async () => {
        const fetchedUSer = await ums.getUser(credentials.alias);
        joiAssert(fetchedUSer, UserSchema.keys({
          email: Joi.string().equal(credentials.email),
        }));
      });

      it("should fetch himself by email", async () => {
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
          joiAssert(error, BackendErrorSchema);
          done();
          return;
        }
        done("should not be able to sign in after self deleting");
      });
    });

    describe("reset password", () => {
      let gateway: { id: string };
      let flow: { id: string };

      const resetCredentials = {
        email: "test@jexia.com", // avoid sending external e-mails
        password: faker.internet.password(),
      };

      beforeAll(async () => await ums.signUp(resetCredentials));
      afterAll(async () => {
        await management.deleteFlow(flow.id);
        await management.deleteGateway(gateway.id);
        await ums.deleteUser(resetCredentials.email, resetCredentials.password);
      });

      describe("when project has NO gateway nor flow setup", () => {
        it("should throw error", async (done) => {
          try {
            await ums.requestResetPassword(resetCredentials.email);
            done.fail("request password reset should not succeed without gateway/flow setup");
          } catch (err) {
            expect(err.httpStatus.code).toBe(500);
          } finally {
            done();
          }
        });
      });

      describe("when project has NO flow setup", () => {
        beforeAll(async () => {
          gateway = await management.createGateway(faker.random.word(), {
            smtp_server: faker.internet.ip(),
            username: resetCredentials.email,
            password: resetCredentials.password,
            smtp_port: faker.helpers.randomize([465, 587]),
          });
        });

        it("should throw error", async (done) => {
          try {
            await ums.requestResetPassword(resetCredentials.email);
            done.fail("request password reset should not succeed without flow setup");
          } catch (err) {
            expect(err.httpStatus.code).toBe(500);
          } finally {
            done();
          }
        });
      });

      describe("when project has both gateway and flow setup", () => {
        beforeAll(async () => {
          flow = await management.createFlow({
            name: faker.random.word(),
            gateway_id: gateway.id,
            subject: faker.lorem.sentence(),
            templates: [
              {
                type: "text/html",
                body: "Hello {{.email}}, use the following code in order to reset your password: {{.token}}",
              },
            ],
            event_type: "AfterPasswordResetRequest",
          });
        });

        it("should request for reset password successfully", async (done) => {
          try {
            await ums.requestResetPassword(resetCredentials.email);
            expect(true).toBeTruthy();
          } catch (err) {
            done.fail(err);
          } finally {
            done();
          }
        });
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

      it("should be able to sign-in", async () => {
        const token = await ums.signIn({ ...credentials, default: true });
        expect(token).toBeDefined();
      });

      it("should not have access to the dataset", (done) => {
        dom.dataset("umsTestDataset")
          .insert([{ name: "field" }])
          .subscribe({
            next: () => done.fail("should not have access to the dataset"),
            error: (err) => {
              joiAssert(err, BackendErrorSchema);
              done();
            }
          });
      });

      it("should be able to switch to the api key auth", (done) => {
        ums.resetDefault();
        dom.dataset("umsTestDataset")
          .insert([
            { name: "testRecord" },
          ])
          .subscribe((records) => {
            joiAssert(records, Joi.array()
              .items(DatasetRecordSchema.append({
                name: Joi.string().valid("testRecord").required()
              })).length(1));
            done();
          }, done.fail);
      });

      it("should be able to use user authorization in dataset request", (done) => {
        dom.dataset("umsTestDataset", credentials.alias)
          .insert([{ name: "field" }])
          .subscribe({
            next: () => done.fail("should not have access to the dataset"),
            error: (err) => {
              joiAssert(err, BackendErrorSchema);
              done();
            }
          });
      });

      it("should be able to switch back to the user auth", (done) => {
        ums.setDefault(credentials.alias);
        dom.dataset("umsTestDataset")
          .insert([{ name: "field" }])
          .subscribe({
            next: () => done.fail("should not have access to the dataset"),
            error: (err) => {
              joiAssert(err, BackendErrorSchema);
              done();
            }
          });
      });

      it("should be able to use apikey auth in dataset request", (done) => {
        dom.dataset("umsTestDataset", "apikey")
          .insert([
            { name: "testRecord" },
          ])
          .subscribe((records) => {
            joiAssert(records, Joi.array()
              .items(DatasetRecordSchema.append({
                name: Joi.string().valid("testRecord").required()
              }))
              .length(1));

            done();
          }, done.fail);
      });
    });
  });

});
