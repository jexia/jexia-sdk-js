import { ReflectiveInjector } from 'injection-js';
import { RequestExecuter } from '../../internal/executer';
import { IModule } from '../core/module';
import { AuthOptions } from '../core/tokenManager';
import { FilesetInterface, FilesetName } from './fileops.interfaces';
import { Fileset } from './fileset';
import { FileUploader } from './fileUploader';

export class FileOperationsModule<F> implements IModule {
  private injector: ReflectiveInjector;

  public init(coreInjector: ReflectiveInjector): Promise<this> {
    this.injector = coreInjector;
    return Promise.resolve(this);
  }

  public fileset<T extends object = any>(fileset: string, auth?: string): Fileset<T, FilesetInterface<T>, F> {
    let config = this.injector.get(AuthOptions);
    if (auth) {
      config.auth = auth;
    }
    return this.injector.resolveAndCreateChild([
      {
        provide: FilesetName,
        useValue: fileset,
      },
      {
        provide: AuthOptions,
        useValue: config,
      },
      RequestExecuter,
      FileUploader,
      Fileset,
    ]).get(Fileset);
  }

  public terminate(): Promise<this> {
    return Promise.resolve(this);
  }
}
