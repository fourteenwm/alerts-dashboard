'use client'

import React from 'react'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  AreaChart,
  Area
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { COLORS } from '@/lib/config'
import { AllErrorScoreCardMetric } from '@/lib/types'

interface ErrorScoreBarProps {
  score: number
  maxScore: number
  label: string
  color?: string
}

export function ErrorScoreBar({ score, maxScore, label, color = COLORS.primary }: ErrorScoreBarProps) {
  // Add safety check for undefined/null score
  if (score === undefined || score === null) {
    return (
      <div className="w-full">
        <div className="flex justify-between text-sm mb-1">
          <span className="font-medium">{label}</span>
          <span className="text-gray-600">N/A</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="h-2 rounded-full bg-gray-300" style={{ width: '0%' }} />
        </div>
      </div>
    )
  }

  const percentage = Math.min((score / maxScore) * 100, 100)
  
  return (
    <div className="w-full">
      <div className="flex justify-between text-sm mb-1">
        <span className="font-medium">{label}</span>
        <span className="text-gray-600">{score.toFixed(1)}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="h-2 rounded-full transition-all duration-300"
          style={{ 
            width: `${percentage}%`, 
            backgroundColor: color,
            opacity: percentage > 100 ? 0.8 : 1
          }}
        />
      </div>
    </div>
  )
}

interface ErrorPriorityIndicatorProps {
  errorScore: number
  accountName: string
  average?: number
  median?: number
}

export function ErrorPriorityIndicator({ errorScore, accountName, average, median }: ErrorPriorityIndicatorProps) {
  const getPriority = (score: number) => {
    if (score > 6) return 'critical'
    if (score > 4) return 'high'
    if (score > 2) return 'medium'
    return 'low'
  }

  const priority = getPriority(errorScore)
  const priorityConfig = {
    critical: { color: COLORS.danger, label: 'Critical', bg: 'bg-red-50', border: 'border-red-200' },
    high: { color: COLORS.warning, label: 'High', bg: 'bg-orange-50', border: 'border-orange-200' },
    medium: { color: COLORS.secondary, label: 'Medium', bg: 'bg-yellow-50', border: 'border-yellow-200' },
    low: { color: COLORS.success, label: 'Low', bg: 'bg-green-50', border: 'border-green-200' }
  }

  const config = priorityConfig[priority]

  return (
    <div className={`p-3 rounded-lg border ${config.bg} ${config.border}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium text-sm">{accountName}</span>
        <Badge style={{ backgroundColor: config.color, color: 'white' }}>
          {config.label}
        </Badge>
      </div>
      <div className="space-y-2">
        <ErrorScoreBar score={errorScore} maxScore={10} label="Error Score" color={config.color} />
        {average && (
          <div className="text-xs text-gray-500">
            Average: {average.toFixed(2)} | Median: {median?.toFixed(1) || 'N/A'}
          </div>
        )}
      </div>
    </div>
  )
}

interface ErrorDistributionChartProps {
  data: AllErrorScoreCardMetric[]
}

export function ErrorDistributionChart({ data }: ErrorDistributionChartProps) {
  const chartData = [
    { name: 'Low Priority (0-2)', value: data.filter(d => d.errorScore <= 2).length, color: COLORS.success },
    { name: 'Medium Priority (2-4)', value: data.filter(d => d.errorScore > 2 && d.errorScore <= 4).length, color: COLORS.secondary },
    { name: 'High Priority (4-6)', value: data.filter(d => d.errorScore > 4 && d.errorScore <= 6).length, color: COLORS.warning },
    { name: 'Critical Priority (6+)', value: data.filter(d => d.errorScore > 6).length, color: COLORS.danger }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Error Score Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

interface ErrorScoreTrendChartProps {
  data: AllErrorScoreCardMetric[]
}

export function ErrorScoreTrendChart({ data }: ErrorScoreTrendChartProps) {
  // Sort by error score and take top 15 for better visualization
  const chartData = [...data]
    .sort((a, b) => b.errorScore - a.errorScore)
    .slice(0, 15)
    .map((item, index) => ({
      account: item.accountName,
      errorScore: item.errorScore,
      average: item.average || 0,
      rank: index + 1
    }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top 15 Error Scores by Account</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="account" 
              angle={-45}
              textAnchor="end"
              height={80}
              interval={0}
              tick={{ fontSize: 10 }}
            />
            <YAxis domain={[0, 10]} />
            <Tooltip 
              content={({ payload }) => {
                if (payload && payload.length > 0) {
                  const data = payload[0].payload
                  return (
                    <div className="bg-white p-2 border rounded shadow">
                      <p className="font-medium">{data.account}</p>
                      <p>Error Score: {data.errorScore.toFixed(1)}</p>
                      <p>Rank: #{data.rank}</p>
                      <p>Average: {data.average.toFixed(2)}</p>
                    </div>
                  )
                }
                return null
              }}
            />
            <Bar dataKey="errorScore" fill={COLORS.primary} name="Error Score" />
            <Bar dataKey="average" fill={COLORS.secondary} name="Average" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

interface ErrorScoreScatterChartProps {
  data: AllErrorScoreCardMetric[]
}

export function ErrorScoreScatterChart({ data }: ErrorScoreScatterChartProps) {
  const chartData = data
    .filter(item => item.average && item.median) // Only show items with both average and median
    .map(item => ({
      account: item.accountName,
      errorScore: item.errorScore,
      average: item.average || 0,
      median: item.median || 0
    }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Error Score vs Average Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <ScatterChart
            margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
          >
            <CartesianGrid />
            <XAxis 
              type="number" 
              dataKey="errorScore" 
              name="Error Score" 
              domain={[0, 10]}
              label={{ value: 'Error Score', position: 'insideBottom', offset: -10 }}
            />
            <YAxis 
              type="number" 
              dataKey="average" 
              name="Average" 
              domain={[0, 10]}
              label={{ value: 'Average', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip 
              cursor={{ strokeDasharray: '3 3' }}
              content={({ payload }) => {
                if (payload && payload.length > 0) {
                  const data = payload[0].payload
                  const priority = data.errorScore > 6 ? 'Critical' : data.errorScore > 4 ? 'High' : data.errorScore > 2 ? 'Medium' : 'Low'
                  return (
                    <div className="bg-white p-2 border rounded shadow">
                      <p className="font-medium">{data.account}</p>
                      <p>Error Score: {data.errorScore.toFixed(1)}</p>
                      <p>Average: {data.average.toFixed(2)}</p>
                      <p>Median: {data.median.toFixed(1)}</p>
                      <p className={`font-semibold ${
                        priority === 'Critical' ? 'text-red-600' : 
                        priority === 'High' ? 'text-orange-600' : 
                        priority === 'Medium' ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        Priority: {priority}
                      </p>
                    </div>
                  )
                }
                return null
              }}
            />
            <Scatter data={chartData} fill={COLORS.primary} />
          </ScatterChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

interface CriticalAccountsListProps {
  data: AllErrorScoreCardMetric[]
}

export function CriticalAccountsList({ data }: CriticalAccountsListProps) {
  const criticalAccounts = data
    .filter(item => item.errorScore > 6)
    .sort((a, b) => b.errorScore - a.errorScore)

  const highPriorityAccounts = data
    .filter(item => item.errorScore > 4 && item.errorScore <= 6)
    .sort((a, b) => b.errorScore - a.errorScore)

  if (criticalAccounts.length === 0 && highPriorityAccounts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Critical & High Priority Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-green-600">
            <p className="text-lg font-medium">🎉 No critical or high priority accounts!</p>
            <p className="text-sm">All accounts have error scores below 4.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Critical Accounts */}
      {criticalAccounts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>Critical Priority Accounts (Score &gt; 6)</span>
              <Badge variant="destructive">{criticalAccounts.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {criticalAccounts.map((account, index) => (
                <ErrorPriorityIndicator
                  key={index}
                  errorScore={account.errorScore}
                  accountName={account.accountName}
                  average={account.average}
                  median={account.median}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* High Priority Accounts */}
      {highPriorityAccounts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>High Priority Accounts (Score 4-6)</span>
              <Badge variant="secondary">{highPriorityAccounts.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {highPriorityAccounts.map((account, index) => (
                <ErrorPriorityIndicator
                  key={index}
                  errorScore={account.errorScore}
                  accountName={account.accountName}
                  average={account.average}
                  median={account.median}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

interface ErrorScoreHeatmapProps {
  data: AllErrorScoreCardMetric[]
}

export function ErrorScoreHeatmap({ data }: ErrorScoreHeatmapProps) {
  // Create score ranges for heatmap
  const scoreRanges = [
    { range: '0-1', count: data.filter(d => d.errorScore >= 0 && d.errorScore < 1).length, color: COLORS.success },
    { range: '1-2', count: data.filter(d => d.errorScore >= 1 && d.errorScore < 2).length, color: COLORS.success },
    { range: '2-3', count: data.filter(d => d.errorScore >= 2 && d.errorScore < 3).length, color: COLORS.secondary },
    { range: '3-4', count: data.filter(d => d.errorScore >= 3 && d.errorScore < 4).length, color: COLORS.secondary },
    { range: '4-5', count: data.filter(d => d.errorScore >= 4 && d.errorScore < 5).length, color: COLORS.warning },
    { range: '5-6', count: data.filter(d => d.errorScore >= 5 && d.errorScore < 6).length, color: COLORS.warning },
    { range: '6-7', count: data.filter(d => d.errorScore >= 6 && d.errorScore < 7).length, color: COLORS.danger },
    { range: '7+', count: data.filter(d => d.errorScore >= 7).length, color: COLORS.danger }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Error Score Heatmap</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-2">
          {scoreRanges.map((range, index) => (
            <div
              key={index}
              className="p-3 rounded-lg text-center"
              style={{ backgroundColor: range.color, color: 'white' }}
            >
              <div className="text-lg font-bold">{range.count}</div>
              <div className="text-sm">{range.range}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 text-sm text-gray-600">
          <div className="flex items-center justify-center space-x-4">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: COLORS.success }}></div>
              <span>Low (0-2)</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: COLORS.secondary }}></div>
              <span>Medium (2-4)</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: COLORS.warning }}></div>
              <span>High (4-6)</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: COLORS.danger }}></div>
              <span>Critical (6+)</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
