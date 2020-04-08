import * as faker from "faker";
import { field } from "../src/api/core/filteringApi";

export function getRandomFilteringCriteria() {
  return faker.helpers.randomize([
    field("id").isEqualTo("1"),
    (col: any) => col("someField").isDifferentFrom("someValue"),
  ]);
}
