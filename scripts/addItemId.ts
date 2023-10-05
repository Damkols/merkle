import csv = require("csv-parser");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
import * as fs from "fs";
import path = require("path");

export interface Data {
 hash?: string;
 address: string;
 itemID: number;
 amount: number;
}

//helper function to help generate election tries
export async function generateAirdropCSV(
 csvFilePath: string,
 airdropName: string
 //  itemID: number
): Promise<string | ""> {
 const data: Data[] = [];

 // Read the CSV file and store the data in an array
 await new Promise((resolve, reject) => {
  fs
   .createReadStream(csvFilePath)
   .pipe(csv())
   .on("data", (row: Data) => {
    data.push(row);
   })
   .on("end", resolve)
   .on("error", reject);
 });
 if (data.length > 0 && "itemID" in data[0]) {
  console.log("The itemID column already exists. Exiting the function.");
  return "";
 }

 // Hash the data using the Solidity keccak256 function
 for (const row of data) {
  // row.itemID = itemID;
 }
 let toFile: string = "";
 // Write the hashed data back to the CSV file
 await new Promise((resolve, reject) => {
  fs.mkdirSync(`scripts/airdropTrees/${airdropName}`);
  toFile = `scripts/airdropTrees/${airdropName}/airdropData.csv`;
  const csvWriter = new createCsvWriter({
   path: toFile,
   header: [
    { id: "address", title: "address" },
    { id: "hash", title: "hash" },
    { id: "itemID", title: "itemID" },
   ],
   fieldDelimiter: ",",
   recordDelimiter: "\n",
   quoteStrings: '"',
   escaping: true,
  });
  csvWriter.writeRecords(data).then(resolve).catch(reject);
 });
 return toFile;
}

export function getPath(str: string): string {
 return path.dirname(str);
}
