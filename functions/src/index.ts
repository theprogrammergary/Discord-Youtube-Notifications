import { onRequest } from "firebase-functions/v2/https";
import * as express from "express";
import { youtube } from "./controllers/youtube";

const app: express.Application = express();

app.get("/youtube-notifications", youtube.get);
app.post("/youtube-notifications", youtube.post);

export const api = onRequest(app);
