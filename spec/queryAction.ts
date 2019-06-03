import * as faker from "faker";
import { QueryAction } from "../src/api/core/queries/baseQuery";

export const getRandomQueryAction = (): QueryAction => faker.helpers.randomize(Object.values(QueryAction));
