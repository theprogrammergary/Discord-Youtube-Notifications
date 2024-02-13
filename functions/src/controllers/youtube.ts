export const route = "/youtube-notifications";
import * as express from "express";
import { logger } from "firebase-functions";
import { readFromJsonFile } from "../services/shared";

function setup(req: express.Request, res: express.Response) {
  const hubChallenge: string = req.query["hub.challenge"] as string;
  res.status(200).send(hubChallenge);
}

async function update(req: express.Request, res: express.Response) {
  res.status(200).send("OK");
  const xmlData: string = req.body.toString("utf-8");
  const decodedData: string = Buffer.from(xmlData, "utf-8").toString("utf-8");

  if (decodedData) {
    logger.info("Youtube Update:", decodedData);
    const videoList = readFromJsonFile("videoList.json");
    if (videoList) {
      logger.info("Video List:", videoList);
    }
  }
}

export const youtube = {
  get: setup,
  post: update,
};
