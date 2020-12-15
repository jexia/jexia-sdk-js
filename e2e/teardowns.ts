import { IModule } from "../src/api/core/module";
import {
  Client,
  dataOperations,
  fileOperations,
  jexiaClient,
  LoggerModule,
  LogLevel,
  realTime,
  UMSModule,
} from "../src/node";
import { FieldType, ISetField, Management } from "./management";

export const dom = dataOperations();

export const ums = new UMSModule();

export const jfs = fileOperations();

export const rtm = realTime();

export const management = new Management();
type TypeResource = { id: string };
let client: Client;
const datasets: Array<{ name: string, id: string }> = [];
let fileset: { name: string, id: string };
let apiKey: { id: string, key: string, secret: string };
let policy: TypeResource;
const relations: TypeResource[] = [];
let channel: { id: string; name: string };

export const DEFAULT_DATASET = { NAME: "test_dataset", FIELD: "test_field" };
export const DEFAULT_FILESET = { NAME: "test_fileset", FIELD: "test_field" };
export const ErrorLoggerModule = new LoggerModule(LogLevel.ERROR);

const initClient = async (resources: TypeResource[], modules: IModule[]) => {
  apiKey = await management.createApiKey();
  policy = await management.createPolicy(resources, [`apk:${apiKey.key}`]);

  client = await jexiaClient().init({
    projectID: process.env.E2E_PROJECT_ID as string,
    zone: process.env.E2E_PROJECT_ZONE as string,
    projectURL: process.env.E2E_PROJECT_URL as string,
    key: apiKey.key,
    secret: apiKey.secret,
  }, ...modules);
};

export const init = async (
  datasetName = DEFAULT_DATASET.NAME,
  fields: ISetField[] = [],
  loadRtc = false) => {
  const modules: IModule[] = [
    dom,
    ...(loadRtc ? [rtm] : []),
    ErrorLoggerModule,
  ];

  await management.login();

  const dataset = await management.createDataset(datasetName);
  datasets.push(dataset);

  if (!fields.length) {
    await management.createDatasetField(dataset.id, {
      name: DEFAULT_DATASET.FIELD,
      type: "string",
      constraints: [
        { type: "required" },
      ],
    });
  } else {
    for (const field of fields) {
      await management.createDatasetField(dataset.id, field);
    }
  }

  const umsSchemaId = await management.getUMSSchemaId();

  await initClient([...datasets, { id: umsSchemaId }], modules);
};

export const cleaning = async () => {
  for (const relation of relations) {
    await management.deleteRelation(relation.id);
  }
  for (const dataset of datasets) {
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
  if (channel) {
    await management.deleteChannel(channel.id);
  }
};

export const initWithChannel = async (channelName: string, history = false) => {
  await management.login();
  channel = await management.createChannel(channelName, history);

  await initClient([channel], [rtm, ErrorLoggerModule]);
};

export const initWithUMS = async () => {
  client = await jexiaClient().init({
    projectID: process.env.E2E_PROJECT_ID as string,
    zone: process.env.E2E_PROJECT_ZONE as string,
  }, ums, dom, ErrorLoggerModule); // Change to LogLevel.DEBUG to have more logs
};

export const initWithJFS = async (filesetName: string = "testFileset",
                                  fields?: Array<{name: string, type: FieldType}>) => {
  await management.login();
  fileset = await management.createFileset(filesetName);

  if (fields) {
    for (const field of fields) {
      await management.createFilesetField(fileset.id, field);
    }
  }

  await initClient([fileset], [jfs, realTime()]);
};

export const initForRelations = async () => {
  await management.login();

  const posts = await management.createDataset("posts");
  await management.createDatasetField(posts.id, { name: "title", type: "string" });
  await management.createDatasetField(posts.id, { name: "text", type: "string" });

  const comments = await management.createDataset("comments");
  await management.createDatasetField(comments.id, { name: "message", type: "string" });
  await management.createDatasetField(comments.id, { name: "like", type: "boolean" });

  const author = await management.createDataset("author");
  await management.createDatasetField(author.id, { name: "email", type: "string" });

  relations.push(
    await management.createRelation(posts, comments),
    await management.createRelation(comments, author, "ONE", "ONE"),
  );

  datasets.push(posts, comments, author);

  apiKey = await management.createApiKey();
  policy = await management.createPolicy(datasets, [`apk:${apiKey.key}`]);

  await initClient(datasets, [dom, ErrorLoggerModule]);
};

export const terminate = async () => {
  await client.terminate();
};
