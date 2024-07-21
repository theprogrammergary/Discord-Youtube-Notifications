import * as xml2js from "xml2js";

function parseXmlToJson(xmlData: string): Promise<object | null> {
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

function isValidXml(xmlData: string): boolean {
  // eslint-disable-next-line no-useless-escape
  const openingTagRegex = /^<\?xml\s+version=".+"\s+encoding=".+"\s*\?>|<([a-zA-Z_][\w\-\.]*)[^>]*>/;
  return openingTagRegex.test(xmlData);
}

export const xmlUtils = {
  parseXmlToJson,
  isValidXml
}
