import { Observable } from "rxjs/internal/Observable";
import { Observer } from "rxjs/internal/types";
import { MESSAGE } from "../../config/message";
import { Dataset } from "../dataops/dataset";
import {
  CommandError,
  EventSubscriptionType,
  RealTimeCommand,
  RealTimeCommandResponse,
  RealTimeCommandTypes,
  RealTimeEventMessage,
  RealTimeMessage,
  RealTimeMessageTypes,
  ResourceType,
  SubscriptionArgument,
} from "./realTime.interfaces";

/**
 * @internal
 */
declare module "jexia-sdk-js/api/dataops/dataset" {
  // tslint:disable-next-line:interface-name
  interface Dataset<T> {
    webSocket: WebSocket;
    watch: typeof watch;
  }
}

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
export function start(webSocket: WebSocket, getToken: IGetToken) {
  Dataset.prototype.webSocket = webSocket;
  Dataset.prototype.watch = watch;

  webSocket.onmessage = (message: MessageEvent): void => {
    switch (message.type as RealTimeMessageTypes) {
      case RealTimeMessageTypes.CommandResponse:
        const response: RealTimeCommandResponse = JSON.parse(message.data);
        const request = JSON.stringify(response.request);
        const callback = responseStack.get(request);
        if (callback) {
          responseStack.delete(request);
          callback(response);
        }
        break;
      case RealTimeMessageTypes.EventMessage:
        const eventMessage: RealTimeEventMessage = JSON.parse(message.data);
        const { action, resource: { name } } = eventMessage;
        const subscriptionKey = buildSubscriptionArgument([action], name);
        const observers = messageSubscriptions.get(JSON.stringify(subscriptionKey));
        if (observers) {
          observers.forEach((o) => o.next(eventMessage));
        } else {
          unsubscribeEventMessage(webSocket, [action], name);
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
}

/**
 * Watches events from dataset
 *
 * @template T Generic type of your dataset, default to any
 * @param {Dataset<T>} this Dataset object context
 * @param eventType events to listen
 * @param others events to listen
 * @returns {Observable<RealTimeEventMessage<T>>} Observable with all subscribed events
 */
function watch<T>(
  this: Dataset<T>,
  eventType: EventSubscriptionType | EventSubscriptionType[] = "all",
  ...others: EventSubscriptionType[],
): Observable<RealTimeEventMessage<T>> {
  // creating a unified array and removing duplicated event types
  const events = Array.from(new Set((Array.isArray(eventType) ? eventType : [eventType]).concat(others)));

  if (!events.every((e) => allEvents.includes(e) || e === "all")) {
    throw new Error(MESSAGE.RTC.BAD_EVENT_SUBSCRIPTION_TYPE);
  }

  return Observable.create((observer: Observer<RealTimeEventMessage<T>>) => {

    subscribeEventMessage(this.webSocket, events, this.name, observer)
      .catch((error) => observer.error(error));

    return () => unsubscribeEventMessage(this.webSocket, events, this.name, observer);
  });
}

/**
 * @internal
 */
function subscribeEventMessage(
  webSocket: WebSocket,
  events: EventSubscriptionType[],
  datasetName: string,
  observer: Observer<RealTimeEventMessage>,
): Promise<RealTimeCommandResponse | void> {
  let subscriptionEvents = events.includes("all") ? [...allEvents] : events;
  subscriptionEvents = subscriptionEvents.filter((action) => {
    const subscriptionKey = JSON.stringify(buildSubscriptionArgument([action], datasetName));
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
      buildSubscriptionArgument(subscriptionEvents, datasetName),
    ),
  );
}

/**
 * @internal
 */
function unsubscribeEventMessage(
  webSocket: WebSocket,
  events: EventSubscriptionType[],
  datasetName: string,
  observer?: Observer<RealTimeEventMessage>,
): Promise<RealTimeCommandResponse | void> {
  let unsubscribeEvents = events;

  if (observer) {
    const subscriptionEvents = events.includes("all") ? allEvents : events;
    unsubscribeEvents = subscriptionEvents.filter((action) => {
      const subscriptionKey = JSON.stringify(buildSubscriptionArgument([action], datasetName));
      const observers = messageSubscriptions.get(subscriptionKey)!.filter((o) => o !== observer);
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
      buildSubscriptionArgument(unsubscribeEvents, datasetName),
    ),
  );
}

/**
 * @internal
 */
function buildSubscriptionArgument(
  action: EventSubscriptionType[],
  datasetName: string,
): SubscriptionArgument {
  return {
    action,
    resource: {
      type: ResourceType.Dataset,
      name: datasetName,
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
function realTimeCommand(webSocket: WebSocket, data: RealTimeCommand): Promise<RealTimeCommandResponse> {
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
function sendMessage(webSocket: WebSocket, message: RealTimeMessage) {
  try {
    webSocket.send(JSON.stringify(message));
  } catch (error) {
    if (error.message === MESSAGE.RTC.NOT_OPEN_ERROR) {
      throw new Error(MESSAGE.RTC.NOT_OPEN_MESSAGE);
    }
    throw new Error(error);
  }
}
