import { Observer } from "rxjs";
import { ResourceType } from "../src/api/core/resource";
import {
  EventSubscriptionType,
  JwtRefreshArgument,
  NotificationCodes,
  RealTimeCommand,
  RealTimeCommandTypes,
  RealTimeEventMessage,
  RealTimeMessage,
  RealTimeMessageTypes
} from "../src/api/realtime/realTime.interfaces";

export function createSubscribeCommandMessage(action: EventSubscriptionType[],
                                              resourceName: string, resourceType = ResourceType.Dataset) {
  return createCommandMessage(RealTimeCommandTypes.Subscribe, action, resourceName, resourceType);
}

export function createUnsubscribeCommandMessage(action: EventSubscriptionType[],
                                                resourceName: string, resourceType = ResourceType.Dataset) {
  return createCommandMessage(RealTimeCommandTypes.UnSubscribe, action, resourceName, resourceType);
}

export function createPublishMessage(channel: string, data: any, correlationId: string) {
  return {
    type: RealTimeMessageTypes.Command,
    data: {
      command: RealTimeCommandTypes.Publish,
      arguments: { channel, data },
      correlation_id: correlationId
    }
  };
}

export function createCommandMessage(command: RealTimeCommandTypes, action: EventSubscriptionType[],
                                     resourceName: string, resourceType = ResourceType.Dataset) {
  return {
    data: {
      type: RealTimeMessageTypes.Command,
      data: {
        command,
        arguments: {
          action,
          resource: {
            type: resourceType,
            name: resourceName,
          },
        },
      }
    }
  };
}

export function createJwtRefreshCommandMessage(token: string): RealTimeMessage {
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

export function createResponseCommandMessage(data: any) {
  return {
    data: JSON.stringify({
        type: RealTimeMessageTypes.CommandResponse, data
      }
    )};
}

export function createNotificationMessage(code = NotificationCodes.TokenAboutToExpire,
                                          info = "some test info", data?: any) {
  return { type: RealTimeMessageTypes.Notification, data: JSON.stringify({
      code,
      info,
      data,
    })};
}

export function createEventMessage(messageOptions: Partial<RealTimeEventMessage>, dataset: string) {
  return {
    data: JSON.stringify({
        type: RealTimeMessageTypes.EventMessage,
        data: createEventMessageData(null, messageOptions, dataset),
      }
    )};
}

export function createEventMessageData(data: any = {}, options: Partial<RealTimeEventMessage>,
                                       dataset: string): RealTimeEventMessage {
  return {
    action: "created",
    resource: {
      name: dataset,
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

export function subscriptionErrors(done: jest.DoneCallback): Observer<any> {
  return {
    next: () => done.fail("should not have an event at this subscription!"),
    error: () => done.fail("should not have an error at this subscription!"),
    complete: () => done.fail("this subscription should not have conclude!"),
  };
}
