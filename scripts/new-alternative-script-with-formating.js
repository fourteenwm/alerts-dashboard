const SHEET_URL = '';

const TABS = {
  searchTerms: {
    headers: ["searchTerm", "keywordText", "campaign", "adGroup", "impr", "clicks", "cost", "conv", "value", "cpc", "ctr", "convRate", "cpa", "roas"],
    query: `SELECT search_term_view.search_term, segments.keyword.info.text, campaign.name, ad_group.name, metrics.impressions, metrics.clicks, metrics.cost_micros, metrics.conversions, metrics.conversions_value FROM search_term_view WHERE segments.date DURING LAST_30_DAYS AND campaign.advertising_channel_type = "SEARCH" AND metrics.impressions >= 30 ORDER BY metrics.cost_micros DESC`,
    fields: ['search_term_view.search_term', 'segments.keyword.info.text', 'campaign.name', 'ad_group.name'],
    includeCalculatedMetrics: true
  },
  daily: {
    headers: ["date", "campaign", "campaignId", "impr", "clicks", "value", "conv", "cost"],
    query: `SELECT campaign.name, campaign.id, metrics.clicks, metrics.conversions_value, metrics.conversions, metrics.cost_micros, metrics.impressions, segments.date FROM campaign WHERE segments.date DURING LAST_30_DAYS ORDER BY segments.date DESC, metrics.cost_micros DESC`,
    fields: ['segments.date', 'campaign.name', 'campaign.id'],
    includeCalculatedMetrics: false
  },
  adGroups: {
    headers: ["campaign", "campaignId", "adGroup", "adGroupId", "impr", "clicks", "value", "conv", "cost", "date", "cpc", "ctr", "convRate", "cpa", "roas"],
    query: `SELECT campaign.name, campaign.id, ad_group.name, ad_group.id, metrics.clicks, metrics.conversions_value, metrics.conversions, metrics.cost_micros, metrics.impressions, segments.date FROM ad_group WHERE segments.date DURING LAST_30_DAYS ORDER BY segments.date DESC, metrics.cost_micros DESC`,
    fields: ['campaign.name', 'campaign.id', 'ad_group.name', 'ad_group.id', 'segments.date'],
    includeCalculatedMetrics: true
  }
};

const FORMATS = {
  'cost': '$#,##0.00', 'value': '$#,##0.00', 'cpc': '$#,##0.00', 'cpa': '$#,##0.00',
  'roas': '#,##0.0', 'conv': '#,##0.0', 'ctr': '0.0%', 'convRate': '0.0%', 'date': 'yyyy-mm-dd'
};

function main() {
  const ss = SHEET_URL ? SpreadsheetApp.openByUrl(SHEET_URL) : createNewSheet();
  Object.entries(TABS).forEach(([name, config]) => processTab(ss, name, config));
}

function createNewSheet() {
  const ss = SpreadsheetApp.create("Google Ads Report");
  Logger.log(`Created sheet: ${ss.getUrl()}`);
  return ss;
}

function processTab(ss, tabName, {headers, query, fields, includeCalculatedMetrics}) {
  const sheet = getOrCreateSheet(ss, tabName);
  sheet.clearContents();
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight("bold");
  
  const data = processRows(AdsApp.report(query).rows(), fields, includeCalculatedMetrics);
  if (data.length > 0) {
    sheet.getRange(2, 1, data.length, data[0].length).setValues(data);
    applyFormatting(sheet, headers);
  }
  Logger.log(`${tabName}: ${data.length} rows`);
}

function getOrCreateSheet(ss, name) {
  return ss.getSheetByName(name) || ss.insertSheet(name);
}

function processRows(rows, fields, includeCalculatedMetrics) {
  const data = [];
  while (rows.hasNext()) {
    const row = rows.next();
    const metrics = calcMetrics(row);
    const fieldValues = fields.map(field => String(row[field] || ''));
    data.push([...fieldValues, metrics.impressions, metrics.clicks, 
               fields.includes('segments.date') ? metrics.conversionValue : metrics.cost,
               metrics.conversions, 
               fields.includes('segments.date') ? metrics.cost : metrics.conversionValue,
               ...(includeCalculatedMetrics ? [metrics.cpc, metrics.ctr, metrics.convRate, metrics.cpa, metrics.roas] : [])]);
  }
  return data;
}

function calcMetrics(row) {
  const impressions = +(row['metrics.impressions'] || 0);
  const clicks = +(row['metrics.clicks'] || 0);
  const cost = +(row['metrics.cost_micros'] || 0) / 1000000;
  const conversions = +(row['metrics.conversions'] || 0);
  const conversionValue = +(row['metrics.conversions_value'] || 0);
  
  return {
    impressions, clicks, cost, conversions, conversionValue,
    cpc: clicks ? cost / clicks : 0,
    ctr: impressions ? clicks / impressions : 0,
    convRate: clicks ? conversions / clicks : 0,
    cpa: conversions ? cost / conversions : 0,
    roas: cost ? conversionValue / cost : 0
  };
}

function applyFormatting(sheet, headers) {
  headers.forEach((header, i) => {
    if (FORMATS[header]) {
      sheet.getRange(2, i + 1, sheet.getMaxRows() - 1, 1).setNumberFormat(FORMATS[header]);
    }
  });
}