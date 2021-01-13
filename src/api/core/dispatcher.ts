import { Injectable } from "injection-js";

// TODO use enum (currently not possible as we extract the values for a new type as union)
export const DispatchEvents = {
  TOKEN_LOGIN: "token:login",
  TOKEN_REFRESH: "token:refresh",
  UMS_LOGIN: "ums:login",
  UMS_SWITCH_USER: "ums:switchUser",
  UMS_LOGOUT: "ums:logout",
} as const;

export type DispatchEventsType = typeof DispatchEvents[keyof typeof DispatchEvents];

export type FunctionEvents = (...args: any[]) => void;

@Injectable()
export class Dispatcher {
  private events = new Map<string, Map<string, FunctionEvents>>();

  /**
   * Subscribe to an event
   *
   * @param {string} eventName the name of the event to listen
   * @param {string} key The name/key to assign the listener
   * @param {FunctionEvents} listener The listener that will execute when called
   */
  public on(eventName: DispatchEventsType, key: string, listener: FunctionEvents) {
    const listeners = this.events.get(eventName) || new Map<DispatchEventsType, FunctionEvents>();

    listeners.set(key, listener);

    this.events.set(eventName, listeners);
  }

  /**
   * Unsubscribe from an event
   *
   * @param {string} eventName the name of the event to listen
   * @param {string} key The name/key to assign the listener
   */
  public off(eventName: DispatchEventsType, key: string) {
    const listeners = this.events.get(eventName);

    if (!listeners) {
      return;
    }

    listeners.delete(key);

    this.events.set(eventName, listeners);
  }

  /**
   * Emit an event
   *
   * @param {string} eventName the name of the event to call
   * @param {any} data The extra data that will be send to the listener
   */
  public emit(eventName: DispatchEventsType, ...data: any) {
    const listeners = this.events.get(eventName);

    if (!listeners) {
      return;
    }

    listeners.forEach(callback => callback.apply(data));
  }
}
