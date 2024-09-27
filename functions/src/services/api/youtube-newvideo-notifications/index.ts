import * as express from "express";
import { logger } from "firebase-functions/v2";

import { xmlUtils } from "../../shared/xml";

import { getCollection } from "../../data";
import { Lock } from "../../shared/lock";
import { handleNewVideo, isNewVideo } from "./functions";
import { IYoutubePubSubUpdate } from "./vars";

function setup(req: express.Request, res: express.Response) {
  const hubChallenge: string = req.query["hub.challenge"] as string;
  logger.info("ℹ️ NEW hubChallenge")
  res.status(200).send(hubChallenge);
}

async function update(req: express.Request, res: express.Response) {
  res.status(200).send("OK");

  const data: IYoutubePubSubUpdate | null = await xmlUtils.parseXmlToJson(req.body.toString("utf-8"));
  const entry = data?.feed?.entry;
  if (entry) {
    const videoId = entry["yt:videoId"];
    if (!videoId) {
      logger.info("❌ INVALID YoutubePubSubHub: Missing videoId", data);
      return;
    }

    const lock = new Lock(`video_lock_${videoId}`);
    try {
      await lock.acquire();

      const videoList = await getCollection("videos");
      const newVideo = await isNewVideo(entry, videoList);

      if (newVideo) {
        logger.info("✅ NEW YoutubePubSubHub Update:", data);
        await handleNewVideo(data);
      } else {
        logger.info("❌ OLD YoutubePubSubHub Update:", data);
      }
    } finally {
      await lock.release();
    }
  } else {
    logger.info("❌ INVALID YoutubePubSubHub:", data);
  }
}
async function getVideos(req: express.Request, res: express.Response) {
  res.status(200).send(await getCollection("videos"));
}

// async function addVideo(req: express.Request, res: express.Response) {
//   const videoData = {
//     id: req.body.id,
//     title: req.body.title,
//     published: new Timestamp(parseInt(req.body.published), 0)
//   };

//   res.status(200).send(await addDocument("videos", req.body.id, videoData));
// }

export const ytNotificationMethods = {
  "route": "/youtube-new-video-notification",
  get: setup,
  post: update,
  data: {
    "route": "/youtube-new-video-notification/data",
    get: getVideos,
  }
};
