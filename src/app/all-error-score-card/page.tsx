'use client'

import { useEffect, useState } from 'react'
import { useSettings } from '@/lib/contexts/SettingsContext'
import { AllErrorScoreCardMetric } from '@/lib/types'
import { MetricCard } from '@/components/MetricCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { COLORS } from '@/lib/config'
import { 
  ErrorDistributionChart,
  ErrorScoreTrendChart,
  ErrorScoreScatterChart,
  CriticalAccountsList,
  ErrorScoreHeatmap,
  ErrorPriorityIndicator
} from '@/components/ErrorVisualizations'

function DashboardLayout({ children, error }: { children: React.ReactNode, error?: string }) {
  return (
    <div className="container mx-auto px-4 py-12 mt-16">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold" style={{ color: COLORS.primary }}>
          All Error Score Card - Enhanced Analytics
        </h1>
      </div>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      {children}
    </div>
  )
}

export default function AllErrorScoreCardPage() {
  const { settings, fetchedData, dataError, isDataLoading } = useSettings()
  const [errorData, setErrorData] = useState<AllErrorScoreCardMetric[]>([])
  const [selectedView, setSelectedView] = useState<'overview' | 'detailed' | 'critical'>('overview')

  useEffect(() => {
    if (fetchedData?.['All Error Score Card']) {
      setErrorData(fetchedData['All Error Score Card'])
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
  const lowPriorityAccounts = errorData.filter(item => item.errorScore <= 2).length

  // Performance insights
  const mediumPriorityAccounts = errorData.filter(item => item.errorScore > 2 && item.errorScore <= 4).length

  return (
    <DashboardLayout error={dataError ? 'Failed to load data. Please check your Sheet URL.' : undefined}>
      <div className="space-y-6">
        {/* Enhanced Summary Metrics */}
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-5">
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
            label="Critical Priority"
            value={criticalAccounts.toString()}
            metricType="none"
            className={criticalAccounts > 0 ? "border-red-200 bg-red-50" : ""}
          />
          <MetricCard
            label="High Priority"
            value={highPriorityAccounts.toString()}
            metricType="none"
            className={highPriorityAccounts > 0 ? "border-orange-200 bg-orange-50" : ""}
          />
          <MetricCard
            label="Low Priority"
            value={lowPriorityAccounts.toString()}
            metricType="none"
            className={lowPriorityAccounts > 0 ? "border-green-200 bg-green-50" : ""}
          />
        </div>

        {/* Priority Overview Cards */}
        <div className="grid gap-4 grid-cols-1 md:grid-cols-4">
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{lowPriorityAccounts}</div>
                <div className="text-sm text-green-700">Low Priority (0-2)</div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{mediumPriorityAccounts}</div>
                <div className="text-sm text-yellow-700">Medium Priority (2-4)</div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{highPriorityAccounts}</div>
                <div className="text-sm text-orange-700">High Priority (4-6)</div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{criticalAccounts}</div>
                <div className="text-sm text-red-700">Critical Priority (6+)</div>
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
              <ErrorDistributionChart data={errorData} />
              <ErrorScoreHeatmap data={errorData} />
            </div>
            <ErrorScoreTrendChart data={errorData} />
            <ErrorScoreScatterChart data={errorData} />
          </div>
        )}

        {/* Detailed Table View */}
        {selectedView === 'detailed' && (
          <Card>
            <CardHeader>
              <CardTitle>Detailed Account Error Scores</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Account Name</TableHead>
                      <TableHead>Error Score</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Average</TableHead>
                      <TableHead>Median</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {errorData
                      .sort((a, b) => b.errorScore - a.errorScore)
                      .map((item, index) => {
                        const getPriority = (score: number) => {
                          if (score > 6) return { label: 'Critical', color: 'destructive' }
                          if (score > 4) return { label: 'High', color: 'secondary' }
                          if (score > 2) return { label: 'Medium', color: 'outline' }
                          return { label: 'Low', color: 'default' }
                        }
                        const priority = getPriority(item.errorScore)
                        
                        return (
                          <TableRow 
                            key={index}
                            className={
                              item.errorScore > 6
                                ? 'bg-red-50'
                                : item.errorScore > 4
                                ? 'bg-orange-50'
                                : item.errorScore > 2
                                ? 'bg-yellow-50'
                                : 'bg-green-50'
                            }
                          >
                            <TableCell className="font-medium">{item.accountName}</TableCell>
                            <TableCell className="font-bold">{item.errorScore.toFixed(1)}</TableCell>
                            <TableCell>
                              <Badge variant={priority.color as any}>{priority.label}</Badge>
                            </TableCell>
                            <TableCell>{item.average?.toFixed(2) || '-'}</TableCell>
                            <TableCell>{item.median?.toFixed(1) || '-'}</TableCell>
                            <TableCell>
                              <ErrorPriorityIndicator
                                errorScore={item.errorScore}
                                accountName={item.accountName}
                                average={item.average}
                                median={item.median}
                              />
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
          <CriticalAccountsList data={errorData} />
        )}
      </div>
    </DashboardLayout>
  )
}


