import * as faker from 'faker';
import * as fs from 'fs';
import * as Joi from 'joi';
// @ts-ignore
import * as joiAssert from 'joi-assert';
import "reflect-metadata";
import { FilesetRecordSchema } from "../lib/fileset";
import { cleaning, initWithJFS, jfs } from "../teardowns";

jest.setTimeout(30000);

const filesetName = 'testFileset';

beforeAll(async () => await initWithJFS(filesetName, [{
  name: 'testField1',
  type: 'string',
}, {
  name: 'testField2',
  type: 'integer',
}]));

afterAll(async () => await cleaning());

describe('Fileset Module', () => {

  it('should be able to get fileset name', () => {
    expect(jfs.fileset(filesetName).name).toEqual(filesetName);
  });

  it('should upload a file', (done) => {
    jfs.fileset(filesetName).upload([{
      // data: {},
      file: fs.createReadStream('e2e/resources/bee-32x32.png'),
    }]).subscribe((result) => {
      joiAssert(result, Joi.array().items(FilesetRecordSchema).length(1));
      done();
    });
  });

  it('should upload a file with custom fields', (done) => {
    jfs.fileset(filesetName).upload([{
      data: {
        testField1: faker.lorem.sentence(5),
        testField2: faker.random.boolean().toString(),
      },
      file: fs.createReadStream('e2e/resources/bee-32x32.png'),
    }]).subscribe((result) => {
      joiAssert(result, Joi.array().items(FilesetRecordSchema).length(1));
      done();
    });
  });
});
