'use client'

import { useState, useEffect } from 'react'
import useSWR from 'swr'
import { useSettings } from '@/lib/contexts/SettingsContext'
import { fetchAllTabsData } from '@/lib/sheetsData'
import { MetricCard } from '@/components/MetricCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, Info, TrendingUp } from 'lucide-react'
import type { TabData } from '@/lib/types'
import { COLORS } from '@/lib/config'

export function DashboardPage() {
    const { settings } = useSettings()
    const [selectedTab, setSelectedTab] = useState<'Dashboard' | 'Dashboard LivCor' | 'All Error Score Card' | 'Broken Error Dashboard' | 'Soft Error Dashboard'>('Dashboard')

    const { data: tabsData = {} as TabData, error, isLoading } = useSWR(
        settings.sheetUrl,
        fetchAllTabsData
    )

    if (error) {
        return (
            <div className="p-8 text-center">
                <div className="text-red-500 mb-4">Error loading data</div>
            </div>
        )
    }

    if (isLoading) {
        return <div className="p-8 text-center">Loading...</div>
    }

    const getTabData = () => {
        switch (selectedTab) {
            case 'Dashboard':
                return {
                    title: 'Dashboard - Non-LivCor Accounts',
                    data: tabsData['Dashboard'] || [],
                    icon: <TrendingUp className="h-5 w-5" style={{ color: COLORS.primary }} />,
                    summaryMetrics: [
                        { label: 'Total Accounts', value: (tabsData['Dashboard'] || []).length.toString() },
                        { label: 'Month Progress', value: `${((tabsData['Dashboard'] || [])[0]?.monthProgress || 0).toFixed(1)}%` },
                        { label: 'Avg Media Budget %', value: `${((tabsData['Dashboard'] || []).reduce((sum, item) => sum + item.wholeMonthMediaBudget, 0) / Math.max((tabsData['Dashboard'] || []).length, 1)).toFixed(2)}%` },
                        { label: 'Avg Rollover %', value: `${((tabsData['Dashboard'] || []).reduce((sum, item) => sum + item.wholeMonthWithRollover, 0) / Math.max((tabsData['Dashboard'] || []).length, 1)).toFixed(2)}%` }
                    ]
                }
            case 'Dashboard LivCor':
                return {
                    title: 'Dashboard LivCor - LivCor Accounts',
                    data: tabsData['Dashboard LivCor'] || [],
                    icon: <TrendingUp className="h-5 w-5" style={{ color: COLORS.primary }} />,
                    summaryMetrics: [
                        { label: 'Total LivCor Accounts', value: (tabsData['Dashboard LivCor'] || []).length.toString() },
                        { label: 'Month Progress', value: `${((tabsData['Dashboard LivCor'] || [])[0]?.monthProgress || 0).toFixed(1)}%` },
                        { label: 'Avg Media Budget %', value: `${((tabsData['Dashboard LivCor'] || []).reduce((sum, item) => sum + item.wholeMonthMediaBudget, 0) / Math.max((tabsData['Dashboard LivCor'] || []).length, 1)).toFixed(2)}%` },
                        { label: 'Avg Rollover %', value: `${((tabsData['Dashboard LivCor'] || []).reduce((sum, item) => sum + item.wholeMonthWithRollover, 0) / Math.max((tabsData['Dashboard LivCor'] || []).length, 1)).toFixed(2)}%` }
                    ]
                }
            case 'All Error Score Card':
                const errorData = tabsData['All Error Score Card'] || []
                const avgErrorScore = errorData.reduce((sum, item) => sum + item.errorScore, 0) / Math.max(errorData.length, 1)
                const highPriorityAccounts = errorData.filter(item => item.errorScore > 4).length
                const criticalAccounts = errorData.filter(item => item.errorScore > 6).length
                return {
                    title: 'All Error Score Card',
                    data: errorData,
                    icon: <AlertTriangle className="h-5 w-5" style={{ color: COLORS.danger }} />,
                    summaryMetrics: [
                        { label: 'Total Accounts', value: errorData.length.toString() },
                        { label: 'Avg Error Score', value: avgErrorScore.toFixed(2) },
                        { label: 'High Priority', value: highPriorityAccounts.toString() },
                        { label: 'Critical Priority', value: criticalAccounts.toString() }
                    ]
                }
            case 'Broken Error Dashboard':
                const brokenData = tabsData['Broken Error Dashboard'] || []
                const totalAdsDisapprovals = brokenData.reduce((sum, item) => sum + item.adsDisapprovals, 0)
                const totalAssetDisapprovals = brokenData.reduce((sum, item) => sum + item.assetDisapprovals, 0)
                const totalConversionIssues = brokenData.reduce((sum, item) => sum + item.conversionIssues, 0)
                const totalNoEndDates = brokenData.reduce((sum, item) => sum + item.noEndDates, 0)
                return {
                    title: 'Broken Error Dashboard - Critical Issues',
                    data: brokenData,
                    icon: <AlertTriangle className="h-5 w-5" style={{ color: COLORS.danger }} />,
                    summaryMetrics: [
                        { label: 'Total Accounts', value: brokenData.length.toString() },
                        { label: 'Ads Disapprovals', value: totalAdsDisapprovals.toString() },
                        { label: 'Asset Disapprovals', value: totalAssetDisapprovals.toString() },
                        { label: 'Conversion Issues', value: totalConversionIssues.toString() },
                        { label: 'No End Dates', value: totalNoEndDates.toString() }
                    ]
                }
            case 'Soft Error Dashboard':
                const softData = tabsData['Soft Error Dashboard'] || []
                const totalNegativeKeywordConflicts = softData.reduce((sum, item) => sum + item.negativeKeywordConflicts, 0)
                const totalImpressionsOutsideCountry = softData.reduce((sum, item) => sum + item.impressionsOutsideCountry, 0)
                const totalDisplayAppsRunning = softData.reduce((sum, item) => sum + item.displayAppsRunning, 0)
                const totalGeoLocationUS = softData.reduce((sum, item) => sum + item.geoLocationUS, 0)
                return {
                    title: 'Soft Error Dashboard - Setup Issues',
                    data: softData,
                    icon: <Info className="h-5 w-5" style={{ color: COLORS.primary }} />,
                    summaryMetrics: [
                        { label: 'Negative Keyword Conflicts', value: totalNegativeKeywordConflicts.toString() },
                        { label: 'Impressions Outside Country', value: totalImpressionsOutsideCountry.toString() },
                        { label: 'Display Apps Running', value: totalDisplayAppsRunning.toString() },
                        { label: 'Geo Location US', value: totalGeoLocationUS.toString() }
                    ]
                }
            default:
                return { title: '', data: [], icon: null, summaryMetrics: [] }
        }
    }

    const tabInfo = getTabData()

    return (
        <div className="container mx-auto px-4 py-12 mt-16">
            <h1 className="text-3xl font-bold mb-8 text-gray-900">Alerts Dashboard</h1>

            {/* Tab Navigation */}
            <div className="flex flex-wrap gap-2 mb-8">
                {[
                    { key: 'Dashboard', label: 'Dashboard' },
                    { key: 'Dashboard LivCor', label: 'Dashboard LivCor' },
                    { key: 'All Error Score Card', label: 'All Error Score Card' },
                    { key: 'Broken Error Dashboard', label: 'Broken Errors' },
                    { key: 'Soft Error Dashboard', label: 'Soft Errors' }
                ].map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setSelectedTab(tab.key as any)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            selectedTab === tab.key
                                ? 'text-white'
                                : 'text-gray-700 hover:bg-gray-200'
                        }`}
                        style={{
                            backgroundColor: selectedTab === tab.key ? COLORS.primary : COLORS.lightGrey
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Summary Metrics */}
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mb-8">
                {tabInfo.summaryMetrics.map((metric, index) => (
                    <MetricCard
                        key={index}
                        label={metric.label}
                        value={metric.value}
                        metricType="none"
                    />
                ))}
            </div>

            {/* Data Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        {tabInfo.icon}
                        {tabInfo.title}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {tabInfo.data.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    {selectedTab === 'Dashboard' || selectedTab === 'Dashboard LivCor' ? (
                                        <>
                                            <TableHead>Account</TableHead>
                                            <TableHead>Account Code</TableHead>
                                            <TableHead>% Whole Month Media Budget</TableHead>
                                            <TableHead>% Whole Month w/Rollover</TableHead>
                                            <TableHead>% Over Under</TableHead>
                                        </>
                                    ) : selectedTab === 'All Error Score Card' ? (
                                        <>
                                            <TableHead>Account Name</TableHead>
                                            <TableHead>Error Score</TableHead>
                                            <TableHead>Priority</TableHead>
                                            <TableHead>Average</TableHead>
                                            <TableHead>Median</TableHead>
                                        </>
                                    ) : selectedTab === 'Broken Error Dashboard' ? (
                                        <>
                                            <TableHead>Account</TableHead>
                                            <TableHead>Ads Disapprovals</TableHead>
                                            <TableHead>Asset Disapprovals</TableHead>
                                            <TableHead>Conversion Issues</TableHead>
                                            <TableHead>No End Dates</TableHead>
                                        </>
                                    ) : (
                                        <>
                                            <TableHead>Negative Keyword Conflicts</TableHead>
                                            <TableHead>Impressions Outside Country</TableHead>
                                            <TableHead>Display Apps Running</TableHead>
                                            <TableHead>Geo Location &quot;United States&quot;</TableHead>
                                        </>
                                    )}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {tabInfo.data.map((item: any, index: number) => (
                                    <TableRow key={index}>
                                        {selectedTab === 'Dashboard' || selectedTab === 'Dashboard LivCor' ? (
                                            <>
                                                <TableCell className="font-medium">{item.account}</TableCell>
                                                <TableCell>{item.accountCode}</TableCell>
                                                <TableCell>{item.wholeMonthMediaBudget.toFixed(2)}%</TableCell>
                                                <TableCell>{item.wholeMonthWithRollover.toFixed(2)}%</TableCell>
                                                <TableCell>{item.overUnder.toFixed(2)}%</TableCell>
                                            </>
                                        ) : selectedTab === 'All Error Score Card' ? (
                                            <>
                                                <TableCell className="font-medium">{item.accountName}</TableCell>
                                                <TableCell className="font-bold">{item.errorScore.toFixed(1)}</TableCell>
                                                <TableCell>
                                                    {item.errorScore > 6 ? <Badge variant="destructive">Critical</Badge> :
                                                     item.errorScore > 4 ? <Badge variant="secondary">High</Badge> :
                                                     item.errorScore > 2 ? <Badge variant="outline">Medium</Badge> :
                                                     <Badge variant="default">Low</Badge>}
                                                </TableCell>
                                                <TableCell>{item.average?.toFixed(2) || '-'}</TableCell>
                                                <TableCell>{item.median?.toFixed(1) || '-'}</TableCell>
                                            </>
                                        ) : selectedTab === 'Broken Error Dashboard' ? (
                                            <>
                                                <TableCell className="font-medium">{item.zeroSpenders}</TableCell>
                                                <TableCell className={item.adsDisapprovals > 0 ? 'text-red-600 font-bold' : ''}>
                                                    {item.adsDisapprovals}
                                                </TableCell>
                                                <TableCell className={item.assetDisapprovals > 0 ? 'text-red-600 font-bold' : ''}>
                                                    {item.assetDisapprovals}
                                                </TableCell>
                                                <TableCell className={item.conversionIssues > 0 ? 'text-red-600 font-bold' : ''}>
                                                    {item.conversionIssues}
                                                </TableCell>
                                                <TableCell className={item.noEndDates > 0 ? 'text-red-600 font-bold' : ''}>
                                                    {item.noEndDates}
                                                </TableCell>
                                            </>
                                        ) : (
                                            <>
                                                <TableCell className={item.negativeKeywordConflicts > 0 ? 'text-blue-600 font-medium' : ''}>
                                                    {item.negativeKeywordConflicts}
                                                </TableCell>
                                                <TableCell className={item.impressionsOutsideCountry > 0 ? 'text-blue-600 font-medium' : ''}>
                                                    {item.impressionsOutsideCountry}
                                                </TableCell>
                                                <TableCell className={item.displayAppsRunning > 0 ? 'text-blue-600 font-medium' : ''}>
                                                    {item.displayAppsRunning}
                                                </TableCell>
                                                <TableCell className={item.geoLocationUS > 0 ? 'text-blue-600 font-medium' : ''}>
                                                    {item.geoLocationUS}
                                                </TableCell>
                                            </>
                                        )}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="text-center py-8 text-gray-500">No data available</div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
} 