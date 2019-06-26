import * as faker from "faker";
import { ResourceType } from "../src/api/core/resource";

export const getRandomResourceType = (): ResourceType => faker.helpers.randomize(Object.values(ResourceType));
