import * as express from "express";
import { logger } from "firebase-functions/v2";

import { readFromJsonFile } from "../../shared/shared";
import { xmlUtils } from "../../shared/xml";

import * as path from "path";
import { getCollection } from "../../data";
import { handleNewVideo, isNewVideo } from "./functions";
import { IYoutubePubSubUpdate } from "./vars";

const DATA_DIR = path.join(__dirname, "data/");

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
    const videoList = readFromJsonFile(DATA_DIR + "videos.json");
    const newVideo = isNewVideo(entry, videoList);

    if (newVideo) {
      logger.info("✅ NEW YoutubePubSubHub Update:", data)
      await handleNewVideo(data, videoList, DATA_DIR);
    } else {
      logger.info("❌ YoutubePubSubHub Update:", data)
    }
  } else {
    logger.info("❌ INVALID YoutubePubSubHub:", data)
  }
}

async function getVideos(req: express.Request, res: express.Response) {
  res.status(200).send(await getCollection("videos"));
}

export const ytNotificationMethods = {
  "route": "/youtube-new-video-notification",
  get: setup,
  post: update,
  data: {
    "route": "/youtube-new-video-notification/data",
    get: getVideos,
  }
};

