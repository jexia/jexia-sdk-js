import { default as fetch, Response } from "node-fetch";
import { api } from "./config";

export class Management {

  private token: string;

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
    // tslint:disable-next-line:max-line-length
    return fetch(api.dataset.create, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ name })
    })
      .then((response: Response) => response.json());
  }

}
