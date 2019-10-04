import { ReflectiveInjector } from "injection-js";
import { from, Observable } from "rxjs";
import { RequestExecuter } from "../../internal/executer";
import { Query } from "../../internal/query";
import { RequestMethod } from "../../internal/requestAdapter.interfaces";
import { IFilteringCriterion, IFilteringCriterionCallback } from "../core/filteringApi";
import { ResourceType } from "../core/resource";
import {
  IWebSocket,
  RealTimeCommandResponse,
  RealTimeCommandTypes,
  RealTimeEventMessage,
  RealTimeStoredMessage
} from "./realTime.interfaces";
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
   * @param injector
   * @param websocketFactory
   * @param name
   */
  constructor(
    readonly injector: ReflectiveInjector,
    readonly websocketFactory: () => IWebSocket,
    readonly name: string
  ) {
    super((observer) => {
      wsReadyDefer.promise
        .then(() => subscribeEventMessage(
          this.websocketFactory(), ["published"], name, ResourceType.Channel, observer)
        )
        .catch((error: any) => observer.error(error));

      return () => wsReadyDefer.promise
        .then(() => unsubscribeEventMessage(
          this.websocketFactory(), ["published"], name, ResourceType.Channel, observer
        )
        .catch(() => undefined)
      );
    });
  }

  /**
   * Send a message to the channel
   * @param {any} data
   */
  public publish(data: any): Observable<RealTimeCommandResponse> {
    return from(
      wsReadyDefer.promise.then(() => {
        return realTimeCommand(this.websocketFactory(), {
          command: RealTimeCommandTypes.Publish,
          arguments: { channel: this.name, data },
          correlation_id: Math.random().toString(),
        });
      })
    );
  }

  /**
   * Load channel messaging history
   * @param {IFilteringCriterion | IFilteringCriterionCallback } filter filtering condition
   *
   * @example
   *   rtm.channel("my_channel").getLog(); // returns an observable of full channel history
   *
   *   // filtering messages
   *   rtm.channel("my_channel").getLog(field => field("sender_id").isEqualTo(user.id)); // messages from certain user
   */
  public getLog(filter?: IFilteringCriterion<T> | IFilteringCriterionCallback<T>): Observable<RealTimeStoredMessage[]> {
    const query = new Query<T>();

    if (filter) {
      query.setFilterCriteria(filter);
    }

    const requestExecutor = this.injector.get(RequestExecuter);

    return from(requestExecutor.executeRequest({
      resourceType: ResourceType.Channel,
      resourceName: this.name,
      method: RequestMethod.GET,
      body: {},
      queryParams: query.compileToQueryParams()
    }) as Promise<RealTimeStoredMessage[]>);
  }
}
