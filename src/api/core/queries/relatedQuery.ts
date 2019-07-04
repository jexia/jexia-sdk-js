import { Query } from "../../../internal/query";

/**
 * RelatedQuery class provides nested resources fields population
 * returned by SelectQuery related() method
 * @internal
 */
export class RelatedQuery<R> {
  constructor(
    private resourceName: string,
    private query: Query) {}

  /**
   * Select the fields to be returned and represent related resource data
   *
   * @param fields fields names or aggregation object
   */
  public fields(fields: R[]): this;
  public fields(...fields: R[]): this;
  public fields<K extends R>(field: K, ...fields: K[]): this {
    const relatedFields = this.nestedFields(Array.isArray(field) ? field : [field, ...fields]);
    this.query.fields.push(...relatedFields);
    return this;
  }

  /**
   * Allow to populate nested related resource fields
   * @param {string} resourceName Related resource
   * @param {function} callback Pass RelatedQuery object to the callback
   * @example
   *   dataset("posts")
   *     .select()
   *     .related("comments",
   *        comments => comments
   *          .related("author", author => author.fields("email"))
   *          .fields("date", "text"))
   *   execute();
   *
   */
  public related(
    resourceName: string,
    callback: (q: RelatedQuery<any>) => RelatedQuery<any> = (related) => {
      this.query.fields.push([this.resourceName, resourceName].join("."));
      return related;
    }): this {
    // @ts-ignore
    callback(new RelatedQuery([this.resourceName, resourceName].join("."), this.query));
    return this;
  }

  /**
   * Apply dot notation to each nested field
   * @ignore
   */
  private nestedFields(fields: R[]): string[] {
    return fields.map((field) => [this.resourceName, field].join("."));
  }
}
