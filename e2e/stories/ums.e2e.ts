import * as faker from 'faker';
// @ts-ignore
import * as joiAssert from 'joi-assert';
import { IUMSUser } from "../../src/api/ums/umsModule";
import { UserSchema } from "../lib/ums";
import { initWithUMS, ums } from '../teardowns';

describe('User Management Service', () => {

  const credentials = {
    email: faker.internet.email(),
    password: faker.internet.password(),
  };
  let user: IUMSUser;

  beforeAll(async () => initWithUMS());

  describe('when user sign-up', () => {
    it('should create a new user', async () => {
      user = await ums.signUp(credentials);
      joiAssert(user, UserSchema);
    });

    it('should create an active user', () => {
      expect(user.active).toBeTruthy();
    });

    it('should have the same email', () => {
      expect(user.email).toEqual(credentials.email);
    });
  });

});
