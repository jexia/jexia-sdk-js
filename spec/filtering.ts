import * as faker from "faker";
import { field, FieldFilter } from "../src/api/core/filteringApi";

export function getRandomFilteringCriteria() {
  return faker.helpers.randomize([
    field("id").isEqualTo("1"),
    (col: (field: any) => FieldFilter<any>) => col("someField").isDifferentFrom("someValue"),
  ]);
}
