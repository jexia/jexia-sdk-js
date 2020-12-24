import { Injectable } from "injection-js";

type FunctionEvents = () => void;

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
  public on(eventName: string, key: string, listener: FunctionEvents) {
    const listeners = this.events.get(eventName) || new Map<string, FunctionEvents>();

    listeners.set(key, listener);

    this.events.set(eventName, listeners);
  }

  /**
   * Unsubscribe from an event
   *
   * @param {string} eventName the name of the event to listen
   * @param {string} key The name/key to assign the listener
   */
  public off(eventName: string, key: string) {
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
  public emit(eventName: string, ...data: any) {
    const listeners = this.events.get(eventName);

    if (!listeners) {
      return;
    }

    listeners.forEach(callback => callback.apply(data));
  }
}
