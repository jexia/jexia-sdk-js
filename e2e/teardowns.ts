import { IModule } from "../src/api/core/module";
import { Client, dataOperations, jexiaClient, LoggerModule, LogLevel, realTime, UMSModule } from "../src/node";
import { Management } from "./management";

export const dom = dataOperations();

export const ums = new UMSModule();

const management = new Management();
let client: Client;
let dataset: { name: string, id: string };
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
  await management.deleteDataset(dataset.id);
  await management.deleteApiKey(apiKey.key);
  await management.deletePolicy(policy.id);
  await client.terminate();
};

export const initWithUMS = async () => {
  client = await jexiaClient().init({
    projectID: process.env.E2E_PROJECT_ID as string,
  }, ums, dom, new LoggerModule(LogLevel.DEBUG)); // Change to LogLevel.DEBUG to have more logs
};

export const terminate = async () => {
  await client.terminate();
};
