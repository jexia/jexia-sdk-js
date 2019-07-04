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
import { FieldType, Management } from "./management";

export const dom = dataOperations();

export const ums = new UMSModule();

export const jfs = fileOperations();

const management = new Management();
let client: Client;
let datasets: Array<{ name: string, id: string }> = [];
let fileset: { name: string, id: string };
let apiKey: { id: string, key: string, secret: string };
let policy: { id: string };
let relations: Array<{ id: string }> = [];

export const DEFAULT_DATASET = { NAME: "test_dataset", FIELD: "test_field" };
export const DEFAULT_FILESET = { NAME: "test_fileset", FIELD: "test_field" };

export const init = async (
  datasetName = DEFAULT_DATASET.NAME,
  fields: Array<{ name: string, type: FieldType }> = [],
  modules: IModule[] = [dom, realTime(), new LoggerModule(LogLevel.ERROR)]) => {

  await management.login();

  const dataset = await management.createDataset(datasetName);
  datasets.push(dataset);

  if (!fields.length) {
    await management.createDatasetField(dataset.id, DEFAULT_DATASET.FIELD, {
      type: "string",
      constraints: [
        { type: "required" },
      ]
    });
  } else {
    fields.forEach(async (field) => await management.createDatasetField(dataset.id, field.name, {
      type: field.type,
    }));
  }

  apiKey = await management.createApiKey();
  policy = await management.createPolicy(datasets, [`apk:${apiKey.key}`]);

  client = await jexiaClient().init({
    projectID: process.env.E2E_PROJECT_ID as string,
    key: apiKey.key,
    secret: apiKey.secret,
  }, ...modules); // Change to LogLevel.DEBUG to have more logs
};

export const cleaning = async () => {
  for (let relation of relations) {
    await management.deleteRelation(relation.id);
  }
  for (let dataset of datasets) {
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
  }, ums, dom, new LoggerModule(LogLevel.ERROR)); // Change to LogLevel.DEBUG to have more logs
};

export const initWithJFS = async (filesetName: string = "testFileset",
                                  fields?: Array<{name: string, type: FieldType}>) => {
  await management.login();
  fileset = await management.createFileset(filesetName);

  if (fields) {
    fields.forEach(async (field) => await management.createFilesetField(fileset.id, field.name, {
      type: field.type,
    }));
  }

  apiKey = await management.createApiKey();
  policy = await management.createPolicy([fileset], [`apk:${apiKey.key}`]);

  client = await jexiaClient().init({
    projectID: process.env.E2E_PROJECT_ID as string,
    key: apiKey.key,
    secret: apiKey.secret,
  }, jfs, realTime(), new LoggerModule(LogLevel.ERROR));
};

export const initForRelations = async () => {
  await management.login();

  let posts = await management.createDataset("posts");
  await management.createDatasetField(posts.id, "title", { type: "string" });
  await management.createDatasetField(posts.id, "text", { type: "string" });

  let comments = await management.createDataset("comments");
  await management.createDatasetField(comments.id, "message", { type: "string" });
  await management.createDatasetField(comments.id, "like", { type: "boolean" });

  let author = await management.createDataset("author");
  await management.createDatasetField(author.id, "email", { type: "string" });

  relations.push(
    await management.createRelation(posts, comments),
    await management.createRelation(comments, author, "ONE", "ONE")
  );

  datasets.push(posts, comments, author);

  apiKey = await management.createApiKey();
  policy = await management.createPolicy(datasets, [`apk:${apiKey.key}`]);

  client = await jexiaClient().init({
    projectID: process.env.E2E_PROJECT_ID as string,
    key: apiKey.key,
    secret: apiKey.secret,
  }, dom, new LoggerModule(LogLevel.DEBUG));
};

export const terminate = async () => {
  await client.terminate();
};
