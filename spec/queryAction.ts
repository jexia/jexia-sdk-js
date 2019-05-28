import * as faker from "faker";
import { QueryAction } from "../src/api/dataops/queries/baseQuery";

export const getRandomQueryAction = (): QueryAction => faker.helpers.randomize(Object.values(QueryAction));
