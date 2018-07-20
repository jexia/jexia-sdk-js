// tslint:disable:max-line-length
import { Subscription } from "rxjs/internal/Subscription";
import { Observer } from "rxjs/internal/types";
import { combineLatest } from "rxjs/operators";
import { EventSubscriptionType } from "src";
import { createMockFor, deepFreeze, SpyObj } from "../../../spec/testUtils";
import { MESSAGE } from "../../config";
import { RequestExecuter } from "../../internal/executer";
import { Dataset } from "../dataops/dataset";
import * as datasetWatch from "./datasetWatch";
import {
  CommandError,
  CommandErrorCodes,
  JwtRefreshArgument,
  NotificationCodes,
  RealTimeCommand,
  RealTimeCommandTypes,
  RealTimeEventMessage,
  RealTimeMessage,
  RealTimeMessageTypes,
  ResourceType,
} from "./realTime.interfaces";

const tokenTest = "tokenTest";
const datasetName = "test-dataset";
const otherDatasetName = "other-test-dataset";
const shouldHaveFailed = "Should have failed!";
const realtimeError: CommandError = deepFreeze({
  code: CommandErrorCodes.InternalError,
  info: "some error info",
});

function createSubject({
  start = true,
  webSocketMock = createMockFor(["send", "close"]) as SpyObj<WebSocket>,
  requestExecuterMock = createMockFor(RequestExecuter),
  tokenPromise = Promise.resolve(tokenTest),
  getToken = jasmine.createSpy().and.returnValue(tokenPromise),
} = {}) {

  let dataset = new Dataset(datasetName, requestExecuterMock);

  if (start) {
    /* this should be done in realTimeModule, not supposed to be tested here */
    Dataset.prototype.watch = datasetWatch.watch;
    Dataset.prototype.webSocket = webSocketMock;

    datasetWatch.start(webSocketMock, getToken);
  }
  return {
    getToken,
    webSocketMock,
    requestExecuterMock,
    dataset,
    otherDataset: new Dataset(otherDatasetName, requestExecuterMock),
    subject: datasetWatch,
  };
}

function createSubscribeCommandMessage(action: EventSubscriptionType[], dataset = datasetName) {
  return createCommandMessage(RealTimeCommandTypes.Subscribe, action, dataset);
}

function createUnsubscribeCommandMessage(action: EventSubscriptionType[], dataset = datasetName) {
  return createCommandMessage(RealTimeCommandTypes.UnSubscribe, action, dataset);
}

function createCommandMessage(command: RealTimeCommandTypes, action: EventSubscriptionType[], dataset = datasetName) {
  return {
    data: JSON.stringify({
      type: RealTimeMessageTypes.Command,
      data: {
        command,
        arguments: {
          action,
          resource: {
            type: ResourceType.Dataset,
            name: dataset,
          },
        },
      }
    })
  };
}

function createJwtRefreshCommandMessage(token = tokenTest): RealTimeMessage {
  return {
    type: RealTimeMessageTypes.Command,
    data: {
      command: RealTimeCommandTypes.JwtRefresh,
      arguments: {
        token,
      } as JwtRefreshArgument,
    } as RealTimeCommand,
  };
}

function createResponseCommandMessage(data: any) {
  return {
    data: JSON.stringify({
      type: RealTimeMessageTypes.CommandResponse, data
    }
  )};
}

function createNotificationMessage(code = NotificationCodes.TokenAboutToExpire, info = "some test info", data?: any) {
  return { type: RealTimeMessageTypes.Notification, data: JSON.stringify({
    code,
    info,
    data,
  })};
}

function createEventMessage(messageOptions?: Partial<RealTimeEventMessage>) {
  return {
    data: JSON.stringify({
      type: RealTimeMessageTypes.EventMessage,
      data: createEventMessageData(null, messageOptions),
    }
  )};
}

function createEventMessageData(data: any = {}, options?: Partial<RealTimeEventMessage>): RealTimeEventMessage {
  return {
    action: "created",
    resource: {
      name: datasetName,
      type: ResourceType.Dataset,
    },
    modifier: {
      id: "modifier-id-test",
      type: "modifier-type-test",
    },
    timestamp: "timestamp-message-test",
    data,
    ...options,
  };
}

function subscriptionErrors(done: jest.DoneCallback): Observer<any> {
  return {
    next: () => done.fail("should not have an event at this subscription!"),
    error: () => done.fail("should not have an error at this subscription!"),
    complete: () => done.fail("this subscription should not have conclude!"),
  };
}

describe("Dataset Watch", () => {

  let subs: Subscription[] = [];

  afterEach(() => {
    subs.forEach((s) => {
      try {
        s.unsubscribe();
      } catch (error) { /* */ }
    });
    subs = [];
  });

  describe("when subscribing to the realtime observable", () => {

    it("should send subscription command for all dataset events by default", async () => {
      const { dataset, webSocketMock } = createSubject();

      const sub = dataset.watch().subscribe();

      return new Promise((resolve) => {
        setTimeout(() => {
          expect(webSocketMock.send).toHaveBeenCalledWith(createSubscribeCommandMessage(["all"]).data);
          sub.unsubscribe();
          resolve();
        });
      });

    });

    it("should throw an error if there is a wrong dataset event", () => {
      const { dataset } = createSubject();

      try {
        // typescript type checking cancellation
        (dataset.watch as any)("wrongEvent").subscribe();
      } catch (error) {
        expect(error.message).toEqual(MESSAGE.RTC.BAD_EVENT_SUBSCRIPTION_TYPE);
      }
    });

    it("should send subscription command for a single dataset event", async () => {
      const { dataset, webSocketMock } = createSubject();
      const events = "created";
      const sub = dataset.watch(events).subscribe();

      return new Promise((resolve) => {
        setTimeout(() => {
          expect(webSocketMock.send).toHaveBeenCalledWith(createSubscribeCommandMessage([events]).data);
          sub.unsubscribe();
          resolve();
        });
      });
    });

    it("should send subscribe command for even if there is another observer listen to the same event in another dataset",
      async () => new Promise((done) => {
        const {dataset, otherDataset, webSocketMock} = createSubject();
        const events = "created";
        const firstSub = dataset.watch(events).subscribe();
        const secondSub = otherDataset.watch(events).subscribe();
        setTimeout(() => {
          firstSub.unsubscribe();
          expect(webSocketMock.send).toHaveBeenCalledWith(createSubscribeCommandMessage([events]).data);
          secondSub.unsubscribe();
          done();
        });
    }));

    it("should send subscription command for multiple dataset events by spread operator", (done) => {
      const { dataset, webSocketMock } = createSubject();
      const events: EventSubscriptionType[] = ["created", "updated"];
      subs.push(dataset.watch(...events).subscribe());
      setTimeout(() => {
        expect(webSocketMock.send).toHaveBeenCalledWith(createSubscribeCommandMessage(events).data);
        done();
      });
    });

    it("should send subscription command for multiple dataset events by array", (done) => {
      const { dataset, webSocketMock } = createSubject();
      const events: EventSubscriptionType[] = ["created", "updated"];
      subs.push(dataset.watch(events).subscribe());
      setTimeout(() => {
        expect(webSocketMock.send).toHaveBeenCalledWith(createSubscribeCommandMessage(events).data);
        done();
      });
    });

    it("should send subscribe command just for 'all' if it send all possible events", (done) => {
      const { dataset, webSocketMock, subject } = createSubject();
      subs.push(dataset.watch(...subject.allEvents).subscribe());
      setTimeout(() => {
        expect(webSocketMock.send).toHaveBeenCalledWith(createSubscribeCommandMessage(["all"]).data);
        done();
      });
    });

    it("should clean duplicated events when sending subscription command", (done) => {
      const { dataset, webSocketMock } = createSubject();
      const events: EventSubscriptionType[] = ["created", "updated"];
      subs.push(dataset.watch([...events, ...events]).subscribe());
      setTimeout(() => {
        expect(webSocketMock.send).toHaveBeenCalledWith(createSubscribeCommandMessage(events).data);
        done();
      });
    });

    it("should not send a subscribe command if there is another observable watching the same event at the same dataset", (done) => {
      const { dataset, webSocketMock } = createSubject();
      const action: EventSubscriptionType = "deleted";

      subs.push(dataset.watch(action).subscribe());

      setTimeout(() => {
        webSocketMock.send.mockReset();
        subs.push(dataset.watch(action).subscribe());

        setTimeout(() => {
          expect(webSocketMock.send).not.toHaveBeenCalledWith(createSubscribeCommandMessage([action]).data);
          done();
        });
      });
    });

    it("should not send any subscribe command if there is another observable watching the same events at this dataset", (done) => {
      const { dataset, webSocketMock } = createSubject();

      subs.push(dataset.watch("all").subscribe());

      setTimeout(() => {
        webSocketMock.send.mockReset();
        subs.push(dataset.watch("deleted", "created").subscribe());
        setTimeout(() => {
          expect(webSocketMock.send).not.toHaveBeenCalled();
          done();
        });
      });
    });

    it("should send a subscribe command for individual events that there is no others observable watching at the same dataset", (done) => {
      const { dataset, webSocketMock } = createSubject();

      subs.push(dataset.watch("deleted").subscribe());
      subs.push(dataset.watch("created").subscribe());

      setTimeout(() => {
        expect(webSocketMock.send).toHaveBeenCalledWith(createSubscribeCommandMessage(["deleted"]).data);
        expect(webSocketMock.send).toHaveBeenCalledWith(createSubscribeCommandMessage(["created"]).data);
        done();
      });
    });

    it("should send a subscribe command for individual events that there is no others observable watching at the same dataset even when using 'all'", (done) => {
      const { dataset, webSocketMock, subject } = createSubject();
      const action: EventSubscriptionType = "deleted";
      const allOtherEvents = subject.allEvents.filter((e) => e !== action);

      subs.push(dataset.watch(action).subscribe());

      setTimeout(() => {
        webSocketMock.send.mockReset();
        subs.push(dataset.watch("all").subscribe());
        setTimeout(() => {
          expect(webSocketMock.send).not.toHaveBeenCalledWith(createSubscribeCommandMessage(["deleted"]).data);
          expect(webSocketMock.send).toHaveBeenCalledWith(createSubscribeCommandMessage(allOtherEvents).data);
          done();
        });
      });
    });

    it("should send an error to the observable if the websocket object throws an error when sending the subscription command", (done) => {
      const { dataset, webSocketMock } = createSubject();
      const subsErrors = subscriptionErrors(done);
      const webSocketError = "some webSocket error";

      webSocketMock.send.mockImplementationOnce((args: any) => {
        throw new Error(webSocketError);
      });

      subs.push(dataset.watch().subscribe(
        subsErrors.next,
        (error) => {
          expect(error.message).toContain(webSocketError);
          done();
        },
        subsErrors.complete,
      ));
    });

    it("should send a better error message to the observable when the websocket object throws a not connected error", (done) => {
      const { dataset, webSocketMock } = createSubject();
      const subsErrors = subscriptionErrors(done);

      webSocketMock.send.mockImplementationOnce((args: any) => {
        throw new Error(MESSAGE.RTC.NOT_OPEN_ERROR);
      });

      subs.push(dataset.watch().subscribe(
        subsErrors.next,
        (error) => {
          expect(error.message).toContain(MESSAGE.RTC.NOT_OPEN_MESSAGE);
          done();
        },
        subsErrors.complete,
      ));
    });

  });

  describe("when websocket send a command response message", () => {

    it("should send an error to the observable if the websocket sends an error at the command response", async (done) => {
      const { dataset, webSocketMock } = createSubject();
      const request = createSubscribeCommandMessage(["all"]);

      let sub = dataset.watch();

      setTimeout(async () => {

        setTimeout(() => webSocketMock.onmessage(
          createResponseCommandMessage({request, error: realtimeError})), 10);

        try {
          await sub.toPromise();
          throw new Error(shouldHaveFailed);
        } catch (error) {
          expect(error.message).toContain(realtimeError.code);
          expect(error.message).toContain(realtimeError.info);
        }
        done();
      });
    });

    it("should not send any event to the observable if the websocket sends a success command response", (done) => {
      const { dataset, webSocketMock } = createSubject();

      subs.push(dataset.watch().subscribe(subscriptionErrors(done)));

      webSocketMock.onmessage(createResponseCommandMessage({ request: createSubscribeCommandMessage(["all"]) }));
      setTimeout(() => done(), 10);
    });

    it("should not explode if the websocket sends command response if there is no one waiting for it", (done) => {
      const { webSocketMock } = createSubject();
      webSocketMock.onmessage(createResponseCommandMessage({ request: createSubscribeCommandMessage(["all"]) }));
      setTimeout(() => done(), 10);
    });

    it("should send errors of command response to the correct observable subscription", (done) => {
      const { dataset, otherDataset, webSocketMock } = createSubject();

      const subsErrors = subscriptionErrors(done);

      subs.push(dataset.watch().subscribe(subsErrors));
      subs.push(otherDataset.watch().subscribe(
        subsErrors.next,
        () => done(),
        subsErrors.complete,
      ));

      setTimeout(() => {
        webSocketMock.onmessage(createResponseCommandMessage({
          request: createSubscribeCommandMessage(["all"], otherDatasetName),
          error: realtimeError,
        }));
      });
    });

  });

  describe("when unsubscribing to the realtime observable", () => {

    it("should send unsubscribe command for all dataset events by default", (done) => {
      const { dataset, webSocketMock } = createSubject();
      dataset.watch().subscribe().unsubscribe();

      setTimeout(() => {
        expect(webSocketMock.send).toHaveBeenCalledWith(createUnsubscribeCommandMessage(["all"]).data);
        done();
      });
    });

    it("should send unsubscribe command for a single dataset event", (done) => {
      const { dataset, webSocketMock } = createSubject();
      const events = "created";
      dataset.watch(events).subscribe().unsubscribe();
      setTimeout(() => {
        expect(webSocketMock.send).toHaveBeenCalledWith(createUnsubscribeCommandMessage([events]).data);
        done();
      });
    });

    it("should send unsubscribe command for even if there is another observer listen to the same event in another dataset", (done) => {
      const { dataset, otherDataset, webSocketMock } = createSubject();
      const events = "created";
      const firstSub = dataset.watch(events).subscribe();
      subs.push(otherDataset.watch(events).subscribe());
      firstSub.unsubscribe();
      setTimeout(() => {
        expect(webSocketMock.send).toHaveBeenCalledWith(createUnsubscribeCommandMessage([events]).data);
        done();
      });
    });

    it("should send unsubscribe command for multiple dataset events by spread operator", (done) => {
      const { dataset, webSocketMock } = createSubject();
      const events: EventSubscriptionType[] = ["created", "updated"];
      dataset.watch(...events).subscribe().unsubscribe();
      setTimeout(() => {
        expect(webSocketMock.send).toHaveBeenCalledWith(createUnsubscribeCommandMessage(events).data);
        done();
      });
    });

    it("should send unsubscribe command for multiple dataset events by array", (done) => {
      const { dataset, webSocketMock } = createSubject();
      const events: EventSubscriptionType[] = ["created", "updated"];
      dataset.watch(events).subscribe().unsubscribe();
      setTimeout(() => {
        expect(webSocketMock.send).toHaveBeenCalledWith(createUnsubscribeCommandMessage(events).data);
        done();
      });
    });

    it("should send unsubscribe command just for 'all' if it send all possible events", (done) => {
      const { dataset, webSocketMock, subject } = createSubject();
      dataset.watch(...subject.allEvents).subscribe().unsubscribe();
      setTimeout(() => {
        expect(webSocketMock.send).toHaveBeenCalledWith(createUnsubscribeCommandMessage(["all"]).data);
        done();
      });
    });

    it("should clean duplicated events when sending unsubscribe command", (done) => {
      const { dataset, webSocketMock } = createSubject();
      const events: EventSubscriptionType[] = ["created", "updated"];
      dataset.watch([...events, ...events]).subscribe().unsubscribe();
      setTimeout(() => {
        expect(webSocketMock.send).toHaveBeenCalledWith(createUnsubscribeCommandMessage(events).data);
        done();
      });
    });

    it("should not send an unsubscribe command if there is another observable watching the same event at the same dataset", (done) => {
      const { dataset, webSocketMock } = createSubject();
      const action: EventSubscriptionType = "deleted";

      const firstSub = dataset.watch(action).subscribe();
      subs.push(dataset.watch(action).subscribe());
      firstSub.unsubscribe();

      setTimeout(() => {
        expect(webSocketMock.send).not.toHaveBeenCalledWith(createUnsubscribeCommandMessage([action]).data);
        done();
      });
    });

    it("should not send an unsubscribe command for events if there is another observable watching another event at the same dataset", (done) => {
      const { dataset, webSocketMock } = createSubject();

      const firstSub = dataset.watch("all").subscribe();
      subs.push(dataset.watch("deleted").subscribe());
      firstSub.unsubscribe();

      setTimeout(() => {
        expect(webSocketMock.send).not.toHaveBeenCalledWith(createUnsubscribeCommandMessage(["all"]).data);
        done();
      });
    });

    it("should not send any unsubscribe command if there is another observables watching all the events at the same dataset", (done) => {
      const { dataset, webSocketMock } = createSubject();

      const firstSub = dataset.watch("deleted").subscribe();
      subs.push(dataset.watch("deleted").subscribe());
      webSocketMock.send.mockReset();

      setTimeout(() => {
        firstSub.unsubscribe();
        expect(webSocketMock.send).not.toHaveBeenCalledWith(createUnsubscribeCommandMessage(["deleted"]).data);
        done();
      });
    });

    it("should send an unsubscribe command for individual events that there is no others observable watching at the same dataset", (done) => {
      const { dataset, webSocketMock } = createSubject();

      const firstSub = dataset.watch("all").subscribe();
      subs.push(dataset.watch("deleted").subscribe());
      firstSub.unsubscribe();

      setTimeout(() => {
        expect(webSocketMock.send).toHaveBeenCalledWith(createUnsubscribeCommandMessage(["created", "updated"]).data);
        done();
      });
    });

  });

  describe("when websocket receives message events", () => {

    it("should throw an error if message is wrong", () => {
      const { webSocketMock } = createSubject();
      try {
        webSocketMock.onmessage({
          data: "wrong data"
        });
      } catch (error) {
        expect(error.message).toEqual(MESSAGE.RTC.BAD_MESSAGE);
      }
    });

    it("should send a message event to the correct observable if the websocket sends an event message for a subscribed event", (done) => {
      const { dataset, otherDataset, webSocketMock } = createSubject();

      const subsErrors = subscriptionErrors(done);
      const action: EventSubscriptionType = "created";
      const eventMessage = createEventMessageData({ name: "test-name" }, { action });

      subs.push(otherDataset.watch(action).subscribe(subsErrors));
      subs.push(dataset.watch(action).subscribe(
        (message) => {
          expect(message).toEqual(eventMessage);
          done();
        },
        subsErrors.error,
        subsErrors.complete,
      ));

      setTimeout(() => {
        webSocketMock.onmessage(createEventMessage(eventMessage));
      });
    });

    it("should send a message event to all subscribed observables when the websocket sends an event message for then", (done) => {
      const { dataset, webSocketMock } = createSubject();

      const subsErrors = subscriptionErrors(done);
      const eventMessage = createEventMessageData({ name: "test-name" });

      const combinedObs = dataset.watch().pipe(
        combineLatest(dataset.watch()),
      );

      subs.push(combinedObs.subscribe(
        ([message1, message2]) => {
          expect(message1).toEqual(eventMessage);
          expect(message2).toEqual(eventMessage);
          done();
        },
        subsErrors.error,
        subsErrors.complete,
      ));

      setTimeout(() => {
        webSocketMock.onmessage(createEventMessage(eventMessage));
      });
    });

    it("should send a message event to subscribed observables when the websocket sends an event message even when someone unsubscribed", (done) => {
      const { dataset, webSocketMock } = createSubject();

      const subsErrors = subscriptionErrors(done);
      const eventMessage = createEventMessageData({ name: "test-name" });

      const firstSub = dataset.watch().subscribe(subsErrors);

      subs.push(dataset.watch().subscribe(
        (message) => {
          expect(message).toEqual(eventMessage);
          done();
        },
        subsErrors.error,
        subsErrors.complete,
      ));

      firstSub.unsubscribe();

      setTimeout(() => {
        webSocketMock.onmessage(createEventMessage(eventMessage));
      });
    });

    it("should send a message event to the observable if the websocket sends an event message for a subscribed event with `all` type", (done) => {
      const { dataset, webSocketMock } = createSubject();

      const subsErrors = subscriptionErrors(done);
      const eventMessage = createEventMessageData({ name: "test-name" }, { action: "created" });

      subs.push(dataset.watch("all").subscribe(
        (message) => {
          expect(message).toEqual(eventMessage);
          done();
        },
        subsErrors.error,
        subsErrors.complete,
      ));

      setTimeout(() => {
        webSocketMock.onmessage(createEventMessage(eventMessage));
      });
    });

    it("should not send a message event to the observable if the websocket sends an event message for a not subscribed event", (done) => {
      const { dataset, webSocketMock } = createSubject();
      subs.push(dataset.watch("created").subscribe(subscriptionErrors(done)));
      webSocketMock.onmessage(createEventMessage({ action: "deleted" }));
      setTimeout(() => done(), 10);
    });

    it("should send an unsubscribe command message if the websocket sends an event message for a not subscribed event", () => {
      const { webSocketMock } = createSubject();
      const action: EventSubscriptionType = "deleted";
      webSocketMock.onmessage(createEventMessage({ action }));
      expect(webSocketMock.send).toHaveBeenCalledWith(createUnsubscribeCommandMessage([action]).data);
    });

  });

  describe("when websocket receives notification event to replace the JWT", () => {

    it("should request the new token from the start function", () => {
      const { getToken, webSocketMock } = createSubject();
      webSocketMock.onmessage(createNotificationMessage());
      expect(getToken).toHaveBeenCalledWith();
    });

    it("should send a jwt replace command message with the new token from start function promise", (done) => {
      const { webSocketMock } = createSubject();
      webSocketMock.onmessage(createNotificationMessage());
      setTimeout(() => {
        expect(webSocketMock.send).toHaveBeenCalledWith(JSON.stringify(createJwtRefreshCommandMessage()));
        done();
      });
    });

  });

});
