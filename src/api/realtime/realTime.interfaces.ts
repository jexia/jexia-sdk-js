// tslint:disable:interface-name

/**
 * WebSocket states from `readyState`
 */
import { ResourceType } from "../core/resource";

export enum WebSocketState {
  CONNECTING = 0,
  OPEN = 1,
  CLOSING = 2,
  CLOSED = 3,
}

/**
 * Minimal required WebSocket interface to use the real time module
 */
export interface IWebSocket {
  /**
   * `readyState` from WebSocket
   */
  readyState: number;
  /**
   * `onclose` from WebSocket
   */
  onclose: ((ev: any) => any) | null;
  /**
   * `onerror` from WebSocket
   */
  onerror: ((ev: any) => any) | null;
  /**
   * `onmessage` from WebSocket
   */
  onmessage: ((ev: any) => any) | null;
  /**
   * `onopen` from WebSocket
   */
  onopen: ((ev: any) => any) | null;
  /**
   * `close` from WebSocket
   */
  close(): void;
  /**
   * `send` from WebSocket
   */
  send(data: string): void;
}

/**
 * Builder function for the WebSocket object
 */
export interface IWebSocketBuilder {
  /**
   * @param appUrl Url of your Jexia project
   * @returns Minimal required WebSocket interface to use the real time module
   */
  (appUrl: string): IWebSocket;
}

/**
 * Real time message contract
 */
export interface RealTimeMessage<T = any> {
  /**
   * Type of real time message
   */
  type: RealTimeMessageTypes;
  /**
   * Message data (payload), actual content depending on the type
   */
  data: RealTimeEventMessage<T> | RealTimeCommand | RealTimeCommandResponse | RealTimeNotification;
}

/**
 * Type of real time message
 */
export enum RealTimeMessageTypes {
  Command = "command",
  CommandResponse = "command response",
  EventMessage = "event",
  Notification = "notification",
}

/**
 * Real time event message contract
 */
export interface RealTimeEventMessage<T = any> {
  /**
   * Dispatched event subscription type
   */
  action: EventSubscriptionType;
  /**
   * Resource of this event message
   */
  resource: Resource;
  /**
   * Who modified the resource
   */
  modifier: Modifier;
  /**
   * Exact timestamp of the event
   */
  timestamp: string;
  /**
   * Event data, interface depends on configuration and resource
   */
  data: T;
}

/**
 * Real time command contract
 */
export interface RealTimeCommand {
  /**
   * Type of the command
   */
  command: RealTimeCommandTypes;
  /**
   * Arguments of the command
   */
  arguments: SubscriptionArgument | JwtRefreshArgument | PublishArgument;
}

/**
 * Type of real time commands
 */
export enum RealTimeCommandTypes {
  Subscribe = "subscribe",
  UnSubscribe = "unsubscribe",
  JwtRefresh = "jwt replace",
  Publish = "publish",
}

/**
 * Real time response command contract
 */
export interface RealTimeCommandResponse {
  /**
   * Copy of the request message
   */
  request: any;
  /**
   * Response data, if available
   */
  response?: any;
  /**
   * When the command failed, this object contains the error information
   */
  error?: CommandError;
}

/**
 * Command error contract
 */
export interface CommandError {
  /**
   * Command error code
   */
  code: CommandErrorCodes;
  /**
   * Human readable information about the error
   */
  info: string;
}

/**
 * Notification message contract
 */
export interface RealTimeNotification {
  /**
   * Notification code
   */
  code: NotificationCodes;
  /**
   * Human readable information about the notification
   */
  info: string;
  /**
   * Notification data, if available
   */
  data?: any;
}

/**
 * Notification message codes
 */
export enum NotificationCodes {
  TokenAboutToExpire = "1",
}

/**
 * Subscription command argument contract
 */
export interface SubscriptionArgument {
  /**
   * Event os events types to be subscribed
   */
  action: EventSubscriptionType[];
  /**
   * Resource to subscribe
   */
  resource: Resource;
}

/**
 * Publish to the channel argument contract
 */
export interface PublishArgument {
  /**
   * Channel name
   */
  channel: string;
  /**
   * Message payload (any valid JSON)
   */
  data: any;
}

/**
 * JWT refresh command argument contract
 */
export interface JwtRefreshArgument {
  /**
   * New token to be used from now on
   */
  token: string;
}

/**
 * Resource contract
 */
export interface Resource {
  /**
   * Resource type
   */
  type: ResourceType;
  /**
   * Resource name
   */
  name: string;
}

/**
 * Modifier contract
 */
export interface Modifier {
  /**
   * Type of modifier (entity) that changes the resource, for example apikey
   */
  type: string;
  /**
   * Unique identifier of the modifier
   */
  id: string;
}

/**
 * Possible command error codes
 */
export enum CommandErrorCodes {
  /**
   * Something went wrong in Sharky which is not due to wrong user input
   */
  InternalError = "1",
  /**
   * The client JWT is not allowed to execute the command
   */
  Unauthorized = "2",
  /**
   * The provided token is not valid
   */
  InvalidToken = "3",
  /**
   * The received message could not be decoded
   */
  BadFormatting = "4",
  /**
   * The provided type was not recognized/supported
   */
  UnknownType = "5",
  /**
   * The provided command was not recognized
   */
  UnknownCommand = "6",
  /**
   * The provided resource type was not recognized
   */
  UnknownResourceType = "1000",
  /**
   * The provided resource name does not exists for the given type
   */
  UnknownResourceName = "1001",
  /**
   * 	One of the provided action(s) is not recognized/supported
   */
  UnknownAction = "1002",
}

/**
 * Events types available to subscribe
 * TODO Created different events for channels and sets
 */
export type EventSubscriptionType = "created" | "updated" | "deleted" | "published" | "all";
