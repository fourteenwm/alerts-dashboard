// src/lib/sheetsData.ts
import { 
  DashboardMetric, 
  DashboardLiveCoreMetric, 
  AllErrorScoreCardMetric, 
  BrokenErrorDashboardMetric, 
  SoftErrorDashboardMetric, 
  TabData 
} from './types'
import { SHEET_TABS, SheetTab, TAB_CONFIGS, DEFAULT_WEB_APP_URL } from './config'

// Helper to fetch and parse Dashboard data (non-LivCor accounts)
async function fetchAndParseDashboard(sheetUrl: string): Promise<DashboardMetric[]> {
  const tab: SheetTab = 'Dashboard';
  try {
    const urlWithTab = `${sheetUrl}?tab=${encodeURIComponent(tab)}`;
    const response = await fetch(urlWithTab);
    if (!response.ok) {
      throw new Error(`Failed to fetch data for tab ${tab}`);
    }
    const rawData = await response.json();
    if (!Array.isArray(rawData)) {
      console.error(`Response is not an array for ${tab}:`, rawData);
      return [];
    }
    
    // Extract month progress from first row with data in "Percent Through Month" column
    const monthProgress = rawData.length > 0 ? Number(rawData[0]['Percent Through Month'] || 0) * 100 : 0;
    
    return rawData
      .filter((row: any) => {
        const account = String(row['Account'] || '').trim();
        return account !== '' && account !== 'null' && account !== 'undefined';
      })
      .map((row: any) => ({
        account: String(row['Account'] || ''),
        accountCode: String(row['Account Code'] || ''),
        wholeMonthMediaBudget: Number(row['% Whole Month Media Budget'] || 0) * 100,
        wholeMonthWithRollover: Number(row['% Whole Month w/Rollover'] || 0) * 100,
        overUnder: Number(row['% Over Under'] || 0) * 100,
        monthProgress: monthProgress,
      }));
  } catch (error) {
    console.error(`Error fetching ${tab} data:`, error);
    return [];
  }
}

// Helper to fetch and parse Dashboard LivCor data (LivCor accounts)
async function fetchAndParseDashboardLiveCore(sheetUrl: string): Promise<DashboardLiveCoreMetric[]> {
  const tab: SheetTab = 'Dashboard LivCor';
  try {
    const urlWithTab = `${sheetUrl}?tab=${encodeURIComponent(tab)}`;
    const response = await fetch(urlWithTab);
    if (!response.ok) {
      throw new Error(`Failed to fetch data for tab ${tab}`);
    }
    const rawData = await response.json();
    if (!Array.isArray(rawData)) {
      console.error(`Response is not an array for ${tab}:`, rawData);
      return [];
    }
    
    // Extract month progress from first row with data in "Percent Through Month" column
    const monthProgress = rawData.length > 0 ? Number(rawData[0]['Percent Through Month'] || 0) * 100 : 0;
    
    return rawData
      .filter((row: any) => {
        const account = String(row['Account'] || '').trim();
        return account !== '' && account !== 'null' && account !== 'undefined';
      })
      .map((row: any) => ({
        account: String(row['Account'] || ''),
        accountCode: String(row['Account Code'] || ''),
        wholeMonthMediaBudget: Number(row['% Whole Month Media Budget'] || 0) * 100,
        wholeMonthWithRollover: Number(row['% Whole Month w/Rollover'] || 0) * 100,
        overUnder: Number(row['% Over Under'] || 0) * 100,
        monthProgress: monthProgress,
      }));
  } catch (error) {
    console.error(`Error fetching ${tab} data:`, error);
    return [];
  }
}

// Helper to fetch and parse All Error Score Card data
async function fetchAndParseAllErrorScoreCard(sheetUrl: string): Promise<AllErrorScoreCardMetric[]> {
  const tab: SheetTab = 'All Error Score Card';
  try {
    const urlWithTab = `${sheetUrl}?tab=${encodeURIComponent(tab)}`;
    const response = await fetch(urlWithTab);
    if (!response.ok) {
      throw new Error(`Failed to fetch data for tab ${tab}`);
    }
    const rawData = await response.json();
    if (!Array.isArray(rawData)) {
      console.error(`Response is not an array for ${tab}:`, rawData);
      return [];
    }
    return rawData.map((row: any) => ({
      accountName: String(row['Account Name'] || ''),
      errorScore: Number(row['Final Error Score'] || 0),
      average: row['Average'] ? Number(row['Average']) : undefined,
      median: row['Median'] ? Number(row['Median']) : undefined,
    }));
  } catch (error) {
    console.error(`Error fetching ${tab} data:`, error);
    return [];
  }
}

// Helper to fetch and parse Broken Error Dashboard data
async function fetchAndParseBrokenErrorDashboard(sheetUrl: string): Promise<BrokenErrorDashboardMetric[]> {
  const tab: SheetTab = 'Broken Error Dashboard';
  try {
    const urlWithTab = `${sheetUrl}?tab=${encodeURIComponent(tab)}`;
    const response = await fetch(urlWithTab);
    if (!response.ok) {
      throw new Error(`Failed to fetch data for tab ${tab}`);
    }
    const rawData = await response.json();
    if (!Array.isArray(rawData)) {
      console.error(`Response is not an array for ${tab}:`, rawData);
      return [];
    }
    return rawData.map((row: any) => ({
      zeroSpenders: String(row['Zero Spenders'] || ''),
      adsDisapprovals: Number(row['Ads Disapprovals'] || 0),
      assetDisapprovals: Number(row['Asset Disapprovals'] || 0),
      conversionIssues: Number(row['Conversion Issues'] || 0),
      noEndDates: Number(row['No End Dates'] || 0),
    }));
  } catch (error) {
    console.error(`Error fetching ${tab} data:`, error);
    return [];
  }
}

// Helper to fetch and parse Soft Error Dashboard data
async function fetchAndParseSoftErrorDashboard(sheetUrl: string): Promise<SoftErrorDashboardMetric[]> {
  const tab: SheetTab = 'Soft Error Dashboard';
  try {
    const urlWithTab = `${sheetUrl}?tab=${encodeURIComponent(tab)}`;
    const response = await fetch(urlWithTab);
    if (!response.ok) {
      throw new Error(`Failed to fetch data for tab ${tab}`);
    }
    const rawData = await response.json();
    if (!Array.isArray(rawData)) {
      console.error(`Response is not an array for ${tab}:`, rawData);
      return [];
    }
    return rawData.map((row: any) => ({
      negativeKeywordConflicts: Number(row['Negative Keyword Conflicts'] || 0),
      impressionsOutsideCountry: Number(row['Impressions Outside Country'] || 0),
      displayAppsRunning: Number(row['Display Apps Running'] || 0),
      geoLocationUS: Number(row['Geo Location "United States"'] || 0),
    }));
  } catch (error) {
    console.error(`Error fetching ${tab} data:`, error);
    return [];
  }
}

export async function fetchAllTabsData(sheetUrl: string = DEFAULT_WEB_APP_URL): Promise<TabData> {
  const [dashboardData, dashboardLiveCoreData, allErrorScoreCardData, brokenErrorDashboardData, softErrorDashboardData] = await Promise.all([
    fetchAndParseDashboard(sheetUrl),
    fetchAndParseDashboardLiveCore(sheetUrl),
    fetchAndParseAllErrorScoreCard(sheetUrl),
    fetchAndParseBrokenErrorDashboard(sheetUrl),
    fetchAndParseSoftErrorDashboard(sheetUrl)
  ]);

  return {
    'Dashboard': dashboardData || [],
    'Dashboard LivCor': dashboardLiveCoreData || [],
    'All Error Score Card': allErrorScoreCardData || [],
    'Broken Error Dashboard': brokenErrorDashboardData || [],
    'Soft Error Dashboard': softErrorDashboardData || [],
  } as TabData;
}

// Legacy functions for backward compatibility
export function getCampaigns(data: any[]): any[] {
  // This function is no longer relevant for alerts data
  // Keeping for backward compatibility
  return [];
}

export function getMetricsByDate(data: any[], campaignId: string): any[] {
  // This function is no longer relevant for alerts data
  // Keeping for backward compatibility
  return [];
}

export function getMetricOptions(activeTab: SheetTab = 'Dashboard') {
  return TAB_CONFIGS[activeTab]?.metrics || {}
}

// SWR configuration without cache control
export const swrConfig = {
  revalidateOnFocus: true,
  revalidateOnReconnect: true,
  dedupingInterval: 5000
} 