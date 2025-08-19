'use client'

import { useEffect, useState } from 'react'
import { useSettings } from '@/lib/contexts/SettingsContext'
import { AllErrorScoreCardMetric } from '@/lib/types'
import { MetricCard } from '@/components/MetricCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

export default function AllErrorScoreCardPage() {
  const { settings, fetchedData, dataError, isDataLoading } = useSettings()
  const [errorData, setErrorData] = useState<AllErrorScoreCardMetric[]>([])

  useEffect(() => {
    if (fetchedData?.allErrorScoreCard) {
      setErrorData(fetchedData.allErrorScoreCard)
    }
  }, [fetchedData])

  if (isDataLoading) return <DashboardLayout>Loading...</DashboardLayout>
  if (!settings.sheetUrl) return <DashboardLayout>Please configure your Google Sheet URL in settings</DashboardLayout>
  if (dataError) return <DashboardLayout error={'Failed to load data. Please check your Sheet URL.'}><></></DashboardLayout>
  if (errorData.length === 0 && !isDataLoading) return <DashboardLayout>No data found</DashboardLayout>

  // Calculate summary metrics
  const totalAccounts = errorData.length
  const avgErrorScore = errorData.reduce((sum, item) => sum + item.errorScore, 0) / totalAccounts
  const highPriorityAccounts = errorData.filter(item => item.errorScore > 4).length
  const criticalAccounts = errorData.filter(item => item.errorScore > 6).length

  // Sort by error score (highest first)
  const sortedData = [...errorData].sort((a, b) => b.errorScore - a.errorScore)

  const getPriorityBadge = (score: number) => {
    if (score > 6) return <Badge variant="destructive">Critical</Badge>
    if (score > 4) return <Badge variant="secondary">High</Badge>
    if (score > 2) return <Badge variant="outline">Medium</Badge>
    return <Badge variant="default">Low</Badge>
  }

  return (
    <DashboardLayout error={dataError ? 'Failed to load data. Please check your Sheet URL.' : undefined}>
      <div className="space-y-6">
        <div className="grid gap-4 grid-cols-1 md:grid-cols-4">
          <MetricCard
            label="Total Accounts"
            value={totalAccounts.toString()}
            metricType="none"
          />
          <MetricCard
            label="Avg Error Score"
            value={avgErrorScore.toFixed(2)}
            metricType="none"
          />
          <MetricCard
            label="High Priority"
            value={highPriorityAccounts.toString()}
            metricType="none"
          />
          <MetricCard
            label="Critical Priority"
            value={criticalAccounts.toString()}
            metricType="none"
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Error Score Card - Account Priority</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Account Name</TableHead>
                  <TableHead>Error Score</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Average</TableHead>
                  <TableHead>Median</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedData.map((item, index) => (
                  <TableRow key={index} className={item.errorScore > 4 ? 'bg-red-50' : ''}>
                    <TableCell className="font-medium">{item.accountName}</TableCell>
                    <TableCell className="font-bold">{item.errorScore.toFixed(1)}</TableCell>
                    <TableCell>{getPriorityBadge(item.errorScore)}</TableCell>
                    <TableCell>{item.average?.toFixed(2) || '-'}</TableCell>
                    <TableCell>{item.median?.toFixed(1) || '-'}</TableCell>
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
        <h1 className="text-3xl font-bold text-gray-900">All Error Score Card</h1>
      </div>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      {children}
    </div>
  )
}


