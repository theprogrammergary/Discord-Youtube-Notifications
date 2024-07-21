import express from "express";
import { ytNotificationMethods } from "./youtube-newvideo-notifications";

// express app
export const apiApp: express.Application = express();

apiApp.get(ytNotificationMethods.route, ytNotificationMethods.get);
apiApp.post(ytNotificationMethods.route, ytNotificationMethods.post);

apiApp.use((req, res) => {
  res.status(404).send("404");
});
