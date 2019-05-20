import * as faker from 'faker';
import { QueryAction } from '../src/api/dataops/queries/baseQuery';

export const getRandomQueryAction = () => faker.helpers.randomize([
  QueryAction.delete,
  QueryAction.insert,
  QueryAction.select,
  QueryAction.update,
]);
