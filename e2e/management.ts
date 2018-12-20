import { default as fetch, Response } from "node-fetch";
import { api } from "./config";

export type DatasetFieldType = "boolean" | "date" | "datetime" | "float" | "integer" | "json" | "string" | "uuid";

export interface IDatasetFieldValidators {
  required: boolean;
}

export interface IDatasetFieldOptions {
  type: DatasetFieldType;
  validators: IDatasetFieldValidators;
}

export class Management {

  private token: string;

  private get headers() {
    return {
      "Authorization": `Bearer ${this.token}`,
      "Content-Type": "application/json"
    };
  }

  public login(): Promise<any> {
    return fetch(api.login, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: process.env.E2E_EMAIL,
        password: process.env.E2E_PASSWORD
      })
    }).then((res: any) => res.json())
      .then((tokens: { access_token: string, refresh_token: string}) => {
        this.token = tokens.access_token;
      });
  }

  public createDataset(name: string): Promise<any> {
    return fetch(api.dataset.create, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify({ name })
    })
      .then((response: Response) => response.json());
  }

  public deleteDataset(id: string): Promise<any> {
    return fetch(api.dataset.delete.replace("{dataset_id}", id), {
      method: "DELETE",
      headers: this.headers
    });
  }

  public createDatasetField(datasetId: string, name: string, options: IDatasetFieldOptions): Promise<any> {
    return fetch(api.dataset.field.create.replace("{dataset_id}", datasetId), {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify({
        name,
        ...options
      })
    })
      .then((response: Response) => response.json());
  }

  public createApiKey(): Promise<any> {
    return fetch(api.apikey.create, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify({ description: "test API key" })
    })
      .then((response: Response) => response.json());
  }

  public deleteApiKey(key: string): Promise<any> {
    return fetch(api.apikey.delete.replace("{key}", key), {
      method: "DELETE",
      headers: this.headers
    });
  }

  public createPolicy(dataset, apikey): Promise<any> {
    return fetch(api.policy.create, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify({
        description: "test_policy",
        actions: ["read", "create", "update", "delete"],
        effect: "allow",
        subjects: [apikey.key],
        resources: [dataset.name],
      })
    })
      .then((response: Response) => response.json());
  }

  public deletePolicy(id: string): Promise<any> {
    return fetch(api.policy.delete.replace("{policy_id}", id), {
      method: "DELETE",
      headers: this.headers
    });
  }
}
