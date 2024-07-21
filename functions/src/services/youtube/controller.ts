import * as express from "express";
import { logger } from "firebase-functions/v2";
import * as path from "path";
import { parseXmlToJson, readFromJsonFile, sendDiscordPost, writeToJsonFile } from "../shared/shared";
import { youtube, youtubePubSubUpdate } from "./vars";

const dataDir = path.join(__dirname, "data/");

/**
 * Handles setup for YouTube notifications.
 * @param {express.Request} req - The request object.
 * @param {express.Response} res - The response object.
 */
function setup(req: express.Request, res: express.Response) {
  const hubChallenge: string = req.query["hub.challenge"] as string;
  logger.info("ℹ️ NEW hubChallenge")
  res.status(200).send(hubChallenge);
}

/**
 * Handles update for YouTube notifications.
 * @param {express.Request} req - The request object.
 * @param {express.Response} res - The response object.
 */
async function update(req: express.Request, res: express.Response) {
  res.status(200).send("OK");
  const data: youtubePubSubUpdate | null = await parseXmlToJson(req.body.toString("utf-8"));
  const entry = data?.feed?.entry;
  if (entry) {
    const videoList = readFromJsonFile(dataDir + "videos.json");
    const newVideo = isNewVideo(entry, videoList);
    if (newVideo) {
      logger.info("✅ NEW YoutubePubSubHub Update:", data)
      await validYoutubeVideo(data, videoList);
    } else {
      logger.info("❌ YoutubePubSubHub Update:", data)
    }
  } else {
    logger.info("❌ INVALID YoutubePubSubHub:", data)
  }
}

/**
 * Updates the video list with new video information.
 * @param {youtubePubSubUpdate} data - The YouTube PubSub update data.
 * @param {any} videoList - The list of existing videos.
 */
async function updateVideoList(data: youtubePubSubUpdate, videoList: any) {
  const entry = data.feed?.entry;
  if (entry) {
    const newVideoId = entry["yt:videoId"];
    const newVideoInfo = {
      title: entry.title,
      published: entry.published
    };

    videoList[newVideoId] = newVideoInfo;
    writeToJsonFile(dataDir + "videos.json", videoList);
  }
}

/**
 * Checks if the video is new based on entry and videoList.
 * @param {any} entry - The YouTube video entry.
 * @param {any} videoList - The list of existing videos.
 * @return {boolean} - True if the video is new, false otherwise.
 */
function isNewVideo(entry: any, videoList: any): boolean {
  const untrackedVideo = !Object.keys(videoList).includes(entry["yt:videoId"]);
  const publishedDate: Date = new Date(entry.published);
  const currentDate: Date = new Date();
  const isPublishedWithinLastDay: boolean = (currentDate.getTime() - publishedDate.getTime()) < (1000 * 60 * 60 * 24);
  const isLivestream: boolean = entry.title.toLowerCase().includes("live");
  return untrackedVideo && isPublishedWithinLastDay && !isLivestream;
}

/**
 * Handles valid YouTube video updates and sends notifications to Discord.
 * @param {youtubePubSubUpdate} data - The YouTube PubSub update data.
 * @param {any} videoList - The list of existing videos.
 */
async function validYoutubeVideo(data: youtubePubSubUpdate, videoList: any) {
  await updateVideoList(data, videoList);
  const entry = data.feed?.entry;
  if (entry?.title && entry["yt:videoId"]) {
    const tags: number[] = entry?.["yt:channelId"] === youtube.RECAP_CHANNEL ?
      [youtube.RECAP_TAG] : [];
    const videoUrl = `https://www.youtube.com/watch?v=${entry["yt:videoId"]}`;
    await sendDiscordPost(
      youtube.DISCORD_TOKEN,
      youtube.DISCORD_CHANNEL_ID,
      entry.title,
      videoUrl,
      tags
    );
  }
}

export const youtubeMethods = {
  get: setup,
  post: update,
};
