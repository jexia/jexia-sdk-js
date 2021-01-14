// tslint:disable:no-string-literal
import * as faker from "faker";
import { Dispatcher, DispatchEvents, DispatchEventsType } from "./dispatcher";

const randomEvent = () => faker.random.arrayElement(Object.values(DispatchEvents));

describe("Dispatcher", () => {
  function createSubject({
    event = randomEvent(),
    alias = faker.random.word(),
    // tslint:disable-next-line:no-empty
    listener = () => {},
    subscribe = true,
  } = {}) {
    const subject = new Dispatcher();

    if (subscribe) {
      // tslint:disable-next-line:no-empty
      subject.on(event, alias, listener);
    }

    return {
      subject,
      event,
      alias,
      listener,
    };
  }

  describe("Subscribe", () => {
    it("should subscribe to an event", () => {
      const { subject, event } = createSubject();

      expect((subject as any).events.get(event).size).toBe(1);
    });
  });

  describe("Unsubscribe", () => {
    it("should unsubscribe from an event", () => {
      const { subject, event, alias } = createSubject();

      subject.off(event, alias);

      expect((subject as any).events.get(event).size).toBe(0);
    });

    it("should do nothing when an invalid event is given", () => {
      const { subject, alias, event } = createSubject();
      const invalidEvent = faker.random.word() as DispatchEventsType;

      subject.off(invalidEvent, alias);

      expect((subject as any).events.get(event).size).toBe(1);
    });
  });

  describe("Emit", () => {
    it("should emit listener", () => {
      const listener = jest.fn();
      const { subject, event, alias } = createSubject({ listener });

      subject.emit(event, alias);

      expect(listener).toHaveBeenCalled();
    });

    it("should NOT emit when an invalid event is given", () => {
      const listener = jest.fn();
      const { subject } = createSubject({ listener });
      const event = faker.random.word() as DispatchEventsType;

      subject.emit(event);

      expect(listener).not.toHaveBeenCalled();
    });
  });
});
