# Adding Ad Groups Data to BTA App: Developer Guide

This guide will walk you through the process of adding ad groups data to the BTA App. We'll cover modifying the existing data pipeline in the Next.js application, adding the new data type, and building a new page to display the data.

## Table of Contents

1. [Overview of the Existing System](#overview-of-the-existing-system)
2. [Modifying the App to Fetch New Data](#modifying-the-app-to-fetch-new-data)
3. [Creating a Feature Page](#creating-a-feature-page)
4. [Conclusion](#conclusion)

## Overview of the Existing System

The BTA App is a Next.js application that visualizes Google Ads data. Here's how the system currently works:

1. A Google Ads Script (`scripts/new-with-adgroups-and-formating.js`) extracts data from your Google Ads account
2. The script writes data to specific tabs in a Google Sheet
3. A Google Apps Script (`deploy-sheet.js`) exposes the Sheet data as a JSON API
4. The Next.js app fetches data from this API and displays it in various visualizations

Currently, the system handles two types of data:
- **Daily campaign data**: Daily performance metrics for each campaign
- **Search terms data**: Performance metrics for search terms

We'll be adding a new data type to this pipeline: **Ad Group Performance Data**.

## Modifying the App to Fetch New Data

Now, update the Next.js app to fetch and use this new data.

### Step 1: Update Types (`src/lib/types.ts`)

Define a TypeScript interface for your new data structure and add it to `TabData`.

```typescript
// src/lib/types.ts

// ... existing imports and interfaces (AdMetric, SearchTermMetric, etc.) ...

// Add the new AdGroupMetric interface
export interface AdGroupMetric {
  campaign: string;        // camelCase, matching sheet header
  campaignId: string;      // camelCase, matching sheet header
  adGroup: string;         // camelCase, matching sheet header
  adGroupId: string;       // camelCase, matching sheet header
  impr: number;
  clicks: number;
  value: number;
  conv: number;
  cost: number;
  date: string;
  cpc: number;            // Calculated in the script
  ctr: number;            // Calculated in the script
  convRate: number;       // Calculated in the script
  cpa: number;            // Calculated in the script
  roas: number;           // Calculated in the script
}

// Update the TabData type
export type TabData = {
  daily: AdMetric[];
  searchTerms: SearchTermMetric[];
  adGroups?: AdGroupMetric[]; // Add new optional property for ad group data
};

// ... existing type guards and other types ...
```

### Step 2: Update Configuration (`src/lib/config.ts`)

Add your new tab to `SHEET_TABS` and configure its metrics in `TAB_CONFIGS`.

```typescript
// src/lib/config.ts
import type { MetricOptions } from './types'; // Ensure TabConfig is also imported or defined if needed

// ... existing COLORS, DEFAULT_WEB_APP_URL ...

// Update the SHEET_TABS array
export const SHEET_TABS = ['daily', 'searchTerms', 'adGroups'] as const; // Added 'adGroups'
export type SheetTab = typeof SHEET_TABS[number];

export interface TabConfig { // If not already fully defined or imported
    name: SheetTab;
    metrics: MetricOptions;
}

// Update TAB_CONFIGS
export const TAB_CONFIGS: Record<SheetTab, TabConfig> = {
  daily: { /* ... */ },
  searchTerms: { /* ... */ },
  adGroups: { // New configuration for ad groups tab
    name: 'adGroups',
    metrics: { // Define metrics relevant for the ad groups page/display
      impr: { label: 'Impr', format: (val: number) => val.toLocaleString() },
      clicks: { label: 'Clicks', format: (val: number) => val.toLocaleString() },
      cost: { label: 'Cost', format: (val: number) => `$${val.toFixed(2)}` },
      conv: { label: 'Conv', format: (val: number) => val.toFixed(1) },
      value: { label: 'Value', format: (val: number) => `$${val.toFixed(2)}` },
      cpc: { label: 'CPC', format: (val: number) => `$${val.toFixed(2)}` },
      ctr: { label: 'CTR', format: (val: number) => `${(val * 100).toFixed(2)}%` },
      convRate: { label: 'CvR', format: (val: number) => `${(val * 100).toFixed(2)}%` },
      cpa: { label: 'CPA', format: (val: number) => `$${val.toFixed(2)}` },
      roas: { label: 'ROAS', format: (val: number) => `${val.toFixed(2)}x` }
    }
  }
};
```

### Step 3: Update Data Fetching Logic (`src/lib/sheetsData.ts`)

Create a new dedicated asynchronous function to fetch and parse your new data type. Then, update `fetchAllTabsData`.

```typescript
// src/lib/sheetsData.ts
import { AdMetric, Campaign, SearchTermMetric, TabData, AdGroupMetric } from './types'; // Added AdGroupMetric
import { SHEET_TABS, SheetTab, TAB_CONFIGS, DEFAULT_WEB_APP_URL } from './config';

// ... existing fetchAndParseSearchTerms, fetchAndParseDaily ...

// Helper to fetch and parse Ad Group data (New Function)
async function fetchAndParseAdGroups(sheetUrl: string): Promise<AdGroupMetric[]> {
  const tab: SheetTab = 'adGroups';
  try {
    const urlWithTab = `${sheetUrl}?tab=${tab}`;
    const response = await fetch(urlWithTab);
    if (!response.ok) {
      throw new Error(`Failed to fetch data for tab ${tab}`);
    }
    const rawData = await response.json();
    if (!Array.isArray(rawData)) {
      console.error(`Response is not an array for ${tab}:`, rawData);
      return [];
    }
    // Map the ad group data - keys here MUST match the camelCase headers in your Google Sheet
    return rawData.map((row: any) => ({
      campaign: String(row['campaign'] || ''),
      campaignId: String(row['campaignId'] || ''),
      adGroup: String(row['adGroup'] || ''),
      adGroupId: String(row['adGroupId'] || ''),
      impr: Number(row['impr'] || 0),
      clicks: Number(row['clicks'] || 0),
      value: Number(row['value'] || 0),
      conv: Number(row['conv'] || 0),
      cost: Number(row['cost'] || 0),
      date: String(row['date'] || ''),
      cpc: Number(row['cpc'] || 0),
      ctr: Number(row['ctr'] || 0),
      convRate: Number(row['convRate'] || 0),
      cpa: Number(row['cpa'] || 0),
      roas: Number(row['roas'] || 0),
    }));
  } catch (error) {
    console.error(`Error fetching ${tab} data:`, error);
    return [];
  }
}

export async function fetchAllTabsData(sheetUrl: string = DEFAULT_WEB_APP_URL): Promise<TabData> {
  const [
    dailyData,
    searchTermsData,
    adGroupsData // Added adGroupsData
  ] = await Promise.all([
    fetchAndParseDaily(sheetUrl),
    fetchAndParseSearchTerms(sheetUrl),
    fetchAndParseAdGroups(sheetUrl) // Added call to new function
  ]);

  return {
    daily: dailyData || [],
    searchTerms: searchTermsData || [],
    adGroups: adGroupsData || [], // Added new data to the result
  } as TabData;
}

// ... existing getCampaigns, getMetricsByDate, getMetricOptions, swrConfig ...
```

### Step 4: Test Fetching Functionality

You can verify data is being fetched correctly by temporarily logging it, perhaps in your `SettingsContext.tsx` where `fetchedData` is available

Example: in a component that uses `useSettings()`:
```tsx
const { fetchedData } = useSettings();
useEffect(() => {
  if (fetchedData?.adGroups) {
    console.log('Fetched Ad Groups Data (first 5):', fetchedData.adGroups.slice(0,5));
  }
}, [fetchedData]);
```

## Creating a Feature Page

Once data fetching is confirmed, you can build a new page (`src/app/adgroups/page.tsx`) to display this data. This process will be similar to how the `TermsPage` (`src/app/terms/page.tsx`) is structured:

1. Use the `useSettings` hook from `SettingsContext` to access `fetchedData`, `isDataLoading`, and `dataError`.
2. Extract your specific data (e.g., `fetchedData.adGroups`).
3. Use ShadCN UI components (`Table`, `Card`, etc.) for display.
4. Implement any necessary calculations or formatting using functions from `src/lib/metrics.ts` and `src/lib/utils.ts`.
5. Add links to your new page in `src/components/Navigation.tsx`.

Refer to existing pages like `src/app/terms/page.tsx` as a template for structure, data handling, loading/error states, and styling.

## Conclusion

This guide emphasizes the critical importance of consistent camelCase naming for headers in the Google Sheet, which then directly translate to JSON keys used by the Next.js application. By following these steps, adding new data sources should be a more predictable process. The key is ensuring the Google Ads Script correctly prepares and writes data with the exact headers your Next.js parsing functions expect.