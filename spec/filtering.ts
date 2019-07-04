import * as faker from "faker";
import { field } from "../src/api/dataops/filteringApi";

export function getRandomFilteringCriteria() {
  return faker.helpers.randomize([
    field("id").isEqualTo("1"),
    (field: any) => field("someField").isDifferentFrom("someValue"),
  ]);
}
