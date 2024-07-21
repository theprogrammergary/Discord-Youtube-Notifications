import * as express from "express";
import { ytNotificationMethods } from "./youtube-notifications";

// express app
export const apiApp: express.Application = express();

apiApp.get("/youtube-notifications", ytNotificationMethods.get);
apiApp.post("/youtube-notifications", ytNotificationMethods.post);

apiApp.use((req, res) => {
  res.status(404).send("404");
});
