import * as fs from "fs";

export function readFromJsonFile(filepath: string) {
  const data = fs.readFileSync(filepath, "utf-8");
  const parsedData = JSON.parse(data);
  return parsedData
}

export function writeToJsonFile(filepath: string, data: any) {
  const jsonData = JSON.stringify(data, null, 2);
  fs.writeFileSync(filepath, jsonData, "utf-8");
}

