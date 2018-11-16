// tslint:disable:no-string-literal
import { ReflectiveInjector } from "injection-js";
import { Logger, LogLevel } from "./logger";
import { LoggerModule } from "./loggerModule";

describe("LoggerModule", () => {
  let loggerModule: LoggerModule;

  beforeEach(() => {
    loggerModule = new LoggerModule(LogLevel.NONE, ["all"]);
  });

  it("when initializing should configure logger with provided values", () => {
    const injector = ReflectiveInjector.resolveAndCreate([
      Logger,
    ]);
    loggerModule = new LoggerModule(LogLevel.INFO, ["TestModule"]);
    loggerModule.init(injector);

    const logger = injector.get(Logger);

    expect([logger["level"], logger["modules"]]).toEqual([LogLevel.INFO, ["TestModule"]]);
  });

  describe("when terminating", () => {

    it("should resolve automatically", async () => {
      const result = await loggerModule.terminate();
      expect(result).toBe(loggerModule);
    });
  });

});
