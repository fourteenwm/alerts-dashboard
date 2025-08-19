// src/lib/config.ts
import type { MetricOptions } from './types'

export const COLORS = {
    primary: '#1a5f7a', // Dark teal from Adtaxi branding
    secondary: '#ff6b35', // Orange accent
    darkGrey: '#2c3e50', // Dark grey for text
    lightGrey: '#f8f9fa', // Light grey for backgrounds
    lightPink: '#ffb6c1', // Light pink accent
    white: '#ffffff',
    success: '#28a745',
    warning: '#ffc107',
    danger: '#dc3545'
} as const

export const DEFAULT_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbwgg4DSGPxUQ6qk9quS8zxIFoZLg9ZmrOWuxOL4QAc_ctxsaFAUeeZFXHaW7r4Ig0v8YA/exec'

export const SHEET_TABS = ['Dashboard', 'Dashboard LivCor', 'All Error Score Card', 'Broken Error Dashboard', 'Soft Error Dashboard'] as const
export type SheetTab = typeof SHEET_TABS[number]

export interface TabConfig {
    name: SheetTab
    metrics: MetricOptions
}

export const TAB_CONFIGS: Record<SheetTab, TabConfig> = {
    'Dashboard': {
        name: 'Dashboard',
        metrics: {
            account: { label: 'Account', format: (val: string) => val },
            accountCode: { label: 'Account Code', format: (val: string) => val },
            wholeMonthMediaBudget: { label: '% Whole Month Media Budget', format: (val: number) => `${val.toFixed(2)}%` },
            wholeMonthWithRollover: { label: '% Whole Month w/Rollover', format: (val: number) => `${val.toFixed(2)}%` },
            overUnder: { label: '% Over Under', format: (val: number) => `${val.toFixed(2)}%` }
        }
    },
    'Dashboard LivCor': {
        name: 'Dashboard LivCor',
        metrics: {
            account: { label: 'Account', format: (val: string) => val },
            accountCode: { label: 'Account Code', format: (val: string) => val },
            wholeMonthMediaBudget: { label: '% Whole Month Media Budget', format: (val: number) => `${val.toFixed(2)}%` },
            wholeMonthWithRollover: { label: '% Whole Month w/Rollover', format: (val: number) => `${val.toFixed(2)}%` },
            overUnder: { label: '% Over Under', format: (val: number) => `${val.toFixed(2)}%` }
        }
    },
    'All Error Score Card': {
        name: 'All Error Score Card',
        metrics: {
            accountName: { label: 'Account Name', format: (val: string) => val },
            errorScore: { label: 'Error Score', format: (val: number) => val.toFixed(1) },
            average: { label: 'Average', format: (val: number) => val.toFixed(2) },
            median: { label: 'Median', format: (val: number) => val.toFixed(1) }
        }
    },
    'Broken Error Dashboard': {
        name: 'Broken Error Dashboard',
        metrics: {
            zeroSpenders: { label: 'Zero Spenders', format: (val: string) => val },
            adsDisapprovals: { label: 'Ads Disapprovals', format: (val: number) => val.toString() },
            assetDisapprovals: { label: 'Asset Disapprovals', format: (val: number) => val.toString() },
            conversionIssues: { label: 'Conversion Issues', format: (val: number) => val.toString() },
            noEndDates: { label: 'No End Dates', format: (val: number) => val.toString() }
        }
    },
    'Soft Error Dashboard': {
        name: 'Soft Error Dashboard',
        metrics: {
            negativeKeywordConflicts: { label: 'Negative Keyword Conflicts', format: (val: number) => val.toString() },
            impressionsOutsideCountry: { label: 'Impressions Outside Country', format: (val: number) => val.toString() },
            displayAppsRunning: { label: 'Display Apps Running', format: (val: number) => val.toString() },
            geoLocationUS: { label: 'Geo Location "United States"', format: (val: number) => val.toString() }
        }
    }
} 