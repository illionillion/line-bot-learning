import {
  ClientConfig,
  middleware,
  MiddlewareConfig,
  WebhookEvent,
  TextMessage,
  MessageAPIResponseBase,
} from "@line/bot-sdk";
import { MessagingApiClient } from "@line/bot-sdk/dist/messaging-api/api";
import express, { Application, Request, Response } from "express";
import { load } from "ts-dotenv";
const env = load({
  CHANNEL_ACCESS_TOKEN: String,
  CHANNEL_SECRET: String,
  PORT: Number,
});

const PORT = env.PORT || 3000;

const config = {
  channelAccessToken: env.CHANNEL_ACCESS_TOKEN || "",
  channelSecret: env.CHANNEL_SECRET || "",
};
const clientConfig: ClientConfig = config;
const middlewareConfig: MiddlewareConfig = config;
const client = new MessagingApiClient(clientConfig); //①

const app: Application = express(); //②

app.get("/", async (_: Request, res: Response): Promise<Response> => {
  //③
  return res.status(200).send({
    message: "success",
  });
});

const textEventHandler = async (
  //④
  event: WebhookEvent
): Promise<MessageAPIResponseBase | undefined> => {
  if (event.type !== "message" || event.message.type !== "text") {
    return;
  }

  const { replyToken } = event;
  const { text } = event.message;
  console.log(text);

  const response: TextMessage = {
    type: "text",
    text: text,
  };
  await client.replyMessage({ replyToken: replyToken, messages: [response] });
};

app.post(
  //⑤
  "/webhook",
  middleware(middlewareConfig),
  async (req: Request, res: Response): Promise<Response> => {
    const events: WebhookEvent[] = req.body.events;
    await Promise.all(
      events.map(async (event: WebhookEvent) => {
        try {
          await textEventHandler(event);
        } catch (err: unknown) {
          if (err instanceof Error) {
            console.error(err);
          }
          return res.status(500);
        }
      })
    );
    return res.status(200);
  }
);

app.listen(PORT, () => {
  //⑥
  console.log(`http://localhost:${PORT}/`);
});
