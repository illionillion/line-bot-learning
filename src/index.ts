import {
  middleware,
  MiddlewareConfig,
  WebhookEvent,
  TextMessage,
  MessageAPIResponseBase,
} from "@line/bot-sdk";
import {
  MessagingApiClient,
  MessagingApiBlobClient,
  ImageMessage,
} from "@line/bot-sdk/dist/messaging-api/api";
import express, { Application, Request, Response } from "express";
import { load } from "ts-dotenv";
import { downloadContent } from "./lib/downloadContent";
import axios from "axios";

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
const middlewareConfig: MiddlewareConfig = config;
const client = new MessagingApiClient({
  channelAccessToken: env.CHANNEL_ACCESS_TOKEN || "",
});
const clientB = new MessagingApiBlobClient({
  channelAccessToken: env.CHANNEL_ACCESS_TOKEN || "",
});

const app: Application = express();

app.get("/", async (_: Request, res: Response): Promise<Response> => {
  return res.status(200).send({
    message: "success",
  });
});

const textEventHandler = async (
  event: WebhookEvent
): Promise<MessageAPIResponseBase | undefined> => {
  if (event.type !== "message") {
    return;
  }

  const { replyToken, source } = event;

  switch (event.message.type) {
    case "text": {
      const { text } = event.message;

      // 「github」があるか確認
      if (text.toLowerCase().indexOf("github:") > -1) {
        const username = text.split(":").pop();
        try {
          const github = await axios({
            url: `https://api.github.com/users/${username?.trim()}`,
            method: "GET",
          });

          if (!Object.keys(github.data).includes("avatar_url")) {
            return;
          }
          const response: ImageMessage = {
            type: "image",
            originalContentUrl: github.data.avatar_url,
            previewImageUrl: github.data.avatar_url,
          };
          await client.replyMessage({
            replyToken: replyToken,
            messages: [response],
          });
          return;
        } catch (error) {
          console.error("error: ", error);
          const response: TextMessage = {
            type: "text",
            text: "画像の取得に失敗しました。",
          };
          await client.replyMessage({
            replyToken: replyToken,
            messages: [response],
          });
          return;
        }
      }

      const resText = (() => {
        switch (Math.floor(Math.random() * 3)) {
          case 0:
            return text.split("").reverse().join("");
          case 1:
            return text.split("").join(" ");
          default:
            return text.split("").reverse().join(" ");
        }
      })();

      const response: TextMessage = {
        type: "text",
        text: resText,
      };
      await client.replyMessage({
        replyToken: replyToken,
        messages: [response],
      });
      break;
    }
    case "image": {
      const { id } = event.message;

      await downloadContent(id, source.userId + "-" + id + ".jpeg", clientB);
      const response: TextMessage = {
        type: "text",
        text: "画像を受け取りました。",
      };
      await client.replyMessage({
        replyToken: replyToken,
        messages: [response],
      });
      break;
    }
    default:
      break;
  }
};

app.post(
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
  console.log(`http://localhost:${PORT}/`);
});
