import csv = require("csv-parser");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
import * as fs from "fs";
//this will help calculate all user hashes given the csv containing them
//it will write the new contents to the file itself
async function hashData(csvFilePath: string): Promise<void> {
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
 if (data.length > 0 && "hash" in data[0]) {
  console.log("The hash column already exists. Exiting the function.");
  return;
 }

 // Hash the data using the Solidity keccak256 function
 for (const row of data) {
  row.hash = solidityPackedKeccak256(
   ["address", "uint256", "uint256"],
   [row.address, row.itemID, row.amount]
  );
 }

 // Write the hashed data back to the CSV file
 await new Promise((resolve, reject) => {
  const csvWriter = new createCsvWriter({
   path: csvFilePath,
   header: [
    { id: "address", title: "address" },
    { id: "itemID", title: "itemID" },
    { id: "amount", title: "amount" },
    { id: "hash", title: "hash" },
   ],
   fieldDelimiter: ",",
   recordDelimiter: "\n",
   quoteStrings: '"',
   escaping: true,
  });
  csvWriter.writeRecords(data).then(resolve).catch(reject);
 });
}

hashData("scripts/userdata/data.csv");
export { Data };

import { solidityPackedKeccak256 } from "ethers";
import { Data } from "./addItemId";
