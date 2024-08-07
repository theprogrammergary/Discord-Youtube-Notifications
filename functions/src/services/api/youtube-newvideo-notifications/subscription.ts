import { logger } from "firebase-functions/v2";
import { YOUTUBE } from "../../api/youtube-newvideo-notifications/vars";

import { ytNotificationMethods } from "../../api/youtube-newvideo-notifications";

export async function subscribe2PubSubHubs() {
  await subscribe2PubSubHub(YOUTUBE.MAIN_CHANNEL);
  await subscribe2PubSubHub(YOUTUBE.RECAP_CHANNEL);
}

async function subscribe2PubSubHub(channelId: string) {
  if (channelId.trim() === "") {
    logger.error("channelId is empty: ", channelId);
    return;
  }

  const url = "https://pubsubhubbub.appspot.com/subscribe";

  const headers = {
    "authority": "pubsubhubbub.appspot.com",
    "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
    "accept-language": "en-US,en;q=0.7",
    "cache-control": "max-age=0",
    "content-type": "application/x-www-form-urlencoded",
    "origin": "https://pubsubhubbub.appspot.com",
    "referer": "https://pubsubhubbub.appspot.com/subscribe",
    "sec-fetch-dest": "document",
    "sec-fetch-mode": "navigate",
    "sec-fetch-site": "same-origin",
    "sec-fetch-user": "?1",
    "sec-gpc": "1",
    "upgrade-insecure-requests": "1",
  };

  const body = `hub.callback=https%3A%2F%2Fapi-6dsg2pg42q-uc.a.run.app%2F${ytNotificationMethods.route}&hub.topic=https%3A%2F%2Fwww.youtube.com%2Fxml%2Ffeeds%2Fvideos.xml%3Fchannel_id%3D${channelId}&hub.verify=async&hub.mode=subscribe&hub.verify_token=&hub.secret=&hub.lease_numbers=`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: headers,
      body: body,
    });
    logger.info(`ℹ️ Subscription for channelID ${channelId}:`, response.status);
  } catch (error) {
    logger.error(`❌ Error making subscription request for channel ID ${channelId}:`, error);
  }
}
