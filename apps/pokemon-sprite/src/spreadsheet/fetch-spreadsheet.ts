import { environment } from "../environments/environment";
import fs from "fs";
import path from "path";
import { SpreadsheetOverviewResponse } from "./spreadsheet-overview-response";

const apiKey = environment.googleApiKey;

// original google doc https://docs.google.com/spreadsheets/d/1kI_PDXnbghxjN2LBvxA6Pz-QqMYlVGN3Z1EivXOYwNY/edit?gid=1051438000#gid=1051438000
const spreadsheetId = '1kI_PDXnbghxjN2LBvxA6Pz-QqMYlVGN3Z1EivXOYwNY';
const spreadsheetFields = [
  'spreadsheetId',
  'properties.title',
  'sheets.properties',
  'sheets.properties.sheetId',
  'sheets.properties.title',
  'sheets.properties.gridProperties.rowCount',
  'sheets.properties.gridProperties.frozenRowCount',
  'sheets.properties.gridProperties.columnCount',
  'sheets.properties.gridProperties.frozenColumnCount'] as const;

const spreadsheetURL = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?includeGridData=false&fields=${spreadsheetFields.join(',')}&key=${apiKey}`

async function main() {


  const spreadsheetResponse = await fetch(spreadsheetURL);
  // TODO verify with something like zod?
  const spreadsheetData = await spreadsheetResponse.json() as SpreadsheetOverviewResponse;


  const valueRanges: string[] = []

  spreadsheetData.sheets.forEach(sheet => {
    const rangeStart = `${numberToColumnName(0)}${(sheet.properties.gridProperties.frozenRowCount ?? 0) + 1}`;
    const rangeEnd = `${numberToColumnName(sheet.properties.gridProperties.columnCount ?? 0)}${(sheet.properties.gridProperties.rowCount)}`;
    const valueRange = `${sheet.properties.title}!${rangeStart}:${rangeEnd}`;

    valueRanges.push(valueRange)
  });


  const params = valueRanges.map(encodeURIComponent).map(s => `ranges=${s}`).join('&')
  const worksheetRangesURL = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchGet?key=${apiKey}&${params}`;

  const worksheetResponse = await fetch(worksheetRangesURL);
  const worksheetData = await worksheetResponse.json();

  fs.writeFileSync(path.join(__dirname, '../assets/spreadsheet/overview.json'), JSON.stringify(spreadsheetData), { flag: 'w' })
  fs.writeFileSync(path.join(__dirname, '../assets/spreadsheet/worksheets.json'), JSON.stringify(worksheetData), { flag: 'w' })

}

main().catch(console.error);

/**
 * Converts number into Excel/Google Sheets like column name, for example 1 turns into A, 26 into Z, 27 into AA etc.
 * @param numberToConvert
 */
function numberToColumnName(numberToConvert: number): string {

  const ordA = 'a'.charCodeAt(0);
  const ordZ = 'z'.charCodeAt(0);
  const len = ordZ - ordA + 1;

  let s = '';
  while (numberToConvert >= 0) {
    s = String.fromCharCode(numberToConvert % len + ordA) + s;
    numberToConvert = Math.floor(numberToConvert / len) - 1;
  }
  return s.toUpperCase();

}
