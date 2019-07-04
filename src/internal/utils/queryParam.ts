export type QueryParam = { key: string; value: any; };

/**
 * Maps an object into a list of QueryParam
 * @param   o The object to be mapped
 * @returns QueryParam A list of query params
 */
export function toQueryParams(o: object): QueryParam[] {
  return Object.entries(o).map(([key, value]) => ({ key, value }));
}
