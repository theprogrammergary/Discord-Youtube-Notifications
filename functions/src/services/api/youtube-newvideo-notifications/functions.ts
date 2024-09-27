import axios, { isAxiosError } from "axios";
import "dotenv/config";
import { Timestamp } from "firebase-admin/firestore";
import { logger } from "firebase-functions/v2";
import { addDocument } from "../../data";
import { discordUtils } from "../../shared/discord";
import { IYoutubePubSubUpdate, YOUTUBE } from "./vars";

export function createFirestoreVideo(entry: any) {
  const newVideoInfo = {
    id: entry["yt:videoId"],
    title: entry.title,
    published: new Timestamp(parseInt(entry.published), 0)
  };

  return newVideoInfo;
}

async function updateVideoList(data: IYoutubePubSubUpdate,) {
  const entry = data.feed?.entry;
  if (entry) {
    const newVideoDocument = createFirestoreVideo(entry);

    await addDocument("videos", newVideoDocument.id, newVideoDocument);
  }
}

export async function handleNewVideo(data: IYoutubePubSubUpdate) {
  await updateVideoList(data);

  const entry = data.feed?.entry;
  if (entry?.title && entry["yt:videoId"]) {
    const tags: string[] = entry?.["yt:channelId"] === YOUTUBE.RECAP_CHANNEL ? ["1202000520714407966"] : [];

    logger.info(`TAGS FOR THE VIDEO: ${tags}`);

    const videoUrl = `https://www.youtube.com/watch?v=${entry["yt:videoId"]}`;
    await discordUtils.sendPost(
      YOUTUBE.DISCORD_TOKEN,
      YOUTUBE.DISCORD_CHANNEL_ID,
      entry.title,
      videoUrl,
      tags
    );
  }
}

export async function isNewVideo(entry: any, videoList: any): Promise<boolean> {
  if (await isVideoLivestream(entry["yt:videoId"])) {
    logger.info(`VIDEO IS LIVESTREAM ${entry["yt:videoId"]}`);
    return false;
  }

  const untrackedVideo = !Object.keys(videoList).includes(entry["yt:videoId"]);
  if (!untrackedVideo) {
    logger.info(`VIDEO IS ALREADY TRACKED ${entry["yt:videoId"]}`);
    return false;
  }

  const publishedDate = new Date(entry.published).getTime();

  const currentDate = new Date().getTime();

  const isPublishedWithinLastDay = (currentDate - publishedDate) < (1000 * 60 * 60 * 24);

  if (!isPublishedWithinLastDay) {
    logger.info(`VIDEO IS NOT PUBLISHED WITHIN LAST DAY ${entry["yt:videoId"]}`);
    return false;
  }

  return true;
}

async function isVideoLivestream(videoId: string): Promise<boolean> {
  const apiKey = process.env.YT_API_KEY || "";
  if (!apiKey) {
    logger.error("YT_API_KEY is not set");
    return false;
  }

  try {
    const response = await axios.get("https://www.googleapis.com/youtube/v3/videos", {
      params: {
        id: videoId,
        part: "snippet,liveStreamingDetails",
        key: apiKey
      },
      timeout: 10000 // 10 sec
    });

    if (response.data.items && response.data.items.length > 0) {
      const videoDetails = response.data.items[0];
      return !!videoDetails.liveStreamingDetails;
    }

    return false;
  } catch (error) {
    if (isAxiosError(error)) {
      logger.error(`Error checking if video is livestream: ${error.message}`);
      if (error.response) {
        logger.error(`Response status: ${error.response.status}`);
        logger.error(`Response data: ${JSON.stringify(error.response.data)}`);
      }
    } else {
      logger.error(`Unexpected error checking if video is livestream: ${error}`);
    }
    return false;
  }
}

