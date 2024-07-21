import "dotenv/config";

interface youtube {
  API_KEY: string,
  MAIN_CHANNEL: string,
  RECAP_CHANNEL: string,
  RECAP_TAG: number
  DISCORD_TOKEN: string,
  DISCORD_CHANNEL_ID: string
  DISCORD_ANNOUNCEMENT_CHANNEL_ID: string
}

export const youtube: youtube = {
  API_KEY: process.env.YT_API_KEY || "",
  MAIN_CHANNEL: process.env.YT_MAIN_CHANNEL_ID || "",
  RECAP_CHANNEL: process.env.YT_RECAP_CHANNEL_ID || "",
  RECAP_TAG: parseInt(process.env.YT_RECAP_TAG || "0"),
  DISCORD_TOKEN: process.env.DISCORD_GG_BOT_TOKEN || "",
  DISCORD_CHANNEL_ID: process.env.YT_NOTIFICATION_CHANNEL_ID || "",
  DISCORD_ANNOUNCEMENT_CHANNEL_ID: process.env.YT_ANNOUNCEMENT_CHANNEL_ID || ""
}

export interface youtubePubSubUpdate {
  feed?: {
    entry?: {
      published?: string;
      title?: string;
      [key: string]: any;
    };
  };
}

export interface youtubeVideo {
  title: string;
  published: string;
}

export interface youtubeVideoList {
  [videoId: string]: youtubeVideo;
}
