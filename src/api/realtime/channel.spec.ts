import * as faker from "faker";
import {
  createPublishMessage,
  createSubscribeCommandMessage,
  createUnsubscribeCommandMessage
} from "../../../spec/rtcHelpers";
import { createMockFor } from "../../../spec/testUtils";
import { RequestExecuter } from "../../internal/executer";
import { Query } from "../../internal/query";
import { RequestMethod } from "../../internal/requestAdapter.interfaces";
import { ResourceType } from "../core/resource";
import { Channel } from "./channel";
import * as websocket from "./websocket";

function createSubject({
  injectorMock = createMockFor(["get"]) as any,
  websocketMock = createMockFor(WebSocket) as any,
  name = faker.random.word(),
  requestExecuterMock = createMockFor(RequestExecuter, { returnValue: Promise.resolve() })
} = {}) {
  injectorMock.get.mockImplementation(() => requestExecuterMock);
  websocket.start(websocketMock, () => Promise.resolve("token"));

  const subject = new Channel(injectorMock, () => websocketMock, name);

  return {
    subject,
    injectorMock,
    websocketMock,
    name,
    requestExecuterMock
  };
}

describe("Channel", () => {
  describe("on creating", () => {
    it("should not send anything to the websocket", (done) => {
      const { websocketMock } = createSubject();
      setTimeout(() => {
        expect(websocketMock.send).not.toHaveBeenCalled();
        done();
      });
    });
  });

  describe("on subscribing", () => {
    it("should send subscribe event message to the websocket", (done) => {
      const { subject, websocketMock } = createSubject();
      subject.subscribe();
      setTimeout(() => {
        expect(websocketMock.send).toHaveBeenCalledWith(
          JSON.stringify(createSubscribeCommandMessage(["published"], subject.name, ResourceType.Channel).data)
        );
        done();
      });
    });

    describe("if subscription returns an error", () => {
      it("should call an observable error handler", (done) => {
        const { subject, websocketMock } = createSubject();
        const socketError = "some error from the socket";
        websocketMock.send.mockImplementationOnce(() => {
          throw socketError;
        });
        subject.subscribe({
          next: () => done.fail("should not emit any value"),
          error: (error) => {
            expect(error).toEqual(new Error(socketError));
            done();
          },
          complete: () => done.fail("should not complete")
        });
      });
    });
  });

  describe("on unsubscribing", () => {
    it("should send unsubscribe event message to the websocket", (done) => {
      const { subject, websocketMock } = createSubject();
      const subscription = subject.subscribe();
      subscription.unsubscribe();
      setTimeout(() => {
        expect(websocketMock.send).toHaveBeenCalledWith(
          JSON.stringify(createUnsubscribeCommandMessage(["published"], subject.name, ResourceType.Channel).data)
        );
        done();
      });
    });

    it("should suppress any error from data layer" , (done) => {
      const { subject, websocketMock } = createSubject();
      const subscription = subject.subscribe();

      setTimeout(() => {
        const socketError = "some error from the socket";
        websocketMock.send.mockImplementationOnce(() => {
          throw socketError;
        });
        subscription.unsubscribe();
        setTimeout(done);
      });
    });
  });

  describe("on publish", () => {
    it("should send publish command to the websocket", (done) => {
      const { subject, websocketMock } = createSubject();
      const message = faker.lorem.sentence();
      let correlationId: string;
      websocketMock.send.mockImplementationOnce((command: string) => {
        correlationId = JSON.parse(command).data.correlation_id;
      });
      subject.publish(message);
      setTimeout(() => {
        expect(websocketMock.send).toHaveBeenCalledWith(
          JSON.stringify(createPublishMessage(subject.name, message, correlationId))
        );
        done();
      });
    });
  });

  describe("on getting message history", () => {
    it("should make a rest request", () => {
      const { subject, requestExecuterMock } = createSubject();
      subject.getLog();
      expect(requestExecuterMock.executeRequest).toHaveBeenCalledWith({
        resourceType: ResourceType.Channel,
        resourceName: subject.name,
        method: RequestMethod.GET,
        body: {},
        queryParams: []
      });
    });

    it("should add filtering options to the request if they are present", () => {
      const { subject, requestExecuterMock } = createSubject();
      const filter = (field: any) => field("any").isEqualTo("something");
      const query = new Query();
      query.setFilterCriteria(filter);
      subject.getLog(filter);
      expect(requestExecuterMock.executeRequest).toHaveBeenCalledWith({
        resourceType: ResourceType.Channel,
        resourceName: subject.name,
        method: RequestMethod.GET,
        body: {},
        queryParams: query.compileToQueryParams()
      });
    });
  });
});
