import Client from "../src/client";
import fetch from "node-fetch";
(new Client(fetch))
  .init({appUrl: "http://127.0.0.1:8080", key: "anna@example.com", secret: "annie123", refreshInterval: 3000})
  .then((cli: Client) => {
    let ds = cli.dataset("public", "posts");
    let query = ds.select().filter([{
        "field": "id",
        "operator": "in",
        "values":[3,4,7]
      }]).sortDesc("updated_at").fields("updated_at").limit(3);
    query.execute().then((res)=>{console.log(res)}).catch((error)=>{console.log(error)});
  })
  .catch((err: Error) => console.log(err));