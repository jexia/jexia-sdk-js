// tslint:disable:no-string-literal
import { Logger, LogLevel } from "./logger";

let logger: Logger;
let consoleMock: any;

describe("Logger", () => {

  beforeEach(() => {
    logger = new Logger();
    consoleMock = {
      log: jasmine.createSpy("log"),
    };
  });

  it("should have default config after creating", () => {
    expect(logger["level"]).toBe(LogLevel.NONE);
    expect(logger["modules"]).toEqual(["all"]);
  });

  it("config method without arguments should set default values", () => {
    logger.config();
    expect([logger["level"], logger["modules"]]).toEqual([LogLevel.NONE, ["all"]]);
  });

  it("config method should set level and modules", () => {
    logger.config(LogLevel.WARN, ["TestModule"]);
    expect(logger["level"]).toBe(LogLevel.WARN);
    expect(logger["modules"]).toEqual(["TestModule"]);
  });

  describe("debug", () => {

    it("should call log method with DEBUG level", () => {
      logger["log"] = jasmine.createSpy("log", logger["log"]);
      logger.debug("TestModule", "TestMessage");
      expect(logger["log"]).toHaveBeenCalledWith(LogLevel.DEBUG, "TestModule", "TestMessage");
    });

    it("should not print message if level is any but DEBUG", () => {
      logger.config(LogLevel.INFO, ["all"], consoleMock);
      logger.debug("TestModule", "TestMessage");
      logger.config(LogLevel.WARN, ["all"], consoleMock);
      logger.debug("TestModule", "TestMessage");
      logger.config(LogLevel.ERROR, ["all"], consoleMock);
      logger.debug("TestModule", "TestMessage");
      logger.config(LogLevel.NONE, ["all"], consoleMock);
      logger.debug("TestModule", "TestMessage");

      expect(consoleMock.log).toHaveBeenCalledTimes(0);
    });

    it("should print message if level is DEBUG", () => {
      logger.config(LogLevel.DEBUG, ["all"], consoleMock);
      logger.debug("TestModule", "TestMessage");
      expect(consoleMock.log).toHaveBeenCalled();
    });
  });

  describe("info", () => {

    it("should call log method with INFO level", () => {
      logger["log"] = jasmine.createSpy("log", logger["log"]);
      logger.info("TestModule", "TestMessage");
      expect(logger["log"]).toHaveBeenCalledWith(LogLevel.INFO, "TestModule", "TestMessage");
    });

    describe("should not print message if level is", () => {

      it("WARN", () => {
        logger.config(LogLevel.WARN, ["all"], consoleMock);
        logger.info("TestModule", "TestMessage");
        expect(consoleMock.log).toHaveBeenCalledTimes(0);
      });

      it("ERROR", () => {
        logger.config(LogLevel.ERROR, ["all"], consoleMock);
        logger.info("TestModule", "TestMessage");
        expect(consoleMock.log).toHaveBeenCalledTimes(0);
      });

      it("NONE", () => {
        logger.config(LogLevel.NONE, ["all"], consoleMock);
        logger.info("TestModule", "TestMessage");
        expect(consoleMock.log).toHaveBeenCalledTimes(0);
      });
    });

    describe("should print message if level is", () => {

      it("DEBUG", () => {
        logger.config(LogLevel.DEBUG, ["all"], consoleMock);
        logger.info("TestModule", "TestMessage");
        expect(consoleMock.log).toHaveBeenCalled();
      });

      it("INFO", () => {
        logger.config(LogLevel.INFO, ["all"], consoleMock);
        logger.info("TestModule", "TestMessage");
        expect(consoleMock.log).toHaveBeenCalled();
      });
    });
  });

  describe("warn", () => {

    it("should call log method with WARN level", () => {
      logger["log"] = jasmine.createSpy("log", logger["log"]);
      logger.warn("TestModule", "TestMessage");
      expect(logger["log"]).toHaveBeenCalledWith(LogLevel.WARN, "TestModule", "TestMessage");
    });

    describe("should not print message if level is", () => {

      it("ERROR", () => {
        logger.config(LogLevel.ERROR, ["all"], consoleMock);
        logger.warn("TestModule", "TestMessage");
        expect(consoleMock.log).toHaveBeenCalledTimes(0);
      });

      it("NONE", () => {
        logger.config(LogLevel.NONE, ["all"], consoleMock);
        logger.warn("TestModule", "TestMessage");
        expect(consoleMock.log).toHaveBeenCalledTimes(0);
      });
    });

    describe("should print message if level is", () => {

      it("DEBUG", () => {
        logger.config(LogLevel.DEBUG, ["all"], consoleMock);
        logger.warn("TestModule", "TestMessage");
        expect(consoleMock.log).toHaveBeenCalled();
      });

      it("INFO", () => {
        logger.config(LogLevel.INFO, ["all"], consoleMock);
        logger.warn("TestModule", "TestMessage");
        expect(consoleMock.log).toHaveBeenCalled();
      });

      it("WARN", () => {
        logger.config(LogLevel.WARN, ["all"], consoleMock);
        logger.warn("TestModule", "TestMessage");
        expect(consoleMock.log).toHaveBeenCalled();
      });
    });
  });

  describe("error", () => {

    it("should call log method with ERROR level", () => {
      logger["log"] = jasmine.createSpy("log", logger["log"]);
      logger.error("TestModule", "TestMessage");
      expect(logger["log"]).toHaveBeenCalledWith(LogLevel.ERROR, "TestModule", "TestMessage");
    });

    it("should not print message if level is NONE", () => {
      logger.config(LogLevel.NONE, ["all"], consoleMock);
      logger.warn("TestModule", "TestMessage");
      expect(consoleMock.log).toHaveBeenCalledTimes(0);
    });

    describe("should print message if level is", () => {

      it("DEBUG", () => {
        logger.config(LogLevel.DEBUG, ["all"], consoleMock);
        logger.error("TestModule", "TestMessage");
        expect(consoleMock.log).toHaveBeenCalled();
      });

      it("INFO", () => {
        logger.config(LogLevel.INFO, ["all"], consoleMock);
        logger.error("TestModule", "TestMessage");
        expect(consoleMock.log).toHaveBeenCalled();
      });

      it("WARN", () => {
        logger.config(LogLevel.WARN, ["all"], consoleMock);
        logger.error("TestModule", "TestMessage");
        expect(consoleMock.log).toHaveBeenCalled();
      });

      it("ERROR", () => {
        logger.config(LogLevel.ERROR, ["all"], consoleMock);
        logger.error("TestModule", "TestMessage");
        expect(consoleMock.log).toHaveBeenCalled();
      });
    });
  });

  describe("log", () => {

    it("should print message if modules has 'all' value", () => {
      logger.config(LogLevel.DEBUG, ["all"], consoleMock);
      logger.error("TestModule", "TestMessage");
      expect(consoleMock.log).toHaveBeenCalled();
    });

    it("should print message if provided module is included in modules", () => {
      logger.config(LogLevel.DEBUG, ["TestModule"], consoleMock);
      logger.error("TestModule", "TestMessage");
      expect(consoleMock.log).toHaveBeenCalled();
    });

    it("should not print message if neither provided module nor 'all' is not included in modules", () => {
      logger.config(LogLevel.DEBUG, ["AnotherModule"], consoleMock);
      logger.error("TestModule", "TestMessage");
      expect(consoleMock.log).toHaveBeenCalledTimes(0);
    });
  });
});
