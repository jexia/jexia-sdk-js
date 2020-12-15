import { Observer } from "rxjs";
import { MESSAGE } from "../../config";
import { deferPromise } from "../../internal/utils";
import { ResourceType } from "../core/resource";
import {
  CommandError,
  EventSubscriptionType,
  IWebSocket,
  PublishArgument,
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
export const wsReadyDefer = deferPromise();

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
type IGetToken = () => Promise<string>;

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
        const request = response.request;
        const callback = responseStack.get(JSON.stringify(request));
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
 * @internal
 */
export function subscribeEventMessage(
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
export function unsubscribeEventMessage(
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
  commandArgument: SubscriptionArgument | PublishArgument,
): RealTimeCommand {
  return {
    command,
    arguments: commandArgument,
  };
}

/**
 * @internal
 */
export function realTimeCommand(webSocket: IWebSocket, data: RealTimeCommand): Promise<RealTimeCommandResponse> {
  return new Promise<RealTimeCommandResponse>((resolve, reject) => {
    const requestCommand: RealTimeMessage = { type: RealTimeMessageTypes.Command, data };

    responseStack.set(JSON.stringify(requestCommand), ({error, ...response}: RealTimeCommandResponse) => {
      error ? reject(parseError(error)) : resolve(response);
    });

    sendMessage(webSocket, requestCommand);
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

/**
 * Convert Command Error type to the human readable string
 * @internal
 * @param error
 */
function parseError(error: CommandError | Error): string | Error {
  if (error.hasOwnProperty("code")) {
    const { code, info } = error as CommandError;
    return new Error(`Subscription Error: (${code}): ${info}`);
  }
  return error as Error;
}
