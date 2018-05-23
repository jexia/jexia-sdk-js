# TypeScript Features

The JS SDK is written in TypeScript, even through it is transpiled to pure JavaScript, we also publish the Type Definitions, so TypeScript users can enjoy some extra features out of the box, without install or configure anything else.

## Typed Datasets

Datasets have a generic type, which is default to any, but can accept your on type interface with information of your own, as the example bellow:

``` typescript
interface Post {
  title: string;
  published: boolean;
}

const posts = dom.dataset<Post>("posts");
```

Following the last example, your dataset gonna have the type `Dataset<Post>`, and this information will be used in different moments to give you extra validations and better intelecense, depending on your IDE.

### Fields Validation

For each query method that receives field names, such as `.fields("title")` or `.sortAsc("title")`, typescript compiler will validate if they field exists at the given interface, or if it is a [default filed name](/miscellaneous/typealiases.html#DefaultDatasetFields), resulting in a compilation error if any of the given field names were not found.

![typed result example](/assets/typescript-fields-validation.gif)

### Typed Query Results

All the results of your queries will automatically use the given interface, without the need to manually type it.

![typed result example](/assets/typescript-query-results-example.gif)
