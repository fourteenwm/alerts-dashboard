# Adding a Data Test Page to BTA App: Developer Guide

This guide will walk you through creating a simple test page to verify that your data fetching is working correctly after adding new data types to the BTA App.

## Table of Contents

1. [Overview](#overview)
2. [Creating the Test Page](#creating-the-test-page)
3. [Adding Navigation](#adding-navigation)
4. [Testing Your Implementation](#testing-your-implementation)
5. [Conclusion](#conclusion)

## Overview

After adding new data types to your BTA App (like ad groups data), it's helpful to have a simple test page to verify that:
- Data is being fetched correctly from the Google Sheet
- The data structure matches your TypeScript interfaces
- All tabs are accessible and contain the expected data

This test page will provide a simple interface to inspect your data without the complexity of production UI components.

## Creating the Test Page

### Step 1: Create the Page File

Create a new file at `src/app/data-test/page.tsx`:

```typescript
// src/app/data-test/page.tsx
'use client';

import { useState } from 'react';
import { useSettings } from '@/lib/contexts/SettingsContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export default function DataTestPage() {
  const { fetchedData, isDataLoading, dataError } = useSettings();
  const [selectedTab, setSelectedTab] = useState<string>('daily');

  // Define available tabs
  const availableTabs = [
    { value: 'daily', label: 'Daily Campaign Data' },
    { value: 'searchTerms', label: 'Search Terms Data' },
    { value: 'adGroups', label: 'Ad Groups Data' }
  ];

  // Get the selected data
  const getSelectedData = () => {
    if (!fetchedData) return [];
    
    switch (selectedTab) {
      case 'daily':
        return fetchedData.daily || [];
      case 'searchTerms':
        return fetchedData.searchTerms || [];
      case 'adGroups':
        return fetchedData.adGroups || [];
      default:
        return [];
    }
  };

  const selectedData = getSelectedData();
  const firstRow = selectedData[0];

  // Handle loading state
  if (isDataLoading) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Data Test Page</h1>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">Loading data...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Handle error state
  if (dataError) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Data Test Page</h1>
        <Card>
          <CardContent className="p-6">
            <div className="text-red-600">Error loading data: {dataError.message}</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Data Test Page</h1>
      
      {/* Tab Selection */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Select Data Tab</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedTab} onValueChange={setSelectedTab}>
            <SelectTrigger className="w-[300px]">
              <SelectValue placeholder="Select a data tab" />
            </SelectTrigger>
            <SelectContent>
              {availableTabs.map((tab) => (
                <SelectItem key={tab.value} value={tab.value}>
                  {tab.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Data Count */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Data Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Badge variant="secondary">
              Total Rows: {selectedData.length}
            </Badge>
            <Badge variant="outline">
              Selected Tab: {selectedTab}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* First Row Key-Value Pairs */}
      {firstRow && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>First Row Data Structure</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(firstRow).map(([key, value]) => (
                <div key={key} className="border rounded p-3">
                  <div className="font-mono text-sm text-gray-600">{key}</div>
                  <div className="font-medium">
                    {typeof value === 'number' 
                      ? value.toLocaleString() 
                      : String(value)
                    }
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>First 10 Rows</CardTitle>
        </CardHeader>
        <CardContent>
          {selectedData.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No data available for the selected tab
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {Object.keys(firstRow || {}).map((key) => (
                      <TableHead key={key} className="font-mono text-xs">
                        {key}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedData.slice(0, 10).map((row, index) => (
                    <TableRow key={index}>
                      {Object.values(row).map((value, valueIndex) => (
                        <TableCell key={valueIndex} className="font-mono text-xs">
                          {typeof value === 'number' 
                            ? value.toLocaleString() 
                            : String(value)
                          }
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
```

### Step 2: Understanding the Component Structure

The test page includes several key features:

1. **Tab Selection Dropdown**: Allows switching between different data tabs (daily, searchTerms, adGroups)
2. **Data Count Display**: Shows the total number of rows in the selected dataset
3. **First Row Structure**: Displays all key-value pairs from the first row to understand the data structure
4. **Data Table**: Shows the first 10 rows in a simple table format
5. **Loading/Error States**: Properly handles loading and error states from the SettingsContext

### Step 3: Key Implementation Details

- **Data Access**: Uses the `useSettings` hook to access `fetchedData`, `isDataLoading`, and `dataError`
- **Dynamic Data Selection**: The `getSelectedData()` function returns the appropriate data array based on the selected tab
- **Responsive Design**: Uses CSS Grid for responsive layout of key-value pairs
- **Type Safety**: Handles different data types appropriately (numbers vs strings)
- **Error Handling**: Provides clear error messages and loading states

## Adding Navigation

To make the test page accessible, add a link to it in your navigation component:

```typescript
// src/components/Navigation.tsx
// Add this to your existing navigation links:

<Link 
  href="/data-test" 
  className="text-sm font-medium transition-colors hover:text-primary"
>
  Data Test
</Link>
```

## Testing Your Implementation

Once you've created the test page, you can use it to verify:

1. **Data Fetching**: Check that all tabs show data and the row counts are reasonable
2. **Data Structure**: Examine the key-value pairs to ensure they match your TypeScript interfaces
3. **New Data Types**: Verify that your newly added data (like ad groups) is being fetched correctly
4. **Error Handling**: Test error states by temporarily breaking your sheet URL

### Common Issues to Check:

- **Empty Data**: If a tab shows 0 rows, check that your Google Ads script is populating that tab
- **Missing Fields**: If key-value pairs show "undefined", check that your data parsing functions match the sheet headers
- **Type Errors**: If you see type mismatches, verify your TypeScript interfaces match the actual data structure

## Conclusion

This test page provides a simple way to verify that your data integration is working correctly. It's particularly useful when:

- Adding new data types to your app
- Debugging data fetching issues
- Verifying that your Google Ads script is populating the correct data
- Understanding the structure of your data for development purposes

Once you've confirmed everything is working correctly, you can remove or hide this test page from production navigation, or keep it as a development tool for future data additions. 