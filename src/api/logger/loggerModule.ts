import { ReflectiveInjector } from "injection-js";
import { IModule } from "../core/module";
import { Logger, LogLevel } from "./logger";

export class LoggerModule implements IModule {

  constructor(
    private level: LogLevel,
    private module?: string[]
    ) {}

  public init(coreInjector: ReflectiveInjector) {

    const logger = coreInjector.get(Logger);
    logger.config(this.level, this.module);

    return Promise.resolve(this);
  }

  public terminate() {
    return Promise.resolve(this);
  }

}
