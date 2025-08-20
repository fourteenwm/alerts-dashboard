'use client'

import { useEffect, useState } from 'react'
import { useSettings } from '@/lib/contexts/SettingsContext'
import { BrokenErrorDashboardMetric } from '@/lib/types'
import { MetricCard } from '@/components/MetricCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AlertTriangle, AlertCircle } from 'lucide-react'
import { COLORS } from '@/lib/config'

function DashboardLayout({ children, error }: { children: React.ReactNode, error?: string }) {
  return (
    <div className="container mx-auto px-4 py-12 mt-16">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold" style={{ color: COLORS.primary }}>Broken Error Dashboard</h1>
      </div>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      {children}
    </div>
  )
}

export default function BrokenErrorDashboardPage() {
  const { settings, fetchedData, dataError, isDataLoading } = useSettings()
  const [errorData, setErrorData] = useState<BrokenErrorDashboardMetric[]>([])

  useEffect(() => {
    if (fetchedData?.['Broken Error Dashboard']) {
      setErrorData(fetchedData['Broken Error Dashboard'])
    }
  }, [fetchedData])

  if (isDataLoading) return <DashboardLayout>Loading...</DashboardLayout>
  if (!settings.sheetUrl) return <DashboardLayout>Please configure your Google Sheet URL in settings</DashboardLayout>
  if (dataError) return <DashboardLayout error={'Failed to load data. Please check your Sheet URL.'}><></></DashboardLayout>
  if (errorData.length === 0 && !isDataLoading) return <DashboardLayout>No data found</DashboardLayout>

  // Calculate summary metrics
  const totalAccounts = errorData.length
  const totalAdsDisapprovals = errorData.reduce((sum, item) => sum + item.adsDisapprovals, 0)
  const totalAssetDisapprovals = errorData.reduce((sum, item) => sum + item.assetDisapprovals, 0)
  const totalConversionIssues = errorData.reduce((sum, item) => sum + item.conversionIssues, 0)
  const totalNoEndDates = errorData.reduce((sum, item) => sum + item.noEndDates, 0)

  // Filter accounts with critical issues
  const criticalAccounts = errorData.filter(item => 
    item.adsDisapprovals > 0 || 
    item.assetDisapprovals > 0 || 
    item.conversionIssues > 0 || 
    item.noEndDates > 0
  )

  return (
    <DashboardLayout error={dataError ? 'Failed to load data. Please check your Sheet URL.' : undefined}>
      <div className="space-y-6">
        <div className="grid gap-4 grid-cols-1 md:grid-cols-5">
          <MetricCard
            label="Total Accounts"
            value={totalAccounts.toString()}
            metricType="none"
          />
          <MetricCard
            label="Ads Disapprovals"
            value={totalAdsDisapprovals.toString()}
            metricType="none"
          />
          <MetricCard
            label="Asset Disapprovals"
            value={totalAssetDisapprovals.toString()}
            metricType="none"
          />
          <MetricCard
            label="Conversion Issues"
            value={totalConversionIssues.toString()}
            metricType="none"
          />
          <MetricCard
            label="No End Dates"
            value={totalNoEndDates.toString()}
            metricType="none"
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Broken Error Dashboard - Critical Issues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Account</TableHead>
                  <TableHead>Ads Disapprovals</TableHead>
                  <TableHead>Asset Disapprovals</TableHead>
                  <TableHead>Conversion Issues</TableHead>
                  <TableHead>No End Dates</TableHead>
                  <TableHead>Total Issues</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {criticalAccounts.map((item, index) => {
                  const totalIssues = item.adsDisapprovals + item.assetDisapprovals + item.conversionIssues + item.noEndDates
                  return (
                    <TableRow key={index} className={totalIssues > 10 ? 'bg-red-50' : 'bg-yellow-50'}>
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
                      <TableCell className="font-bold">
                        {totalIssues}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}


