import { ReflectiveInjector } from 'injection-js';
import { IModule } from '../core/module';
import { AuthOptions } from '../core/tokenManager';
import { FilesetInterface, FilesetName, IFormData } from './fileops.interfaces';
import { Fileset } from './fileset';
import { FileUploader } from './fileUploader';

export class FileOperationsModule<FormDataType extends IFormData<F>, F> implements IModule {
  private injector: ReflectiveInjector;

  constructor(private formData: FormDataType) {}

  public init(coreInjector: ReflectiveInjector): Promise<this> {
    this.injector = coreInjector.resolveAndCreateChild([]);
    return Promise.resolve(this);
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

  public terminate(): Promise<this> {
    return Promise.resolve(this);
  }
}
