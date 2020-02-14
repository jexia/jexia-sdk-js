import { ISetField } from "../../management";
import { cleaning, DEFAULT_DATASET, dom, init } from "../../teardowns";

jest.setTimeout(15000);

const fields: ISetField[] = [{
  name: "name",
  type: "string"
}, {
  name: "age",
  type: "integer",
}];

const data = [
  { name: "Boris", age: 18 },
  { name: "Anton", age: 42 },
  { name: "Olga", age: 24 },
  { name: "Slava", age: 33 },
];

describe("Dataset aggregation functions", () => {
  beforeAll(async () => {
    await init(DEFAULT_DATASET.NAME, fields);
    await dom.dataset(DEFAULT_DATASET.NAME).insert(data).execute();
  });

  afterAll(async () => cleaning());

  it("should select max value", (done) => {
    dom.dataset(DEFAULT_DATASET.NAME)
      .select()
      .fields({ fn: "max", col: "age"})
      .subscribe({
        next: (result) => {
          expect(result).toEqual([{ max: 42 }]);
          done();
        },
        error: done.fail,
      });
  });

  it("should select min value", (done) => {
    dom.dataset(DEFAULT_DATASET.NAME)
      .select()
      .fields({ fn: "min", col: "age"})
      .subscribe({
        next: (result) => {
          expect(result).toEqual([{ min: 18 }]);
          done();
        },
        error: done.fail,
      });
  });

  it("should select count", (done) => {
    dom.dataset(DEFAULT_DATASET.NAME)
      .select()
      .fields({ fn: "count", col: "*"})
      .subscribe({
        next: (result) => {
          expect(result).toEqual([{ count: 4 }]);
          done();
        },
        error: done.fail,
      });
  });

  it("should select average value", (done) => {
    dom.dataset(DEFAULT_DATASET.NAME)
      .select()
      .fields({ fn: "avg", col: "age"})
      .subscribe({
        next: (result) => {
          expect(result).toEqual([{ avg: 29.25 }]);
          done();
        },
        error: done.fail,
      });
  });

  it("should select sum value", (done) => {
    dom.dataset(DEFAULT_DATASET.NAME)
      .select()
      .fields({ fn: "sum", col: "age"})
      .subscribe({
        next: (result) => {
          expect(result).toEqual([{ sum: 117 }]);
          done();
        },
        error: done.fail,
      });
  });
});
