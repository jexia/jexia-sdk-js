import { Observable } from "rxjs";
import { fromPromise } from "rxjs/internal-compatibility";
import { ResourceType } from "../core/resource";
import { IWebSocket, RealTimeCommandResponse, RealTimeCommandTypes, RealTimeEventMessage } from "./realTime.interfaces";
import { realTimeCommand, subscribeEventMessage, unsubscribeEventMessage, wsReadyDefer } from "./websocket";

/**
 * Channel object is basically an observable which emits
 * every single event received from the according channel to its subscribers.
 *
 * Should never be instantiated itself yet obtained from RealTime module instead.
 *
 * @example
 *   const channel = rtm.channel("my_channel");
 *
 *   // For the typescript users it is also possible to point out the type of messages
 *   // you expect from the channel:
 *
 *   const channel = rtm.channel<MyData>("my_channel");
 */
export class Channel<T = any> extends Observable<RealTimeEventMessage<T>> {
  /**
   * @internal
   * @param websocket
   * @param name
   */
  constructor(
    readonly websocket: IWebSocket,
    readonly name: string
  ) {
    super((observer) => {
      wsReadyDefer.promise
        .then(() => subscribeEventMessage(
          this.websocket, ["published"], name, ResourceType.Channel, observer)
        )
        .catch((error: any) => observer.error(error));

      return () => wsReadyDefer.promise.then(
        () => unsubscribeEventMessage(
            this.websocket, ["published"], name, ResourceType.Channel, observer
          ).catch(() => undefined)
      );
    });
  }

  /**
   * Send a message to the channel
   * @param {String} data
   */
  public publish(data: any): Observable<RealTimeCommandResponse> {
    return fromPromise(
      wsReadyDefer.promise.then(() => {
        return realTimeCommand(this.websocket, {
          command: RealTimeCommandTypes.Publish,
          arguments: { channel: this.name, data },
        });
      })
    );
  }
}
