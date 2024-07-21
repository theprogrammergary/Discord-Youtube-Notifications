
import { Timestamp } from "firebase-admin/firestore";
import { discordUtils } from "../../shared/discord";
import { IYoutubePubSubUpdate, YOUTUBE } from "./vars";

import { addDocument } from "../../data";

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
    const tags: number[] = entry?.["yt:channelId"] === YOUTUBE.RECAP_CHANNEL ? [parseInt(YOUTUBE.RECAP_TAG)] : [];
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
  const untrackedVideo = !Object.keys(videoList).includes(entry["yt:videoId"]);

  const publishedDate = new Timestamp(parseInt(entry.published), 0).toDate();

  const currentDate = new Date();

  const isPublishedWithinLastDay = (currentDate.getTime() - publishedDate.getTime()) < (1000 * 60 * 60 * 24);

  const isLivestream = entry.title.toLowerCase().includes("live");

  return untrackedVideo && isPublishedWithinLastDay && !isLivestream;
}
