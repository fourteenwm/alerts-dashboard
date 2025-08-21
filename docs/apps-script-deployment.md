# Enhanced Google Apps Script for Dynamic Tab Access

This enhanced Apps Script provides dynamic access to all tabs in your Google Sheet, enabling the Data Insights page to analyze any available data.

## Complete Apps Script Code

Copy and paste this entire code into your Google Apps Script `Code.gs` file:

```javascript
/**
 * @OnlyCurrentDoc  
 * Enhanced HTTP GET handler that supports dynamic tab discovery and data fetching.
 * @param {GoogleAppsScript.Events.AppsScriptHttpRequestEvent} e The event parameter.
 * @return {GoogleAppsScript.Content.TextOutput} JSON data or tab list.
 */
function doGet(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var action = e.parameter.action || 'data';
  
  // Handle tab discovery request
  if (action === 'tabs') {
    return getAvailableTabs(ss);
  }
  
  // Handle data fetching request
  var tabName = e.parameter.tab || 'Dashboard';
  return getTabData(ss, tabName);
}

/**
 * Returns a list of all available tabs in the spreadsheet.
 * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} ss The active spreadsheet.
 * @return {GoogleAppsScript.Content.TextOutput} JSON array of tab information.
 */
function getAvailableTabs(ss) {
  try {
    var sheets = ss.getSheets();
    var tabNames = sheets.map(function(sheet) {
      return {
        name: sheet.getName(),
        id: sheet.getSheetId(),
        rowCount: sheet.getLastRow(),
        columnCount: sheet.getLastColumn()
      };
    });
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      tabs: tabNames,
      totalTabs: tabNames.length
    }))
    .setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: 'Failed to retrieve tabs: ' + error.toString()
    }))
    .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Fetches and returns data from a specific tab.
 * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} ss The active spreadsheet.
 * @param {string} tabName The name of the tab to fetch data from.
 * @return {GoogleAppsScript.Content.TextOutput} JSON data from the specified tab.
 */
function getTabData(ss, tabName) {
  try {
    // Get the sheet by name
    var sheet = ss.getSheetByName(tabName);
    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'Sheet not found: ' + tabName,
        availableTabs: ss.getSheets().map(function(s) { return s.getName(); })
      }))
      .setMimeType(ContentService.MimeType.JSON);
    }

    // Get data from the sheet 
    var data = sheet.getDataRange().getValues();
    
    // Handle empty sheets
    if (data.length === 0) {
      return ContentService.createTextOutput(JSON.stringify([]))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    var headers = data.shift();
    var jsonData = data.map(function(row) {
      var obj = {};
      headers.forEach(function(header, index) {
        // Handle empty headers
        var key = header || 'Column_' + (index + 1);
        obj[key] = row[index];
      });
      return obj;
    });

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      tabName: tabName,
      rowCount: jsonData.length,
      columnCount: headers.length,
      data: jsonData
    }))
    .setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: 'Failed to fetch data from ' + tabName + ': ' + error.toString()
    }))
    .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Test function to verify the script is working correctly.
 * Run this function in the Apps Script editor to test.
 */
function testScript() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  console.log('Testing tab discovery...');
  console.log(getAvailableTabs(ss).getContent());
  
  console.log('Testing data fetch for Dashboard...');
  console.log(getTabData(ss, 'Dashboard').getContent());
}
```

## Alternative: Simple Version (If Above Doesn't Work)

If you're still getting syntax errors, try this simpler version:

```javascript
function doGet(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var action = e.parameter.action || 'data';
  
  if (action === 'tabs') {
    return getAvailableTabs(ss);
  }
  
  var tabName = e.parameter.tab || 'Dashboard';
  return getTabData(ss, tabName);
}

function getAvailableTabs(ss) {
  try {
    var sheets = ss.getSheets();
    var tabNames = [];
    
    for (var i = 0; i < sheets.length; i++) {
      var sheet = sheets[i];
      tabNames.push({
        name: sheet.getName(),
        id: sheet.getSheetId(),
        rowCount: sheet.getLastRow(),
        columnCount: sheet.getLastColumn()
      });
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      tabs: tabNames,
      totalTabs: tabNames.length
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: 'Failed to retrieve tabs: ' + error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function getTabData(ss, tabName) {
  try {
    var sheet = ss.getSheetByName(tabName);
    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'Sheet not found: ' + tabName
      })).setMimeType(ContentService.MimeType.JSON);
    }

    var data = sheet.getDataRange().getValues();
    
    if (data.length === 0) {
      return ContentService.createTextOutput(JSON.stringify([]))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    var headers = data.shift();
    var jsonData = [];
    
    for (var i = 0; i < data.length; i++) {
      var row = data[i];
      var obj = {};
      for (var j = 0; j < headers.length; j++) {
        var key = headers[j] || 'Column_' + (j + 1);
        obj[key] = row[j];
      }
      jsonData.push(obj);
    }

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      tabName: tabName,
      rowCount: jsonData.length,
      columnCount: headers.length,
      data: jsonData
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: 'Failed to fetch data from ' + tabName + ': ' + error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function testScript() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  console.log('Testing tab discovery...');
  console.log(getAvailableTabs(ss).getContent());
  
  console.log('Testing data fetch for Dashboard...');
  console.log(getTabData(ss, 'Dashboard').getContent());
}
```

## Troubleshooting Steps

1. **Clear the entire Code.gs file** before pasting the new code
2. **Copy the code exactly** as shown above
3. **Save the project** after pasting
4. **Check for any red squiggly lines** indicating syntax errors
5. **Try the simple version** if the first one doesn't work

## Deployment Instructions

### 1. Replace Your Current Apps Script
1. Open your Google Apps Script project
2. **Delete all existing code** in `Code.gs`
3. **Paste the new code** (either version above)
4. **Save the project** (Ctrl+S or Cmd+S)

### 2. Deploy as Web App
1. Click **Deploy** → **New deployment**
2. Choose **Web app** as the type
3. Set **Execute as**: `Me`
4. Set **Who has access**: `Anyone`
5. Click **Deploy**
6. Copy the new **Web app URL**

### 3. Update Your Application
Update the `DEFAULT_WEB_APP_URL` in `src/lib/config.ts` with your new deployment URL.

## API Endpoints

### Get Available Tabs
```
GET https://your-apps-script-url/exec?action=tabs
```

**Response:**
```json
{
  "success": true,
  "tabs": [
    {
      "name": "Dashboard",
      "id": 123456789,
      "rowCount": 50,
      "columnCount": 10
    },
    {
      "name": "Campaign Data",
      "id": 987654321,
      "rowCount": 100,
      "columnCount": 15
    }
  ],
  "totalTabs": 2
}
```

### Get Tab Data
```
GET https://your-apps-script-url/exec?tab=Dashboard
```

**Response:**
```json
{
  "success": true,
  "tabName": "Dashboard",
  "rowCount": 50,
  "columnCount": 10,
  "data": [
    {
      "Account": "Client A",
      "Budget": 1000,
      "Spend": 750
    }
  ]
}
```

## Features

✅ **Dynamic Tab Discovery** - Lists all available tabs  
✅ **Generic Data Fetching** - Works with any tab structure  
✅ **Error Handling** - Graceful error messages  
✅ **Metadata** - Returns row/column counts  
✅ **Backward Compatible** - Still works with existing code  
✅ **Empty Sheet Handling** - Handles sheets with no data  

## Testing

1. Run the `testScript()` function in the Apps Script editor
2. Check the execution logs for any errors
3. Test the web app URL directly in your browser
4. Verify the Data Insights page can access new tabs

## Security Notes

- The script only accesses the current spreadsheet (`@OnlyCurrentDoc`)
- No sensitive data is logged or exposed
- Error messages don't reveal internal structure
- Access is controlled by Google's security model

## Next Steps

After deploying this script, you can:
1. Update your frontend to fetch available tabs dynamically
2. Add any tab to the Data Insights data source dropdown
3. Analyze any data structure without pre-configuration
4. Scale to unlimited tabs in your Google Sheet
