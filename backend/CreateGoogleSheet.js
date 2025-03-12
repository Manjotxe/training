const express = require("express");
const { google } = require("googleapis");
const router = express.Router();
const auth = new google.auth.GoogleAuth({
  keyFile: "training-453008-6f71eafab851.json",
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const SHEET_ID = "1eP4lRLqtbCjYEuHWDt14cZemRXA20VUNXsYHQHjMSew";

const createNewSheet = async (title) => {
  const client = await auth.getClient();
  const sheets = google.sheets({ version: "v4", auth: client });

  try {
    // Step 1: Create a new sheet
    const response = await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: {
        requests: [
          {
            addSheet: {
              properties: { title },
            },
          },
        ],
      },
    });

    const sheetId = response.data.replies[0].addSheet.properties.sheetId;

    // Step 2: Insert headers
    const headers = [
      "Date", "Project Name", "Task Name", "Task Description", "Status",
      "Total time taken", "Remarks"
    ];

    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `${title}!A1:G1`, // Header range
      valueInputOption: "RAW",
      requestBody: {
        values: [headers],
      },
    });

    // Step 3: Apply bold formatting, font size 12, center alignment, vertical middle & wrap text
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: {
        requests: [
          {
            repeatCell: {
              range: {
                sheetId: sheetId,
                startRowIndex: 0,
                endRowIndex: 1,
                startColumnIndex: 0,
                endColumnIndex: headers.length,
              },
              cell: {
                userEnteredFormat: {
                  textFormat: {
                    bold: true,
                    fontSize: 12, // Font size 12
                  },
                  horizontalAlignment: "CENTER", // Center text horizontally
                  verticalAlignment: "MIDDLE", // Center text vertically
                  wrapStrategy: "WRAP", // Enable word wrapping
                },
              },
              fields: "userEnteredFormat(textFormat,horizontalAlignment,verticalAlignment,wrapStrategy)",
            },
          },
        ],
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error creating sheet:", error);
    throw error;
  }
};

// Define the route properly using `router`
router.post("/create-sheet", async (req, res) => {
  const { sheetName } = req.body;

  if (!sheetName) {
    return res.status(400).json({ error: "Sheet name is required" });
  }

  try {
    const result = await createNewSheet(sheetName);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ error: "Failed to create sheet" });
  }
});

module.exports = router;
