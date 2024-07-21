
import { discordUtils } from "../../shared/discord";
import { IYoutubePubSubUpdate, YOUTUBE } from "./vars";

import { writeToJsonFile } from "../../shared/shared";

export async function handleNewVideo(data: IYoutubePubSubUpdate, videoList: any, DATA_DIR: string) {
  await updateVideoList(data, videoList, DATA_DIR);

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

async function updateVideoList(data: IYoutubePubSubUpdate, videoList: any, DATA_DIR: string) {
  const entry = data.feed?.entry;
  if (entry) {
    const newVideoId = entry["yt:videoId"];
    const newVideoInfo = {
      title: entry.title,
      published: entry.published
    };

    videoList[newVideoId] = newVideoInfo;
    writeToJsonFile(DATA_DIR + "videos.json", videoList);
  }
}

export function isNewVideo(entry: any, videoList: any): boolean {
  const untrackedVideo = !Object.keys(videoList).includes(entry["yt:videoId"]);

  const publishedDate: Date = new Date(entry.published);

  const currentDate: Date = new Date();

  const isPublishedWithinLastDay: boolean = (currentDate.getTime() - publishedDate.getTime()) < (1000 * 60 * 60 * 24);

  const isLivestream: boolean = entry.title.toLowerCase().includes("live");

  return untrackedVideo && isPublishedWithinLastDay && !isLivestream;
}
