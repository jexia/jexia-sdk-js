export type QueryParam = { key: string; value: any; };

const encodeValue = (v: any) => encodeURIComponent(
  typeof v === "string" ? v : JSON.stringify(v),
);
const toQueryParam = ({ key, value }: QueryParam) => `${key}=${encodeValue(value)}`;

/**
 * Maps an object into a list of QueryParam
 * @param   o The object to be mapped
 * @returns QueryParam A list of query params
 */
export function toQueryParams(o: object): QueryParam[] {
  return Object.entries(o).map(([key, value]) => ({ key, value }));
}

/**
 * Parses query params elements into query string format
 *
 * @param  queryParams
 * @returns string
 */
export function parseQueryParams(queryParams: QueryParam[] = []): string {
  if (queryParams && !queryParams.length) {
    return "";
  }

  return "?" + queryParams
    .map(toQueryParam)
    .join("&");
}
