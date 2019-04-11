import "reflect-metadata";
import { LogLevel } from "../../src/api/logger/logger";
import { LoggerModule } from "../../src/api/logger/loggerModule";
import { cleaning, init, jfs } from "../teardowns";

jest.setTimeout(15000);

describe('Fileset Module', () => {
  beforeAll(async () => {
    await init('umsTestDataset', 'name',
      [jfs, new LoggerModule(LogLevel.DEBUG)]);
  });

  it('should be able to get fileset name', () => {
    expect(jfs.fileset('filesetName').name).toEqual('filesetName');
  });

  afterAll(async () => await cleaning());
});
