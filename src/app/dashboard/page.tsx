'use client'

import { useEffect, useState } from 'react'
import { useSettings } from '@/lib/contexts/SettingsContext'
import { DashboardMetric } from '@/lib/types'
import { MetricCard } from '@/components/MetricCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export default function DashboardPage() {
  const { settings, fetchedData, dataError, isDataLoading } = useSettings()
  const [dashboardData, setDashboardData] = useState<DashboardMetric[]>([])

  useEffect(() => {
    if (fetchedData?.dashboard) {
      setDashboardData(fetchedData.dashboard)
    }
  }, [fetchedData])

  if (isDataLoading) return <DashboardLayout>Loading...</DashboardLayout>
  if (!settings.sheetUrl) return <DashboardLayout>Please configure your Google Sheet URL in settings</DashboardLayout>
  if (dataError) return <DashboardLayout error={'Failed to load data. Please check your Sheet URL.'}><></></DashboardLayout>
  if (dashboardData.length === 0 && !isDataLoading) return <DashboardLayout>No data found</DashboardLayout>

  // Calculate summary metrics
  const totalAccounts = dashboardData.length
  const avgMediaBudget = dashboardData.reduce((sum, item) => sum + item.wholeMonthMediaBudget, 0) / totalAccounts
  const avgRollover = dashboardData.reduce((sum, item) => sum + item.wholeMonthWithRollover, 0) / totalAccounts

  return (
    <DashboardLayout error={dataError ? 'Failed to load data. Please check your Sheet URL.' : undefined}>
      <div className="space-y-6">
        <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
          <MetricCard
            label="Total Accounts"
            value={totalAccounts.toString()}
            metricType="none"
          />
          <MetricCard
            label="Avg Media Budget %"
            value={`${avgMediaBudget.toFixed(2)}%`}
            metricType="none"
          />
          <MetricCard
            label="Avg Rollover %"
            value={`${avgRollover.toFixed(2)}%`}
            metricType="none"
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Dashboard - Non-LivCor Accounts</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Account</TableHead>
                  <TableHead>Account Code</TableHead>
                  <TableHead>% Whole Month Media Budget</TableHead>
                  <TableHead>% Whole Month w/Rollover</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dashboardData.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{item.account}</TableCell>
                    <TableCell>{item.accountCode}</TableCell>
                    <TableCell>{item.wholeMonthMediaBudget.toFixed(2)}%</TableCell>
                    <TableCell>{item.wholeMonthWithRollover.toFixed(2)}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

function DashboardLayout({ children, error }: { children: React.ReactNode, error?: string }) {
  return (
    <div className="container mx-auto px-4 py-12 mt-16">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard - Non-LivCor Accounts</h1>
      </div>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      {children}
    </div>
  )
}


