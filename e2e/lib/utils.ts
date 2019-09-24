import * as faker from "faker";
import { MESSAGE } from "../../src/config/message";

export const BAD_REQUEST_ERROR = new Error(`${MESSAGE.CORE.BACKEND_ERROR}400 Bad Request`);

export function getRandomList<T>({
  // @ts-ignore
  min = 0,
  // @ts-ignore
  max = 5,
  length = faker.random.number({ min, max }),
  callback = () => ({} as T),
} = {}): T[] {
  return Array.from({length}, callback);
}
