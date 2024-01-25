"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bot_sdk_1 = require("@line/bot-sdk");
const api_1 = require("@line/bot-sdk/dist/messaging-api/api");
const express_1 = __importDefault(require("express"));
const ts_dotenv_1 = require("ts-dotenv");
const downloadContent_1 = require("./lib/downloadContent");
const env = (0, ts_dotenv_1.load)({
    CHANNEL_ACCESS_TOKEN: String,
    CHANNEL_SECRET: String,
    PORT: Number,
});
const PORT = env.PORT || 3000;
const config = {
    channelAccessToken: env.CHANNEL_ACCESS_TOKEN || "",
    channelSecret: env.CHANNEL_SECRET || "",
};
const middlewareConfig = config;
const client = new api_1.MessagingApiClient({
    channelAccessToken: env.CHANNEL_ACCESS_TOKEN || "",
});
const clientB = new api_1.MessagingApiBlobClient({
    channelAccessToken: env.CHANNEL_ACCESS_TOKEN || "",
});
const app = (0, express_1.default)();
app.get("/", (_, res) => __awaiter(void 0, void 0, void 0, function* () {
    return res.status(200).send({
        message: "success",
    });
}));
const textEventHandler = (event) => __awaiter(void 0, void 0, void 0, function* () {
    if (event.type !== "message") {
        return;
    }
    const { replyToken, source } = event;
    switch (event.message.type) {
        case "text": {
            const { text } = event.message;
            // if (text.toLowerCase().indexOf("illionillion") > 0) {
            //   const response: ImageMessage = {
            //     type: "image",
            //     originalContentUrl: "https://github-simple-icon-generator.vercel.app/api/?username=illionillion?isCircle=true",
            //     previewImageUrl: "https://github-simple-icon-generator.vercel.app/api/?username=illionillion?isCircle=true"
            //   };
            //   await client.replyMessage({
            //     replyToken: replyToken,
            //     messages: [response],
            //   });
            //   return
            // }
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
            const response = {
                type: "text",
                text: resText,
            };
            yield client.replyMessage({
                replyToken: replyToken,
                messages: [response],
            });
            break;
        }
        case "image": {
            const { id } = event.message;
            yield (0, downloadContent_1.downloadContent)(id, source.userId + "-" + id + ".jpeg", clientB);
            const response = {
                type: "text",
                text: "画像を受け取りました。",
            };
            yield client.replyMessage({
                replyToken: replyToken,
                messages: [response],
            });
            break;
        }
        default:
            break;
    }
});
app.post("/webhook", (0, bot_sdk_1.middleware)(middlewareConfig), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const events = req.body.events;
    yield Promise.all(events.map((event) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield textEventHandler(event);
        }
        catch (err) {
            if (err instanceof Error) {
                console.error(err);
            }
            return res.status(500);
        }
    })));
    return res.status(200);
}));
app.listen(PORT, () => {
    console.log(`http://localhost:${PORT}/`);
});
