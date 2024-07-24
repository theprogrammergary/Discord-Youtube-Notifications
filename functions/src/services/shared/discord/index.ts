import { logger } from "firebase-functions/v2";

async function sendMessage(token: string, channelId: string, message: string) {
  fetch(`https://discord.com/api/v9/channels/${channelId}/messages`, {
    method: "POST",
    headers: {
      "Authorization": `Bot ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ content: message }),
  })
    .then(response => {
      if (!response.ok) {
        logger.warn("Failed to send discord message", response)
      }
    })
    .catch(error => {
      logger.error("Error sending discord message", error)
    });
}

async function sendPost(
  token: string,
  channelId: string,
  title: string,
  message: string,
  tags: string[]
) {
  const requestBody = JSON.stringify({
    name: title,
    message: { content: message },
    applied_tags: tags,
  })

  fetch(`https://discord.com/api/v9/channels/${channelId}/threads`, {
    method: "POST",
    headers: {
      "Authorization": `Bot ${token}`,
      "Content-Type": "application/json",
    },
    body: requestBody,
  })
    .then(response => {
      if (!response.ok) {
        logger.warn("Failed to send discord message", response)
      }
    })
    .catch(error => {
      logger.error("Error sending discord message", error)
    });
}

export const discordUtils = {
  sendMessage,
  sendPost
}
