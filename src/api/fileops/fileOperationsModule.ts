import { ReflectiveInjector } from "injection-js";
import { RequestExecuter } from "../../internal/executer";
import { ClientConfiguration } from "../core/client";
import { IModule, ModuleConfiguration } from "../core/module";
import { AuthOptions } from "../core/tokenManager";
import { FileOperationsConfig, FilesetInterface, FilesetName, IFormData } from "./fileops.interfaces";
import { Fileset } from "./fileset";
import { FileUploader } from "./fileUploader";

const defaultConfiguration: FileOperationsConfig = {
  uploadWaitForCompleted: false,
  uploadTimeout: 120000
};

export class FileOperationsModule<FormDataType extends IFormData<F>, F> implements IModule {
  private injector: ReflectiveInjector;
  private readonly config: FileOperationsConfig;

  constructor(private formData: FormDataType, config: Partial<FileOperationsConfig>) {
    this.config = Object.assign(defaultConfiguration, config);
  }

  public init(coreInjector: ReflectiveInjector): Promise<this> {
    this.injector = coreInjector.resolveAndCreateChild([
      RequestExecuter,
    ]);

    /* Check for RTC module if file upload subscription is activated */
    if (this.config.uploadWaitForCompleted) {
      const isRTCModuleActive = Boolean(this.injector.get(ClientConfiguration).rtc);
      if (!isRTCModuleActive) {
        return Promise.reject("RTC module needs to be activated for automatic file uploading subscription");
      }
    }

    return Promise.resolve(this);
  }

  public getConfig(): ModuleConfiguration {
    return { fileOperations: this.config };
  }

  /**
   * Returns fileset class which can handle fileset operations
   * @param fileset {string} Fileset name
   * @param auth {string} optional auth alias
   */
  public fileset<T extends object = any>(fileset: string, auth?: string):
    Fileset<FormDataType, T, FilesetInterface<T>, F> {

    let config = this.injector.get(AuthOptions);
    if (auth) {
      config.auth = auth;
    }

    const injector = this.injector.resolveAndCreateChild([
      {
        provide: FilesetName,
        useValue: fileset,
      },
      {
        provide: AuthOptions,
        useValue: config,
      },
      FileUploader,
      Fileset,
    ]);

    injector.get(FileUploader).provideFormData(this.formData);

    return injector.get(Fileset);
  }

  /* tslint:disable:max-line-length */
  public filesets<A extends {}, B extends {}>(filesets: [string, string], auth?: string):
    [Fileset<FormDataType, A, FilesetInterface<A>, F>, Fileset<FormDataType, B, FilesetInterface<B>, F>];
  public filesets<A extends {}, B extends {}, C extends {}>(filesets: [string, string, string], auth?: string):
    [Fileset<FormDataType, A, FilesetInterface<A>, F>, Fileset<FormDataType, B, FilesetInterface<B>, F>, Fileset<FormDataType, C, FilesetInterface<C>, F>];
  public filesets<A extends {}, B extends {}, C extends {}, D extends {}>(filesets: [string, string, string, string], auth?: string):
    [Fileset<FormDataType, A, FilesetInterface<A>, F>, Fileset<FormDataType, B, FilesetInterface<B>, F>, Fileset<FormDataType, C, FilesetInterface<C>, F>, Fileset<FormDataType, D, FilesetInterface<D>, F>];
  public filesets<A extends {}, B extends {}, C extends {}, D extends {}, E extends {}>(filesets: [string, string, string, string, string], auth?: string):
    [Fileset<FormDataType, A, FilesetInterface<A>, F>, Fileset<FormDataType, B, FilesetInterface<B>, F>, Fileset<FormDataType, C, FilesetInterface<C>, F>, Fileset<FormDataType, D, FilesetInterface<D>, F>, Fileset<FormDataType, E, FilesetInterface<E>, F>];
  public filesets<A extends {}, B extends {}, C extends {}, D extends {}, E extends {}, G extends {}>(filesets: [string, string, string, string, string, string], auth?: string):
    [Fileset<FormDataType, A, FilesetInterface<A>, F>, Fileset<FormDataType, B, FilesetInterface<B>, F>, Fileset<FormDataType, C, FilesetInterface<C>, F>, Fileset<FormDataType, D, FilesetInterface<D>, F>, Fileset<FormDataType, E, FilesetInterface<E>, F>, Fileset<FormDataType, G, FilesetInterface<G>, F>];
  public filesets(filesets: string[], auth?: string): Array<Fileset<FormDataType, any, FilesetInterface<any>, F>>;

  /**
   * Generates a list of filesets by given array of Fileset names
   * @param filesets array of Fileset names
   * @param auth optional user authorization alias
   */
  public filesets(filesets: string[], auth?: string) {
    return filesets.map((fileset) => this.fileset(fileset, auth));
  }

  public terminate(): Promise<this> {
    return Promise.resolve(this);
  }
}
