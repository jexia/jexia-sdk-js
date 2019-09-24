import { Observable } from "rxjs/internal/Observable";
import { Observer } from "rxjs/internal/types";
import { MESSAGE } from "../../config";
import { IResource } from "../core/resource";
import { EventSubscriptionType, IWebSocket, RealTimeEventMessage } from "./realTime.interfaces";
import { allEvents, subscribeEventMessage, unsubscribeEventMessage, wsReadyDefer } from "./websocket";

/**
 * Watches events from dataset
 *
 * @template T Generic type of your dataset, default to any
 * @param eventType events to listen
 * @param others events to listen
 * @returns {Observable<RealTimeEventMessage<T>>} Observable with all subscribed events
 */
export function watch<T extends object = any>(
  this: IResource & { webSocket: IWebSocket },
  eventType: EventSubscriptionType | EventSubscriptionType[] = "all",
  ...others: EventSubscriptionType[]
): Observable<RealTimeEventMessage<T>> {
  // creating a unified array and removing duplicated event types
  const events = Array.from(new Set((Array.isArray(eventType) ? eventType : [eventType]).concat(others)));

  if (!events.every((e) => allEvents.includes(e) || e === "all")) {
    throw new Error(MESSAGE.RTC.BAD_EVENT_SUBSCRIPTION_TYPE);
  }

  return Observable.create((observer: Observer<RealTimeEventMessage<T>>) => {

    /* Wait until websocket be ready */
    wsReadyDefer.promise.then(() => {
      subscribeEventMessage(this.webSocket, events, this.name, this.resourceType, observer)
        .catch((error) => observer.error(error));
    });

    return () => wsReadyDefer.promise
      .then(() => unsubscribeEventMessage(this.webSocket, events, this.name, this.resourceType, observer));
  });
}
