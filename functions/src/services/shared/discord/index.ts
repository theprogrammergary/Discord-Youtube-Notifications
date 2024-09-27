import axios from "axios";
import { logger } from "firebase-functions/v2";

async function sendMessage(token: string, channelId: string, message: string) {
  try {
    await axios.post(
      `https://discord.com/api/v9/channels/${channelId}/messages`,
      { content: message },
      {
        headers: {
          "Authorization": `Bot ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    logger.error("Error sending discord message", error);
    throw error;
  }
}

async function sendPost(
  token: string,
  channelId: string,
  title: string,
  message: string,
  tags: string[]
) {
  const requestBody = {
    name: title,
    message: { content: message },
    applied_tags: tags,
  };

  try {
    await axios.post(
      `https://discord.com/api/v9/channels/${channelId}/threads`,
      requestBody,
      {
        headers: {
          "Authorization": `Bot ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    logger.error("Error sending discord post", error);
    throw error;
  }
}

export const discordUtils = {
  sendMessage,
  sendPost
}
