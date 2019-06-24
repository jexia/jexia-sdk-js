import * as faker from "faker";
import { QueryActionType } from "./../src/internal/utils/queryActionType";

export function getRandonQueryActionType(): QueryActionType {
  return faker.helpers.randomize(Object.values(QueryActionType));
}
