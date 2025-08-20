'use client'

import { useEffect, useState } from 'react'
import { useSettings } from '@/lib/contexts/SettingsContext'
import { SoftErrorDashboardMetric } from '@/lib/types'
import { MetricCard } from '@/components/MetricCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Info } from 'lucide-react'
import { COLORS } from '@/lib/config'

function DashboardLayout({ children, error }: { children: React.ReactNode, error?: string }) {
  return (
    <div className="container mx-auto px-4 py-12 mt-16">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold" style={{ color: COLORS.primary }}>Soft Error Dashboard</h1>
      </div>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      {children}
    </div>
  )
}

export default function SoftErrorDashboardPage() {
  const { settings, fetchedData, dataError, isDataLoading } = useSettings()
  const [errorData, setErrorData] = useState<SoftErrorDashboardMetric[]>([])

  useEffect(() => {
    if (fetchedData?.['Soft Error Dashboard']) {
      setErrorData(fetchedData['Soft Error Dashboard'])
    }
  }, [fetchedData])

  if (isDataLoading) return <DashboardLayout>Loading...</DashboardLayout>
  if (!settings.sheetUrl) return <DashboardLayout>Please configure your Google Sheet URL in settings</DashboardLayout>
  if (dataError) return <DashboardLayout error={'Failed to load data. Please check your Sheet URL.'}><></></DashboardLayout>
  if (errorData.length === 0 && !isDataLoading) return <DashboardLayout>No data found</DashboardLayout>

  // Calculate summary metrics
  const totalNegativeKeywordConflicts = errorData.reduce((sum, item) => sum + item.negativeKeywordConflicts, 0)
  const totalImpressionsOutsideCountry = errorData.reduce((sum, item) => sum + item.impressionsOutsideCountry, 0)
  const totalDisplayAppsRunning = errorData.reduce((sum, item) => sum + item.displayAppsRunning, 0)
  const totalGeoLocationUS = errorData.reduce((sum, item) => sum + item.geoLocationUS, 0)

  // Filter accounts with soft issues
  const accountsWithIssues = errorData.filter(item => 
    item.negativeKeywordConflicts > 0 || 
    item.impressionsOutsideCountry > 0 || 
    item.displayAppsRunning > 0 || 
    item.geoLocationUS > 0
  )

  return (
    <DashboardLayout error={dataError ? 'Failed to load data. Please check your Sheet URL.' : undefined}>
      <div className="space-y-6">
        <div className="grid gap-4 grid-cols-1 md:grid-cols-4">
          <MetricCard
            label="Negative Keyword Conflicts"
            value={totalNegativeKeywordConflicts.toString()}
            metricType="none"
          />
          <MetricCard
            label="Impressions Outside Country"
            value={totalImpressionsOutsideCountry.toString()}
            metricType="none"
          />
          <MetricCard
            label="Display Apps Running"
            value={totalDisplayAppsRunning.toString()}
            metricType="none"
          />
          <MetricCard
            label="Geo Location US"
            value={totalGeoLocationUS.toString()}
            metricType="none"
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-blue-500" />
              Soft Error Dashboard - Setup Issues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Negative Keyword Conflicts</TableHead>
                  <TableHead>Impressions Outside Country</TableHead>
                  <TableHead>Display Apps Running</TableHead>
                  <TableHead>Geo Location "United States"</TableHead>
                  <TableHead>Total Issues</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accountsWithIssues.map((item, index) => {
                  const totalIssues = item.negativeKeywordConflicts + item.impressionsOutsideCountry + item.displayAppsRunning + item.geoLocationUS
                  return (
                    <TableRow key={index} className="bg-blue-50">
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
                      <TableCell className="font-medium">
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


