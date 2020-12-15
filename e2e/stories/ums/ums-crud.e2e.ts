import * as faker from "faker";
import * as Joi from "joi";
// @ts-ignore
import * as joiAssert from "joi-assert";
import { switchMap } from "rxjs/operators";
import { IUMSCredentials } from "../../../src/api/ums/ums.types";
import { LoggerModule, LogLevel } from "../../../src/node";
import { BackendErrorSchema } from "../../lib/common";
import { UserSchema } from "../../lib/ums";
import { cleaning, DEFAULT_DATASET, init, ums } from "../../teardowns";

jest.setTimeout(15000);

const testUsers: IUMSCredentials[] = [];

const createUser = () => {
  const user = {
    email: faker.internet.email(),
    password: faker.random.alphaNumeric(),
  };
  testUsers.push(user);
  return user;
};

describe("User Management Service CRUD Operations", () => {
  beforeAll(async () => {
    await init(DEFAULT_DATASET.NAME, [],
      [ums, new LoggerModule(LogLevel.ERROR)]);

    // create couple of user
    await ums.signUp(createUser());
    await ums.signUp(createUser());
  });

  afterAll(async () => await cleaning());

  it("should select users", (done) => {
    ums.select().subscribe((users) => {
      joiAssert(users, Joi.array().items(UserSchema.append({ field: Joi.string() })));
      done();
    }, done);
  });

  it("should select users with condition", (done) => {
    const user = faker.helpers.randomize(testUsers);
    ums.select().where((field) => field("email").isEqualTo(user.email))
      .subscribe(([selectedUser]) => {
        expect(selectedUser.email).toEqual(user.email);
        done();
      });
  });

  it("should select only specific fields", (done) => {
    const { email } = faker.helpers.randomize(testUsers);
    ums.select()
      .where((field) => field("email").isEqualTo(email))
      .fields("id")
      .subscribe(([selectedUser]) => {
        joiAssert(selectedUser, UserSchema.forbiddenKeys("email", "active", "created_at", "updated_at"));
        done();
      }, done);
  });

  it("should update users", (done) => {
    ums.update({ active: true }).where((field) => field("email").isNotNull())
      .pipe(
      switchMap(() => ums.select()),
    ).subscribe((users) => {
      expect(users.every(({ active }) => active)).toBeTruthy();
      done();
    }, done);
  });

  it("should not update users without condition", (done) => {
    ums.update({ active: true })
      .subscribe({
        next: () => done("error has not been thrown"),
        error: (error) => {
          joiAssert(error, BackendErrorSchema.append({
            message: Joi.string().valid("action \"update\" needs at least one condition"),
          }));
          done();
        },
      });
  });

  it("should update one user", (done) => {
    const { email } = faker.helpers.randomize(testUsers);
    const condition = (field: any) => field("email").isEqualTo(email);
    ums.update({ active: false })
      .where(condition)
      .pipe(
        switchMap(() => ums.select().where(condition)),
      )
      .subscribe(([updatedUser]) => {
        expect(updatedUser.active).toBeFalsy();
        done();
      }, done);
  });

  it("should delete all users", (done) => {
    ums.delete().where((field) => field("email").isNotNull())
      .pipe(
        switchMap(() => ums.select()),
      )
      .subscribe((allUsers) => {
        expect(allUsers).toEqual([]);
        done();
      }, done);
  });
});
