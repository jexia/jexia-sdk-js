import { IModule } from "../src/api/core/module";
import {
  Client,
  dataOperations,
  fileOperations,
  jexiaClient,
  LoggerModule,
  LogLevel,
  realTime,
  UMSModule
} from "../src/node";
import { Management } from "./management";

export const dom = dataOperations();

export const ums = new UMSModule();

export const jfs = fileOperations();

const management = new Management();
let client: Client;
let dataset: { name: string, id: string };
let fileset: { name: string, id: string };
let apiKey: { id: string, key: string, secret: string };
let policy: { id: string };

export const init = async (
  datasetName = "test_dataset",
  fieldName = "test_field",
  modules: IModule[] = [dom, realTime(), new LoggerModule(LogLevel.ERROR)]) => {

  await management.login();

  dataset = await management.createDataset(datasetName);

  await management.createDatasetField(dataset.id, fieldName, {
    type: "string",
    validators: {
      required: true
    }
  });

  apiKey = await management.createApiKey();
  policy = await management.createPolicy(dataset, [`apk:${apiKey.key}`]);

  client = await jexiaClient().init({
    projectID: process.env.E2E_PROJECT_ID as string,
    key: apiKey.key,
    secret: apiKey.secret,
  }, ...modules); // Change to LogLevel.DEBUG to have more logs
};

export const cleaning = async () => {
  if (dataset) {
    await management.deleteDataset(dataset.id);
  }
  if (fileset) {
    await management.deleteFileset(fileset.id);
  }
  if (apiKey) {
    await management.deleteApiKey(apiKey.key);
  }
  if (policy) {
    await management.deletePolicy(policy.id);
  }
  if (client) {
    await client.terminate();
  }
};

export const initWithUMS = async () => {
  client = await jexiaClient().init({
    projectID: process.env.E2E_PROJECT_ID as string,
  }, ums, dom, new LoggerModule(LogLevel.DEBUG)); // Change to LogLevel.DEBUG to have more logs
};

export const initWithJFS = async (filesetName: string = 'testFileset') => {
  await management.login();
  fileset = await management.createFileset(filesetName);
  apiKey = await management.createApiKey();
  policy = await management.createPolicy(fileset, [`apk:${apiKey.key}`]);

  client = await jexiaClient().init({
    projectID: process.env.E2E_PROJECT_ID as string,
    key: apiKey.key,
    secret: apiKey.secret,
  }, jfs, new LoggerModule(LogLevel.DEBUG));
};

export const terminate = async () => {
  await client.terminate();
};
