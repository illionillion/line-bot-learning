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
const cors_1 = __importDefault(require("cors"));
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
const clientConfig = config;
const middlewareConfig = config;
const client = new api_1.MessagingApiClient(clientConfig); //①
const app = (0, express_1.default)(); //②
app.use((0, cors_1.default)());
app.get("/", (_, res) => __awaiter(void 0, void 0, void 0, function* () {
    //③
    return res.status(200).send({
        message: "success",
    });
}));
const textEventHandler = (
//④
event) => __awaiter(void 0, void 0, void 0, function* () {
    if (event.type !== "message" || event.message.type !== "text") {
        return;
    }
    const { replyToken } = event;
    const { text } = event.message;
    const resText = text.split('').reverse().join('');
    console.log(resText);
    const response = {
        type: "text",
        text: resText,
    };
    yield client.replyMessage({ replyToken: replyToken, messages: [response] });
});
app.post(
//⑤
"/webhook", (0, bot_sdk_1.middleware)(middlewareConfig), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
    //⑥
    console.log(`http://localhost:${PORT}/`);
});
