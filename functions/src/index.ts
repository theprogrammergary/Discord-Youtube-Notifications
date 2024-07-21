import * as functions from "firebase-functions/v2";
import { apiApp } from "./services/api";
import { subscribe2PubSubHubs } from "./services/api/youtube-newvideo-notifications/subscription";

// firebase functions
export const api = functions
  .https
  .onRequest({ maxInstances: 1 }, apiApp);

export const subscribe2YTPubSubHub = functions
  .scheduler
  .onSchedule({
    schedule: "every 24 hours",
    maxInstances: 1,
  }, async () => {
    await subscribe2PubSubHubs();
  });
