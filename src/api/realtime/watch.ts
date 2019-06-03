import { Observable } from "rxjs/internal/Observable";
import { Observer } from "rxjs/internal/types";
import { MESSAGE } from "../../config";
import { deferPromise } from "../../internal/utils";
import { IResource, ResourceType } from "../core/resource";
import {
  CommandError,
  EventSubscriptionType,
  IWebSocket,
  RealTimeCommand,
  RealTimeCommandResponse,
  RealTimeCommandTypes,
  RealTimeEventMessage,
  RealTimeMessage,
  RealTimeMessageTypes,
  SubscriptionArgument,
} from "./realTime.interfaces";

/**
 * @internal
 */
const wsReadyDefer = deferPromise();

/**
 * @internal
 */
const responseStack = new Map<string, (response: RealTimeCommandResponse) => void>();

/**
 * @internal
 */
const messageSubscriptions = new Map<string, Array<Observer<RealTimeEventMessage>>>();

/**
 * @internal
 */
export const allEvents: ReadonlyArray<EventSubscriptionType> =
  Object.freeze(["created", "updated", "deleted"] as EventSubscriptionType[]);

/**
 * @internal
 */
interface IGetToken {
  (): Promise<string>;
}

/**
 * @internal
 */
export function start(webSocket: IWebSocket, getToken: IGetToken) {

  webSocket.onmessage = (message: { data: string }): void => {
    let realTimeMessage: RealTimeMessage;
    try {
      realTimeMessage = JSON.parse(message.data);
    } catch (_) {
      throw new Error(MESSAGE.RTC.BAD_MESSAGE);
    }
    switch (realTimeMessage.type) {
      case RealTimeMessageTypes.CommandResponse:
        const response = realTimeMessage.data as RealTimeCommandResponse;
        const request = response.request.data;
        const callback = responseStack.get(request);
        if (callback) {
          responseStack.delete(request);
          callback(response);
        }
        break;
      case RealTimeMessageTypes.EventMessage:
        const eventMessage = realTimeMessage.data as RealTimeEventMessage;
        const { action, resource: { name, type } } = eventMessage;
        const subscriptionKey = buildSubscriptionArgument([action], name, type);
        const observers = messageSubscriptions.get(JSON.stringify(subscriptionKey));
        if (observers) {
          observers.forEach((o) => o.next(eventMessage));
        } else {
          unsubscribeEventMessage(webSocket, [action], name, type);
        }
        break;
      default:
        // JWT Refresh
        getToken().then((token) => realTimeCommand(webSocket, {
          command: RealTimeCommandTypes.JwtRefresh,
          arguments: { token },
        }));
    }
  };

  wsReadyDefer.resolve();
}

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

/**
 * @internal
 */
function subscribeEventMessage(
  webSocket: IWebSocket,
  events: EventSubscriptionType[],
  setName: string,
  setType: ResourceType,
  observer: Observer<RealTimeEventMessage>,
): Promise<RealTimeCommandResponse | void> {
  let subscriptionEvents = events.includes("all") ? [...allEvents] : events;
  subscriptionEvents = subscriptionEvents.filter((action) => {
    const subscriptionKey = JSON.stringify(buildSubscriptionArgument([action], setName, setType));
    const observers = messageSubscriptions.get(subscriptionKey);
    if (observers) {
      messageSubscriptions.set(subscriptionKey, [...observers, observer]);
      return false;
    } else {
      messageSubscriptions.set(subscriptionKey, [observer]);
      return true;
    }
  });

  if (!subscriptionEvents.length) {
    return Promise.resolve();
  }

  if (allEvents.every((e) => subscriptionEvents.includes(e))) {
    subscriptionEvents = ["all"];
  }

  // Send subscription command for all events at once
  return realTimeCommand(
    webSocket,
    buildSubscriptionCommand(
      RealTimeCommandTypes.Subscribe,
      buildSubscriptionArgument(subscriptionEvents, setName, setType),
    ),
  );
}

/**
 * @internal
 */
function unsubscribeEventMessage(
  webSocket: IWebSocket,
  events: EventSubscriptionType[],
  setName: string,
  setType: ResourceType,
  observer?: Observer<RealTimeEventMessage>,
): Promise<RealTimeCommandResponse | void> {
  let unsubscribeEvents = events;

  if (observer) {
    const subscriptionEvents = events.includes("all") ? allEvents : events;
    unsubscribeEvents = subscriptionEvents.filter((action) => {
      const subscriptionKey = JSON.stringify(buildSubscriptionArgument([action], setName, setType));
      const observers = (messageSubscriptions.get(subscriptionKey) || []).filter((o) => o !== observer);
      if (observers.length) {
        messageSubscriptions.set(subscriptionKey, observers);
        return false;
      } else {
        messageSubscriptions.delete(subscriptionKey);
        return true;
      }
    });

    if (!unsubscribeEvents.length) {
      return Promise.resolve();
    }

    if (allEvents.every((e) => unsubscribeEvents.includes(e))) {
      unsubscribeEvents = ["all"];
    }
  }

  return realTimeCommand(
    webSocket,
    buildSubscriptionCommand(
      RealTimeCommandTypes.UnSubscribe,
      buildSubscriptionArgument(unsubscribeEvents, setName, setType),
    ),
  );
}

/**
 * @internal
 */
function buildSubscriptionArgument(
  action: EventSubscriptionType[],
  name: string,
  type: ResourceType,
): SubscriptionArgument {
  return {
    action,
    resource: {
      type,
      name,
    },
  };
}

/**
 * @internal
 */
function buildSubscriptionCommand(
  command: RealTimeCommandTypes,
  subscriptionArgument: SubscriptionArgument,
): RealTimeCommand {
  return {
    command,
    arguments: subscriptionArgument,
  };
}

/**
 * @internal
 */
function realTimeCommand(webSocket: IWebSocket, data: RealTimeCommand): Promise<RealTimeCommandResponse> {
  return (new Promise<RealTimeCommandResponse>((resolve, reject) => {
    const requestCommand: RealTimeMessage = { type: RealTimeMessageTypes.Command, data };

    responseStack.set(JSON.stringify(requestCommand), ({error, ...response}: RealTimeCommandResponse) => {
      error ? reject(error) : resolve(response);
    });

    sendMessage(webSocket, requestCommand);
  }))
  .catch((error: CommandError | Error) => {
    if (error.hasOwnProperty("code")) {
      const { code, info } = error as CommandError;
      throw new Error(`Subscription Error: (${code}): ${info}`);
    }
    throw error;
  });
}

/**
 * @internal
 */
function sendMessage(webSocket: IWebSocket, message: RealTimeMessage) {
  try {
    webSocket.send(JSON.stringify(message));
  } catch (error) {
    if (error.message === MESSAGE.RTC.NOT_OPEN_ERROR) {
      throw new Error(MESSAGE.RTC.NOT_OPEN_MESSAGE);
    }
    throw new Error(error);
  }
}
