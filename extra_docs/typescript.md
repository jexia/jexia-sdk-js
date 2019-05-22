# TypeScript Features

The JS SDK is written in TypeScript, even through it is transpiled to pure JavaScript, we also publish the Type Definitions, so TypeScript users can enjoy some extra features out of the box, without install or configure anything else.

## Typed Datasets

Datasets accepts your type/interface definition (otherwise defaults to `any`). See example below:

``` typescript
interface Post {
  title: string;
  published: boolean;
}

const posts: Dataset<Post> = dom.dataset<Post>("posts");
```

### Fields Validation

For each query method that receives field names, such as `.fields("title")` or `.sortAsc("title")`, typescript compiler will validate if they field exists at the given interface, or if it is a [default filed name](https://jexia.github.io/jexia-sdk-js/miscellaneous/typealiases.html#DefaultDatasetFields), resulting in a compilation error if any of the given field names were not found.

![typed result example](https://jexia.github.io/jexia-sdk-js/assets/typescript-fields-validation.gif)

### Typed Query Results

All the results of your queries will automatically use the given interface, without the need to manually type it.

![typed result example](https://jexia.github.io/jexia-sdk-js/assets/typescript-query-results-example.gif)
