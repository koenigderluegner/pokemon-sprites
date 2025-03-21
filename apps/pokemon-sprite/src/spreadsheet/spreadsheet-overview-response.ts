import { GridProperties } from "./grid-properties";

export interface SpreadsheetOverviewResponse {
  spreadsheetId: string;
  properties: {
    title: string;
  };
  sheets: { properties: { sheetId: string; title: string; gridProperties: GridProperties } }[];

}
