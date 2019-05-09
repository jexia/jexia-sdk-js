import * as fs from 'fs';
import * as Joi from 'joi';
// @ts-ignore
import * as joiAssert from 'joi-assert';
import "reflect-metadata";
import { FilesetRecordSchema } from "../lib/fileset";
import { cleaning, initWithJFS, jfs } from "../teardowns";

jest.setTimeout(30000);

beforeAll(async () => await initWithJFS());

afterAll(async () => await cleaning());

describe('Fileset Module', () => {

  it('should be able to get fileset name', () => {
    expect(jfs.fileset('testFileset').name).toEqual('testFileset');
  });

  it('should upload a file', (done) => {
    jfs.fileset('testFileset').upload([{
      data: {},
      file: fs.createReadStream('e2e/resources/bee-32x32.png'),
    }]).subscribe((result) => {
      joiAssert(result, Joi.array().items(FilesetRecordSchema).length(1));
      done();
    });
  });
});
