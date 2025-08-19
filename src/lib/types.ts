// src/lib/types.ts
import { SheetTab } from './config'

export interface Settings {
  sheetUrl: string
  currency: string
  selectedCampaign?: string
  activeTab?: SheetTab
}

export interface Campaign {
  id: string
  name: string
  totalCost: number
}

// Dashboard metrics for non-LivCor accounts
export interface DashboardMetric {
  account: string
  accountCode: string
  wholeMonthMediaBudget: number
  wholeMonthWithRollover: number
  overUnder: number
  monthProgress?: number
}

// Dashboard Live Core metrics for LivCor accounts
export interface DashboardLiveCoreMetric {
  account: string
  accountCode: string
  wholeMonthMediaBudget: number
  wholeMonthWithRollover: number
  overUnder: number
  monthProgress?: number
}

// All Error Score Card metrics
export interface AllErrorScoreCardMetric {
  accountName: string
  errorScore: number
  average?: number
  median?: number
}

// Broken Error Dashboard metrics
export interface BrokenErrorDashboardMetric {
  zeroSpenders: string
  adsDisapprovals: number
  assetDisapprovals: number
  conversionIssues: number
  noEndDates: number
}

// Soft Error Dashboard metrics
export interface SoftErrorDashboardMetric {
  negativeKeywordConflicts: number
  impressionsOutsideCountry: number
  displayAppsRunning: number
  geoLocationUS: number
}

// Legacy interfaces for backward compatibility
export interface AdMetric {
  campaign: string
  campaignId: string
  clicks: number
  value: number
  conv: number
  cost: number
  impr: number
  date: string
}

export interface AdGroupMetric {
  campaign: string
  campaignId: string
  adGroup: string
  adGroupId: string
  impr: number
  clicks: number
  value: number
  conv: number
  cost: number
  date: string
  cpc: number
  ctr: number
  convRate: number
  cpa: number
  roas: number
}

export interface SearchTermMetric {
  searchTerm: string
  keywordText?: string
  campaign: string
  adGroup: string
  impr: number
  clicks: number
  cost: number
  conv: number
  value: number
}

// Calculated metrics for daily data
export interface DailyMetrics extends AdMetric {
  CTR: number
  CvR: number
  CPA: number
  ROAS: number
  CPC: number
}

// Regular metrics excluding metadata fields
export type MetricKey = keyof Omit<AdMetric, 'campaign' | 'campaignId' | 'date'>

// Search term metrics excluding metadata
export type SearchTermMetricKey = keyof Omit<SearchTermMetric, 'searchTerm' | 'campaign' | 'adGroup'>

// All possible metrics (regular + calculated)
export type AllMetricKeys = MetricKey | keyof Omit<DailyMetrics, keyof AdMetric>

export interface MetricOption {
  label: string
  format: (val: string | number) => string
}

export interface MetricOptions {
  [key: string]: MetricOption
}

export interface TabConfig {
  metrics: MetricOptions
}

export interface TabConfigs {
  [key: string]: TabConfig
}

// Type guard for search term data
export function isSearchTermMetric(data: any): data is SearchTermMetric {
  return 'searchTerm' in data && 'adGroup' in data
}

// Type guard for daily metrics
export function isAdMetric(data: any): data is AdMetric {
  return 'campaignId' in data && 'impr' in data
}

// Combined tab data type for alerts
export type TabData = {
  'Dashboard': DashboardMetric[]
  'Dashboard LivCor': DashboardLiveCoreMetric[]
  'All Error Score Card': AllErrorScoreCardMetric[]
  'Broken Error Dashboard': BrokenErrorDashboardMetric[]
  'Soft Error Dashboard': SoftErrorDashboardMetric[]
}

// Helper type to get numeric values from metrics
export type MetricValue<T> = T extends number ? T : never 