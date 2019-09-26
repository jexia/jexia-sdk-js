// tslint:disable:max-line-length
import { Subscription } from "rxjs/internal/Subscription";
import { combineLatest } from "rxjs/operators";
import { EventSubscriptionType } from "src";
import {
  createEventMessage,
  createEventMessageData, createJwtRefreshCommandMessage, createNotificationMessage,
  createResponseCommandMessage,
  createSubscribeCommandMessage, createUnsubscribeCommandMessage,
  subscriptionErrors
} from "../../../spec/rtcHelpers";
import { createMockFor, deepFreeze, SpyObj } from "../../../spec/testUtils";
import { MESSAGE } from "../../config";
import { RequestExecuter } from "../../internal/executer";
import { Dataset } from "../dataops/dataset";
import { CommandError, CommandErrorCodes, } from "./realTime.interfaces";
import * as datasetWatch from "./watch";
import * as websocket from "./websocket";
import { allEvents } from "./websocket";

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

    websocket.start(webSocketMock, getToken);
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
          expect(webSocketMock.send).toHaveBeenCalledWith(
            JSON.stringify(createSubscribeCommandMessage(["all"], dataset.name).data)
          );
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
          expect(webSocketMock.send).toHaveBeenCalledWith(
            JSON.stringify(createSubscribeCommandMessage([events], dataset.name).data)
          );
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
          expect(webSocketMock.send).toHaveBeenCalledWith(
            JSON.stringify(createSubscribeCommandMessage([events], dataset.name).data)
          );
          secondSub.unsubscribe();
          done();
        });
    }));

    it("should send subscription command for multiple dataset events by spread operator", (done) => {
      const { dataset, webSocketMock } = createSubject();
      const events: EventSubscriptionType[] = ["created", "updated"];
      subs.push(dataset.watch(...events).subscribe());
      setTimeout(() => {
        expect(webSocketMock.send).toHaveBeenCalledWith(
          JSON.stringify(createSubscribeCommandMessage(events, dataset.name).data)
        );
        done();
      });
    });

    it("should send subscription command for multiple dataset events by array", (done) => {
      const { dataset, webSocketMock } = createSubject();
      const events: EventSubscriptionType[] = ["created", "updated"];
      subs.push(dataset.watch(events).subscribe());
      setTimeout(() => {
        expect(webSocketMock.send).toHaveBeenCalledWith(
          JSON.stringify(createSubscribeCommandMessage(events, dataset.name).data)
        );
        done();
      });
    });

    it("should send subscribe command just for 'all' if it send all possible events", (done) => {
      const { dataset, webSocketMock } = createSubject();
      subs.push(dataset.watch(...allEvents).subscribe());
      setTimeout(() => {
        expect(webSocketMock.send).toHaveBeenCalledWith(
          JSON.stringify(createSubscribeCommandMessage(["all"], dataset.name).data)
        );
        done();
      });
    });

    it("should clean duplicated events when sending subscription command", (done) => {
      const { dataset, webSocketMock } = createSubject();
      const events: EventSubscriptionType[] = ["created", "updated"];
      subs.push(dataset.watch([...events, ...events]).subscribe());
      setTimeout(() => {
        expect(webSocketMock.send).toHaveBeenCalledWith(
          JSON.stringify(createSubscribeCommandMessage(events, dataset.name).data)
        );
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
          expect(webSocketMock.send).not.toHaveBeenCalledWith(
            JSON.stringify(createSubscribeCommandMessage([action], dataset.name).data)
          );
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
        expect(webSocketMock.send).toHaveBeenCalledWith(
          JSON.stringify(createSubscribeCommandMessage(["deleted"], dataset.name).data)
        );
        expect(webSocketMock.send).toHaveBeenCalledWith(
          JSON.stringify(createSubscribeCommandMessage(["created"], dataset.name).data)
        );
        done();
      });
    });

    it("should send a subscribe command for individual events that there is no others observable watching at the same dataset even when using 'all'", (done) => {
      const { dataset, webSocketMock } = createSubject();
      const action: EventSubscriptionType = "deleted";
      const allOtherEvents = allEvents.filter((e) => e !== action);

      subs.push(dataset.watch(action).subscribe());

      setTimeout(() => {
        webSocketMock.send.mockReset();
        subs.push(dataset.watch("all").subscribe());
        setTimeout(() => {
          expect(webSocketMock.send).not.toHaveBeenCalledWith(
            JSON.stringify(createSubscribeCommandMessage(["deleted"], dataset.name).data)
          );
          expect(webSocketMock.send).toHaveBeenCalledWith(
            JSON.stringify(createSubscribeCommandMessage(allOtherEvents, dataset.name).data)
          );
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
      const { data: request } = createSubscribeCommandMessage(["all"], dataset.name);

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

      webSocketMock.onmessage(createResponseCommandMessage({ request:
          createSubscribeCommandMessage(["all"], dataset.name) }));
      setTimeout(() => done(), 10);
    });

    it("should not explode if the websocket sends command response if there is no one waiting for it", (done) => {
      const { dataset, webSocketMock } = createSubject();
      webSocketMock.onmessage(createResponseCommandMessage({ request:
          createSubscribeCommandMessage(["all"], dataset.name) }));
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
          request: createSubscribeCommandMessage(["all"], otherDatasetName).data,
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
        expect(webSocketMock.send).toHaveBeenCalledWith(
          JSON.stringify(createUnsubscribeCommandMessage(["all"], dataset.name).data)
        );
        done();
      });
    });

    it("should send unsubscribe command for a single dataset event", (done) => {
      const { dataset, webSocketMock } = createSubject();
      const events = "created";
      dataset.watch(events).subscribe().unsubscribe();
      setTimeout(() => {
        expect(webSocketMock.send).toHaveBeenCalledWith(
          JSON.stringify(createUnsubscribeCommandMessage([events], dataset.name).data)
        );
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
        expect(webSocketMock.send).toHaveBeenCalledWith(
          JSON.stringify(createUnsubscribeCommandMessage([events], dataset.name).data)
        );
        done();
      });
    });

    it("should send unsubscribe command for multiple dataset events by spread operator", (done) => {
      const { dataset, webSocketMock } = createSubject();
      const events: EventSubscriptionType[] = ["created", "updated"];
      dataset.watch(...events).subscribe().unsubscribe();
      setTimeout(() => {
        expect(webSocketMock.send).toHaveBeenCalledWith(
          JSON.stringify(createUnsubscribeCommandMessage(events, dataset.name).data)
        );
        done();
      });
    });

    it("should send unsubscribe command for multiple dataset events by array", (done) => {
      const { dataset, webSocketMock } = createSubject();
      const events: EventSubscriptionType[] = ["created", "updated"];
      dataset.watch(events).subscribe().unsubscribe();
      setTimeout(() => {
        expect(webSocketMock.send).toHaveBeenCalledWith(
          JSON.stringify(createUnsubscribeCommandMessage(events, dataset.name).data)
        );
        done();
      });
    });

    it("should send unsubscribe command just for 'all' if it send all possible events", (done) => {
      const { dataset, webSocketMock } = createSubject();
      dataset.watch(...allEvents).subscribe().unsubscribe();
      setTimeout(() => {
        expect(webSocketMock.send).toHaveBeenCalledWith(
          JSON.stringify(createUnsubscribeCommandMessage(["all"], dataset.name).data)
        );
        done();
      });
    });

    it("should clean duplicated events when sending unsubscribe command", (done) => {
      const { dataset, webSocketMock } = createSubject();
      const events: EventSubscriptionType[] = ["created", "updated"];
      dataset.watch([...events, ...events]).subscribe().unsubscribe();
      setTimeout(() => {
        expect(webSocketMock.send).toHaveBeenCalledWith(
          JSON.stringify(createUnsubscribeCommandMessage(events, dataset.name).data)
        );
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
        expect(webSocketMock.send).not.toHaveBeenCalledWith(
          JSON.stringify(createUnsubscribeCommandMessage([action], dataset.name).data)
        );
        done();
      });
    });

    it("should not send an unsubscribe command for events if there is another observable watching another event at the same dataset", (done) => {
      const { dataset, webSocketMock } = createSubject();

      const firstSub = dataset.watch("all").subscribe();
      subs.push(dataset.watch("deleted").subscribe());
      firstSub.unsubscribe();

      setTimeout(() => {
        expect(webSocketMock.send).not.toHaveBeenCalledWith(
          JSON.stringify(createUnsubscribeCommandMessage(["all"], dataset.name).data)
        );
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
        expect(webSocketMock.send).not.toHaveBeenCalledWith(
          JSON.stringify(createUnsubscribeCommandMessage(["deleted"], dataset.name).data)
        );
        done();
      });
    });

    it("should send an unsubscribe command for individual events that there is no others observable watching at the same dataset", (done) => {
      const { dataset, webSocketMock } = createSubject();

      const firstSub = dataset.watch("all").subscribe();
      subs.push(dataset.watch("deleted").subscribe());
      firstSub.unsubscribe();

      setTimeout(() => {
        expect(webSocketMock.send).toHaveBeenCalledWith(
          JSON.stringify(createUnsubscribeCommandMessage(["created", "updated"], dataset.name).data)
        );
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
      const eventMessage = createEventMessageData({ name: "test-name" }, { action }, dataset.name);

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
        webSocketMock.onmessage(createEventMessage(eventMessage, dataset.name));
      });
    });

    it("should send a message event to all subscribed observables when the websocket sends an event message for then", (done) => {
      const { dataset, webSocketMock } = createSubject();

      const subsErrors = subscriptionErrors(done);
      const eventMessage = createEventMessageData({ name: "test-name" }, {}, dataset.name);

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
        webSocketMock.onmessage(createEventMessage(eventMessage, dataset.name));
      });
    });

    it("should send a message event to subscribed observables when the websocket sends an event message even when someone unsubscribed", (done) => {
      const { dataset, webSocketMock } = createSubject();

      const subsErrors = subscriptionErrors(done);
      const eventMessage = createEventMessageData({ name: "test-name" }, {}, dataset.name);

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
        webSocketMock.onmessage(createEventMessage(eventMessage, dataset.name));
      });
    });

    it("should send a message event to the observable if the websocket sends an event message for a subscribed event with `all` type", (done) => {
      const { dataset, webSocketMock } = createSubject();

      const subsErrors = subscriptionErrors(done);
      const eventMessage = createEventMessageData({ name: "test-name" },
        { action: "created" }, dataset.name);

      subs.push(dataset.watch("all").subscribe(
        (message) => {
          expect(message).toEqual(eventMessage);
          done();
        },
        subsErrors.error,
        subsErrors.complete,
      ));

      setTimeout(() => {
        webSocketMock.onmessage(createEventMessage(eventMessage, dataset.name), dataset.name);
      });
    });

    it("should not send a message event to the observable if the websocket sends an event message for a not subscribed event", (done) => {
      const { dataset, webSocketMock } = createSubject();
      subs.push(dataset.watch("created").subscribe(subscriptionErrors(done)));
      webSocketMock.onmessage(createEventMessage({ action: "deleted" }, dataset.name));
      setTimeout(() => done(), 10);
    });

    it("should send an unsubscribe command message if the websocket sends an event message for a not subscribed event", () => {
      const { dataset, webSocketMock } = createSubject();
      const action: EventSubscriptionType = "deleted";
      webSocketMock.onmessage(createEventMessage({ action }, dataset.name));
      expect(webSocketMock.send).toHaveBeenCalledWith(
        JSON.stringify(createUnsubscribeCommandMessage([action], dataset.name).data)
      );
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
        expect(webSocketMock.send).toHaveBeenCalledWith(JSON.stringify(createJwtRefreshCommandMessage(tokenTest)));
        done();
      });
    });

  });

});
