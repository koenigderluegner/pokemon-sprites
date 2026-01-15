export type Worksheets = {
  spreadsheetId: string;
  valueRanges: Array<{
    range: string;
    majorDimension: 'ROWS';
    values: string[][];
  }>;
};
