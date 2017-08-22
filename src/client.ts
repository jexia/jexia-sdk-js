import { Dataset } from "./dataset";
import { CompositeFilteringCondition, FilteringCondition, ICondition } from "./filteringCondition";
import { IModule } from "./module";
import { QueryExecuterBuilder } from "./queryExecuterBuilder";
import { IRequestAdapter, RequestAdapter } from "./requestAdapter";
import { IAuthOptions, TokenManager } from "./tokenManager";

export default class Client {
  /* token manager (responsible for getting fresh and valid token), should be injected to plugins/modules (if needed) */
  public tokenManager: TokenManager;
  /* request adapter */
  public requestAdapter: IRequestAdapter;
  /* application URL */
  private appUrl: string;
  private appIp: string;
  private queryExecuterBuilder: QueryExecuterBuilder;

  public constructor(private fetch: Function) {
    this.requestAdapter = new RequestAdapter(this.fetch);
    this.tokenManager = new TokenManager(this.requestAdapter);
  }

  public init(opts: IAuthOptions, ...modules: IModule[]): Promise<Client> {
    /* save only appUrl (do not store key and secret) */
    this.appIp = opts.appUrl;
    // band-aid - the information on how the API access URL is formatted
    // belongs in the classes using the URL directly. Client should only
    // pass/store the IP; also more inteligent URL/IP formatting methods
    // should be used than a string literal
    this.appUrl = `http://${opts.appUrl}:8080`;
    opts = {appUrl: this.appUrl, key: opts.key, secret: opts.secret};

    this.queryExecuterBuilder = new QueryExecuterBuilder(this.appUrl, this.requestAdapter, this.tokenManager);

    return this.tokenManager.init(opts)
      /* init all modules */
      .then(() => Promise.all(modules.map((curr) => curr.init(this.appIp, this.tokenManager, this.requestAdapter))))
      /* make the Client available only after all modules have been successfully initialized */
      .then(() => this)
      /* if token manager failed to init or at least one of core modules failed to load */
      .catch((err: Error) => {
        /* stop refresh loop */
        this.tokenManager.terminate();
        /* throw error up (to global catch)*/
        throw err;
      });
  }

  public dataset(dataset: string, schema: string = "public"): Dataset {
    if (this.queryExecuterBuilder == null) {
      throw new Error("Client has not been initialised properly. Please instantiate \
                      client for invoking this method");
    }
    return new Dataset(schema, dataset, this.queryExecuterBuilder);
  }
}

export function authenticate(appUrl: string, key: string, secret: string): IAuthOptions {
  return {appUrl, key, secret};
}

export function condition(field: string, operator: string, value: string): FilteringCondition {
  return new FilteringCondition(field, operator, value);
}

export function complexCondition(filteringCondition: ICondition,
                                 logicalOperatorType: string): CompositeFilteringCondition {
  return new CompositeFilteringCondition(filteringCondition, logicalOperatorType);
}
