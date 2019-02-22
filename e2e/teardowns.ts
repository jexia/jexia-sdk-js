import { dataOperations, jexiaClient, LoggerModule, LogLevel, realTime } from "../src/node";
import { Management } from "./management";

export const dom = dataOperations();

const management = new Management();
let dataset: { name: string, id: string };
let apiKey: { id: string, key: string, secret: string };
let policy: { id: string };

export const init = async (datasetName = "test_dataset", fieldName = "test_field") => {
  await management.login();

  dataset = await management.createDataset(datasetName);

  await management.createDatasetField(dataset.id, fieldName, {
    type: "string",
    validators: {
      required: true
    }
  });

  apiKey = await management.createApiKey();
  policy = await management.createPolicy(dataset, apiKey);

  await jexiaClient().init({
    projectID: process.env.E2E_PROJECT_ID as string,
    key: apiKey.key,
    secret: apiKey.secret,
  }, dom, realTime(), new LoggerModule(LogLevel.ERROR)); // Change to LogLevel.DEBUG to have more logs
};

export const cleaning = async () => {
  await management.deleteDataset(dataset.id);
  await management.deleteApiKey(apiKey.key);
  await management.deletePolicy(policy.id);
};
