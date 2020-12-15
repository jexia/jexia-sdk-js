import { Injectable } from "injection-js";

interface IConsole {
  log: (...params: any[]) => void;
}

/* Logging levels
   DEBUG - log as detailed as it possible
   INFO - log only important steps
   WARN - log only incorrect things
   ERROR - only errors
   NONE - keep silent */
export enum LogLevel {
  DEBUG,
  INFO,
  WARN,
  ERROR,
  NONE,
}

/* default configuration for the logger
   level NONE means that logging is off */
const DEFAULT_CONFIG = {
  level: LogLevel.NONE,
  modules: ["all"],
};

@Injectable()
export class Logger {

  private level: LogLevel = DEFAULT_CONFIG.level;
  private modules: string[] = DEFAULT_CONFIG.modules;
  private output: IConsole = console;

  /* Logger can be configured with LoggerModule constructor */
  public config(level: LogLevel = DEFAULT_CONFIG.level, modules: string[] = DEFAULT_CONFIG.modules,
                output?: IConsole) {
    this.level = level;
    this.modules = modules;
    if (output) {
      this.output = output;
    }
  }

  public debug(module: string, message: string) {
    this.log(LogLevel.DEBUG, module, message);
  }
  public info(module: string, message: string) {
    this.log(LogLevel.INFO, module, message);
  }
  public warn(module: string, message: string) {
    this.log(LogLevel.WARN, module, message);
  }
  public error(module: string, message: string) {
    this.log(LogLevel.ERROR, module, message);
  }

  private log(l: LogLevel, m: string, message: string) {
    if (l >= this.level && (this.modules.includes("all") || this.modules.includes(m))) {
      this.output.log(`[${m} ${Date()}]: ${message}`);
    }
  }
}
