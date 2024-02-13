import * as fs from "fs";
import * as path from "path";

const dataDir = path.join(__dirname, "..", "data");

export function readFromJsonFile(fileName: string): any {
  const filePath = path.join(dataDir, fileName);
  const data = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(data);
}

export function writeToJsonFile(fileName: string, data: any): void {
  const filePath = path.join(dataDir, fileName);
  const jsonData = JSON.stringify(data, null, 2);
  fs.writeFileSync(filePath, jsonData, "utf-8");
}
