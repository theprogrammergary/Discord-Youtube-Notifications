import { logger } from "firebase-functions/v2";
import * as fs from "fs";
import * as xml2js from "xml2js";

/**
 * Parses XML data to JSON.
 * @param {string} xmlData - The XML data to be parsed.
 * @return {Promise<object>} A Promise that resolves to the parsed JSON object.
 */
export function parseXmlToJson(xmlData: string): Promise<object | null> {
  return new Promise((resolve, reject) => {
    if (!isValidXml(xmlData)) {
      resolve(null);
    }

    const parser = new xml2js.Parser({
      explicitArray: false,
      mergeAttrs: true,
    });

    parser.parseString(xmlData, (err: any, result: any) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}

/**
 * Checks if the provided string is a valid XML.
 * @param {string} xmlData - The XML data to be checked.
 * @return {boolean} True if the XML data is valid, false otherwise.
 */
function isValidXml(xmlData: string): boolean {
  // eslint-disable-next-line no-useless-escape
  const openingTagRegex = /^<\?xml\s+version=".+"\s+encoding=".+"\s*\?>|<([a-zA-Z_][\w\-\.]*)[^>]*>/;
  return openingTagRegex.test(xmlData);
}

/**
 * Reads data from a JSON file.
 * @param {string} filepath - The path of the file to read from.
 * @return {any} The parsed JSON data.
 */
export function readFromJsonFile(filepath: string) {
  const data = fs.readFileSync(filepath, "utf-8");
  const parsedData = JSON.parse(data);
  return parsedData
}

export async function sendDiscordMessage(token: string, channelId: string, message: string) {
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

export async function sendDiscordPost(
  token: string,
  channelId: string,
  title: string,
  message: string,
  tags: string[]
) {
  fetch(`https://discord.com/api/v9/channels/${channelId}/threads`, {
    method: "POST",
    headers: {
      "Authorization": `Bot ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(
      {
        name: title,
        message: { content: message },
        applied_tages: tags
      }),
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

/**
 * Writes data to a JSON file.
 * @param {string} filepath - The path of the file to write to.
 * @param {any} data - The data to be written to the file.
 */
export function writeToJsonFile(filepath: string, data: any) {
  const jsonData = JSON.stringify(data, null, 2);
  fs.writeFileSync(filepath, jsonData, "utf-8");
}

