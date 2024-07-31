
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

export function isNewVideo(entry: any, videoList: any): boolean {
  const isLivestream = entry.title.toLowerCase().includes("live");
  if (isLivestream) {
    logger.info("VIDEO IS LIVESTREAM");
    return false;
  }

  const untrackedVideo = !Object.keys(videoList).includes(entry["yt:videoId"]);
  if (!untrackedVideo) {
    logger.info("VIDEO IS ALREADY TRACKED");
    return false;
  }

  const publishedDate = new Date(entry.published).getTime();

  const currentDate = new Date().getTime();

  const isPublishedWithinLastDay = (currentDate - publishedDate) < (1000 * 60 * 60 * 24);

  if (!isPublishedWithinLastDay) {
    logger.info("VIDEOIS NOT PUBLISHED WITHIN LAST DAY");
    return false;
  }

  return true;
}
