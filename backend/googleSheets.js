const { google } = require("googleapis");
const fs = require("fs");

// Load service account key
const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(fs.readFileSync("credentials.json")), // Your JSON file
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

// Google Sheets API
const sheets = google.sheets({ version: "v4", auth });

// Your Google Sheet ID (from URL)
const SPREADSHEET_ID = "1eP4lRLqtbCjYEuHWDt14cZemRXA20VUNXsYHQHjMSew"; // Get it from the sheet URL

// Read Data
async function readData(range = "'Ravinder'!A1:G100") {
  // ✅ Corrected sheet name
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range,
  });
  return response.data.values; // Returns rows as arrays
}

// ✅ Function to update remark based on date
async function updateRemark(date, remark) {
  try {
    const range = "'Ravinder'!A1:G100"; // Adjust range if needed
    const data = await readData(range);

    let rowIndex = -1;
    for (let i = 0; i < data.length; i++) {
      if (data[i][0] === date) {
        rowIndex = i + 1; // Google Sheets uses 1-based indexing
        break;
      }
    }

    if (rowIndex === -1) {
      throw new Error(`No row found for date: ${date}`);
    }

    const updateRange = `'Ravinder'!G${rowIndex}`; // Column G (Remark Column)

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: updateRange,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [[remark]] },
    });

    console.log(`Remark updated for date: ${date}`);
    return true;
  } catch (error) {
    console.error("Error updating remark:", error.message);
    throw error;
  }
}
async function getSheetNames() {
  try {
    const response = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
    });

    return response.data.sheets.map((sheet) => sheet.properties.title); // Returns an array of sheet names
  } catch (error) {
    console.error("Error fetching sheet names:", error.message);
    throw error;
  }
}

module.exports = { readData, updateRemark, getSheetNames };
