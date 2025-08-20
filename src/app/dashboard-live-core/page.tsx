'use client'

import { useEffect, useState } from 'react'
import { useSettings } from '@/lib/contexts/SettingsContext'
import { DashboardLiveCoreMetric } from '@/lib/types'
import { MetricCard } from '@/components/MetricCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { 
  BudgetDistributionChart,
  PerformanceScatterChart,
  TopPerformersChart,
  CriticalAccountsList,
  StatusIndicator
} from '@/components/DataVisualizations'
import { COLORS } from '@/lib/config'

function DashboardLayout({ children, error }: { children: React.ReactNode, error?: string }) {
  return (
    <div className="container mx-auto px-4 py-12 mt-16">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold" style={{ color: COLORS.primary }}>
          Dashboard LivCor - Enhanced Analytics (8% Tolerance vs Month Progress)
        </h1>
      </div>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      {children}
    </div>
  )
}

export default function DashboardLiveCorePage() {
  const { settings, fetchedData, dataError, isDataLoading } = useSettings()
  const [dashboardData, setDashboardData] = useState<DashboardLiveCoreMetric[]>([])
  const [selectedView, setSelectedView] = useState<'overview' | 'detailed' | 'critical'>('overview')

  useEffect(() => {
    if (fetchedData?.['Dashboard LivCor']) {
      setDashboardData(fetchedData['Dashboard LivCor'])
    }
  }, [fetchedData])

  if (isDataLoading) return <DashboardLayout>Loading...</DashboardLayout>
  if (!settings.sheetUrl) return <DashboardLayout>Please configure your Google Sheet URL in settings</DashboardLayout>
  if (dataError) return <DashboardLayout error={'Failed to load data. Please check your Sheet URL.'}><></></DashboardLayout>
  if (dashboardData.length === 0 && !isDataLoading) return <DashboardLayout>No data found</DashboardLayout>

  // Get month progress from the data
  const monthProgress = fetchedData?.['Dashboard LivCor']?.[0]?.monthProgress || 0

  // Calculate summary metrics with 8% tolerance vs month progress
  const totalAccounts = dashboardData.length
  const avgMediaBudget = dashboardData.reduce((sum, item) => sum + item.wholeMonthMediaBudget, 0) / totalAccounts
  const avgRollover = dashboardData.reduce((sum, item) => sum + item.wholeMonthWithRollover, 0) / totalAccounts
  
  // Critical accounts are those outside 8% tolerance compared to month progress
  const criticalAccounts = dashboardData.filter(item => {
    const budgetDeviation = Math.abs(item.wholeMonthMediaBudget - monthProgress)
    const rolloverDeviation = Math.abs(item.wholeMonthWithRollover - monthProgress)
    return budgetDeviation > 8 || rolloverDeviation > 8
  }).length

  // Performance insights with 8% tolerance vs month progress
  const underBudgetCount = dashboardData.filter(d => (monthProgress - d.wholeMonthMediaBudget) > 8).length
  const onTargetCount = dashboardData.filter(d => Math.abs(d.wholeMonthMediaBudget - monthProgress) <= 8).length
  const overBudgetCount = dashboardData.filter(d => (d.wholeMonthMediaBudget - monthProgress) > 8).length

  return (
    <DashboardLayout error={dataError ? 'Failed to load data. Please check your Sheet URL.' : undefined}>
      <div className="space-y-6">
        {/* Enhanced Summary Metrics */}
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="Total LivCor Accounts"
            value={totalAccounts.toString()}
            metricType="none"
          />
          <MetricCard
            label="Month Progress"
            value={`${monthProgress.toFixed(1)}%`}
            metricType="none"
          />
          <MetricCard
            label="Critical Accounts"
            value={criticalAccounts.toString()}
            metricType="none"
            className={criticalAccounts > 0 ? "border-red-200 bg-red-50" : ""}
          />
          <MetricCard
            label="Avg Budget %"
            value={`${avgMediaBudget.toFixed(1)}%`}
            metricType="none"
          />
        </div>

        {/* Performance Overview Cards with 8% Tolerance vs Month Progress */}
        <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{underBudgetCount}</div>
                <div className="text-sm text-red-700">Behind Schedule (&gt;8% behind)</div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{onTargetCount}</div>
                <div className="text-sm text-green-700">On Schedule (within 8%)</div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{overBudgetCount}</div>
                <div className="text-sm text-red-700">Ahead of Schedule (&gt;8% ahead)</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* View Toggle */}
        <div className="flex space-x-2">
          <button
            onClick={() => setSelectedView('overview')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedView === 'overview'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setSelectedView('detailed')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedView === 'detailed'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Detailed Table
          </button>
          <button
            onClick={() => setSelectedView('critical')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedView === 'critical'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Critical Accounts
          </button>
        </div>

        {/* Overview View - Charts and Visualizations */}
        {selectedView === 'overview' && (
          <div className="space-y-6">
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
              <BudgetDistributionChart data={dashboardData} monthProgress={monthProgress} />
              <PerformanceScatterChart data={dashboardData} monthProgress={monthProgress} />
            </div>
            <TopPerformersChart data={dashboardData} monthProgress={monthProgress} />
          </div>
        )}

        {/* Detailed Table View */}
        {selectedView === 'detailed' && (
          <Card>
            <CardHeader>
              <CardTitle>Detailed Account Performance (8% Tolerance vs Month Progress)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Account</TableHead>
                      <TableHead>Account Code</TableHead>
                      <TableHead>Budget %</TableHead>
                      <TableHead>Rollover %</TableHead>
                      <TableHead>Month Progress</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dashboardData.map((item, index) => {
                      const budgetDeviation = Math.abs(item.wholeMonthMediaBudget - monthProgress)
                      const rolloverDeviation = Math.abs(item.wholeMonthWithRollover - monthProgress)
                      
                      const getStatus = (budgetDeviation: number, rolloverDeviation: number) => {
                        if (budgetDeviation > 8 || rolloverDeviation > 8) return { label: 'Critical', color: 'destructive' }
                        if (budgetDeviation > 5 || rolloverDeviation > 5) return { label: 'Warning', color: 'secondary' }
                        return { label: 'Good', color: 'default' }
                      }
                      const status = getStatus(budgetDeviation, rolloverDeviation)
                      
                      return (
                        <TableRow 
                          key={index}
                          className={
                            budgetDeviation > 8 || rolloverDeviation > 8
                              ? 'bg-red-50'
                              : budgetDeviation > 5 || rolloverDeviation > 5
                              ? 'bg-yellow-50'
                              : ''
                          }
                        >
                          <TableCell className="font-medium">{item.account}</TableCell>
                          <TableCell>{item.accountCode}</TableCell>
                          <TableCell className={budgetDeviation > 8 ? 'text-red-600 font-semibold' : ''}>
                            {item.wholeMonthMediaBudget.toFixed(2)}%
                          </TableCell>
                          <TableCell className={rolloverDeviation > 8 ? 'text-red-600 font-semibold' : ''}>
                            {item.wholeMonthWithRollover.toFixed(2)}%
                          </TableCell>
                          <TableCell>{monthProgress.toFixed(1)}%</TableCell>
                          <TableCell>
                            <Badge variant={status.color as any}>{status.label}</Badge>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Critical Accounts View */}
        {selectedView === 'critical' && (
          <CriticalAccountsList data={dashboardData} monthProgress={monthProgress} />
        )}
      </div>
    </DashboardLayout>
  )
}



