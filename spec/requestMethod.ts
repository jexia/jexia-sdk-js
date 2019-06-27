import * as faker from "faker";
import { RequestMethod } from "../src/internal/requestAdapter.interfaces";

export const getRandomRequestMethod = (): RequestMethod => faker.helpers.randomize(Object.values(RequestMethod));
