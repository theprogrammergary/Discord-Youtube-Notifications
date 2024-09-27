import express from "express";
import { ytNotificationMethods } from "./youtube-newvideo-notifications";

// express app
export const apiApp: express.Application = express();

apiApp.get("/health", (req, res) => {
  res.status(200).send("HEALTHY");
});

// youtube-new-video-notification
apiApp.get(ytNotificationMethods.route, ytNotificationMethods.get);
apiApp.post(ytNotificationMethods.route, ytNotificationMethods.post);
// apiApp.get(ytNotificationMethods.data.route, ytNotificationMethods.data.get);

apiApp.use((req, res) => {
  res.status(404).send("404");
});
