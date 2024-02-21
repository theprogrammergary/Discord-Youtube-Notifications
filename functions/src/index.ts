import * as express from "express";
import { onRequest } from "firebase-functions/v2/https";
import { youtubeMethods } from "./services/youtube/controller";
import { subscribeTask } from "./services/youtube/subscribe";

const app: express.Application = express();

app.get("/youtube-notifications", youtubeMethods.get);
app.post("/youtube-notifications", youtubeMethods.post);

export const api = onRequest(app);
export const youtubeTasks = subscribeTask;
