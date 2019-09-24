import * as faker from "faker";
import { Subscription } from "rxjs";
import { Channel, RealTimeEventMessage } from "../../../src/api/realtime/public-api";
import { RTCChannelMessageSchema } from "../../lib/rtc";
import { getRandomList } from "../../lib/utils";
import { cleaning, initWithChannel, management, rtm } from "../../teardowns";

// tslint:disable-next-line:no-var-requires
const joiAssert = require("joi-assert");

jest.setTimeout(15000);

const channelName = "my_channel";

describe("Real Time Channels Communication", () => {
  beforeAll(async () => initWithChannel(channelName));
  afterAll(async () => cleaning());

  describe("subscribe to the channel", () => {
    let channel: Channel;
    let subscription: Subscription;
    let receivedMessage: RealTimeEventMessage;
    const payload = {
      n: faker.random.number(),
      b: faker.random.boolean(),
      s: faker.random.word()
    };
    beforeAll(() => channel = rtm.channel(channelName));
    afterAll(() => subscription && subscription.unsubscribe());

    it("should create a channel object", () => {
      expect(channel).toBeDefined();
    });

    it("should receive correct message format from the channel", (done) => {
      subscription = channel.subscribe((message) => {
        receivedMessage = message;
        joiAssert(receivedMessage, RTCChannelMessageSchema);
        done();
      });

      channel.publish(payload);
    });

    it("should receive published payload", () => {
      expect(receivedMessage.data).toEqual(payload);
    });
  });

  describe("send messages", () => {
    let channel: Channel;
    beforeAll(() => channel = rtm.channel(channelName));

    it("should receive all sent messages in the same order", (done) => {
      const messages = getRandomList<string>({ length: 100, callback: () => faker.lorem.sentence() });
      const receivedMessages: string[] = [];
      const subscription = channel.subscribe((message) => {
        receivedMessages.push(message.data);
        if (receivedMessages.length === messages.length) {
          expect(receivedMessages).toEqual(messages);
          subscription.unsubscribe();
          done();
        }
      });

      messages.forEach((m) => setTimeout(() => channel.publish(m), 10));
    });
  });

  describe("errors", () => {
    let channelWithoutPolicy: { id: string; name: string };
    beforeAll(async () => {
      channelWithoutPolicy = await management.createChannel("channel_with_no_policy");
    });

    afterAll(async () => {
      await management.deleteChannel(channelWithoutPolicy.id);
    });

    it("should receive correct error if there is no such channel", (done) => {
      const nonexistentChannel = faker.random.word();
      const expectedError = new Error(
        `Subscription Error: (1001): resource "${nonexistentChannel}" is unavailable`);
      rtm.channel(nonexistentChannel).subscribe(
        (result) => done(result),
        (error) => {
          expect(error).toEqual(expectedError);
          done();
        },
        () => done("error has not been received")
      );
    });

    it("should receive correct error if there is no policy", (done) => {
      const expectedError = new Error(
        `Subscription Error: (2): none of the given actions ["published"] for this resource are allowed`);
      rtm.channel("channel_with_no_policy").subscribe(
        (result) => done(result),
        (error) => {
          expect(error).toEqual(expectedError);
          done();
        },
        () => done("error has not been received")
      );
    });
  });
});
