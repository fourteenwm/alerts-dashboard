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
  Scatter
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { COLORS } from '@/lib/config'
import { DashboardLiveCoreMetric } from '@/lib/types'

interface ProgressBarProps {
  value: number
  maxValue: number
  label: string
  color?: string
}

export function ProgressBar({ value, maxValue, label, color = COLORS.primary }: ProgressBarProps) {
  const percentage = Math.min((value / maxValue) * 100, 100)
  
  return (
    <div className="w-full">
      <div className="flex justify-between text-sm mb-1">
        <span className="font-medium">{label}</span>
        <span className="text-gray-600">{value.toFixed(1)}%</span>
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

interface StatusIndicatorProps {
  budget: number
  rollover: number
  account: string
  monthProgress: number
}

export function StatusIndicator({ budget, rollover, account, monthProgress }: StatusIndicatorProps) {
  const getStatus = (budget: number, rollover: number, monthProgress: number) => {
    const budgetDeviation = Math.abs(budget - monthProgress)
    const rolloverDeviation = Math.abs(rollover - monthProgress)
    
    // 8% tolerance: compare budget/rollover to month progress
    if (budgetDeviation > 8 || rolloverDeviation > 8) return 'critical'
    if (budgetDeviation > 5 || rolloverDeviation > 5) return 'warning'
    return 'good'
  }

  const status = getStatus(budget, rollover, monthProgress)
  const statusConfig = {
    critical: { color: COLORS.danger, label: 'Critical', bg: 'bg-red-50', border: 'border-red-200' },
    warning: { color: COLORS.warning, label: 'Warning', bg: 'bg-yellow-50', border: 'border-yellow-200' },
    good: { color: COLORS.success, label: 'Good', bg: 'bg-green-50', border: 'border-green-200' }
  }

  const config = statusConfig[status]
  const budgetDeviation = Math.abs(budget - monthProgress)
  const rolloverDeviation = Math.abs(rollover - monthProgress)

  return (
    <div className={`p-3 rounded-lg border ${config.bg} ${config.border}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium text-sm">{account}</span>
        <Badge style={{ backgroundColor: config.color, color: 'white' }}>
          {config.label}
        </Badge>
      </div>
      <div className="space-y-2">
        <ProgressBar value={budget} maxValue={100} label={`Budget (${budgetDeviation.toFixed(1)}% off)`} color={config.color} />
        <ProgressBar value={rollover} maxValue={100} label={`Rollover (${rolloverDeviation.toFixed(1)}% off)`} color={config.color} />
        <div className="text-xs text-gray-500 mt-1">
          Month Progress: {monthProgress.toFixed(1)}%
        </div>
      </div>
    </div>
  )
}

interface BudgetDistributionChartProps {
  data: DashboardLiveCoreMetric[]
  monthProgress: number
}

export function BudgetDistributionChart({ data, monthProgress }: BudgetDistributionChartProps) {
  const chartData = [
    { 
      name: 'Under Budget (>8% behind)', 
      value: data.filter(d => (monthProgress - d.wholeMonthMediaBudget) > 8).length, 
      color: COLORS.danger 
    },
    { 
      name: 'On Target (within 8%)', 
      value: data.filter(d => Math.abs(d.wholeMonthMediaBudget - monthProgress) <= 8).length, 
      color: COLORS.success 
    },
    { 
      name: 'Over Budget (>8% ahead)', 
      value: data.filter(d => (d.wholeMonthMediaBudget - monthProgress) > 8).length, 
      color: COLORS.danger 
    }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget vs Month Progress Distribution (8% Tolerance)</CardTitle>
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

interface PerformanceScatterChartProps {
  data: DashboardLiveCoreMetric[]
  monthProgress: number
}

export function PerformanceScatterChart({ data, monthProgress }: PerformanceScatterChartProps) {
  const chartData = data.map(item => ({
    budget: item.wholeMonthMediaBudget,
    rollover: item.wholeMonthWithRollover,
    account: item.account,
    budgetDeviation: Math.abs(item.wholeMonthMediaBudget - monthProgress),
    rolloverDeviation: Math.abs(item.wholeMonthWithRollover - monthProgress)
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget vs Rollover Performance (vs Month Progress)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <ScatterChart
            margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
          >
            <CartesianGrid />
            <XAxis 
              type="number" 
              dataKey="budget" 
              name="Budget %" 
              domain={[0, 120]}
              label={{ value: 'Budget %', position: 'insideBottom', offset: -10 }}
            />
            <YAxis 
              type="number" 
              dataKey="rollover" 
              name="Rollover %" 
              domain={[0, 120]}
              label={{ value: 'Rollover %', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip 
              cursor={{ strokeDasharray: '3 3' }}
              content={({ payload }) => {
                if (payload && payload.length > 0) {
                  const data = payload[0].payload
                  const budgetStatus = data.budgetDeviation <= 8 ? 'Good' : 'Critical'
                  const rolloverStatus = data.rolloverDeviation <= 8 ? 'Good' : 'Critical'
                  return (
                    <div className="bg-white p-2 border rounded shadow">
                      <p className="font-medium">{data.account}</p>
                      <p>Budget: {data.budget.toFixed(1)}% (vs {monthProgress.toFixed(1)}% month)</p>
                      <p>Rollover: {data.rollover.toFixed(1)}% (vs {monthProgress.toFixed(1)}% month)</p>
                      <p className={`font-semibold ${budgetStatus === 'Good' ? 'text-green-600' : 'text-red-600'}`}>
                        Budget: {budgetStatus} ({data.budgetDeviation.toFixed(1)}% off)
                      </p>
                      <p className={`font-semibold ${rolloverStatus === 'Good' ? 'text-green-600' : 'text-red-600'}`}>
                        Rollover: {rolloverStatus} ({data.rolloverDeviation.toFixed(1)}% off)
                      </p>
                    </div>
                  )
                }
                return null
              }}
            />
            <Scatter data={chartData} fill={COLORS.primary} />
            {/* Add reference line for month progress */}
            <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
          </ScatterChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

interface TopPerformersChartProps {
  data: DashboardLiveCoreMetric[]
  monthProgress: number
}

export function TopPerformersChart({ data, monthProgress }: TopPerformersChartProps) {
  // Sort by how close to month progress (perfect pacing)
  const sortedData = [...data]
    .sort((a, b) => {
      const aDeviation = Math.abs(a.wholeMonthMediaBudget - monthProgress)
      const bDeviation = Math.abs(b.wholeMonthMediaBudget - monthProgress)
      return aDeviation - bDeviation
    })
    .slice(0, 10)
    .map(item => ({
      account: item.account,
      budget: item.wholeMonthMediaBudget,
      rollover: item.wholeMonthWithRollover,
      deviation: Math.abs(item.wholeMonthMediaBudget - monthProgress)
    }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top 10 Pacing Performers (Closest to Month Progress)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={sortedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="account" 
              angle={-45}
              textAnchor="end"
              height={80}
              interval={0}
              tick={{ fontSize: 10 }}
            />
            <YAxis domain={[0, 120]} />
            <Tooltip 
              content={({ payload }) => {
                if (payload && payload.length > 0) {
                  const data = payload[0].payload
                  return (
                    <div className="bg-white p-2 border rounded shadow">
                      <p className="font-medium">{data.account}</p>
                      <p>Budget: {data.budget.toFixed(1)}%</p>
                      <p>Rollover: {data.rollover.toFixed(1)}%</p>
                      <p>Month Progress: {monthProgress.toFixed(1)}%</p>
                      <p>Deviation: {data.deviation.toFixed(1)}% from target</p>
                    </div>
                  )
                }
                return null
              }}
            />
            <Bar dataKey="budget" fill={COLORS.primary} name="Budget %" />
            <Bar dataKey="rollover" fill={COLORS.secondary} name="Rollover %" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

interface CriticalAccountsListProps {
  data: DashboardLiveCoreMetric[]
  monthProgress: number
}

export function CriticalAccountsList({ data, monthProgress }: CriticalAccountsListProps) {
  // Critical accounts are those outside the 8% tolerance compared to month progress
  const criticalAccounts = data
    .filter(item => {
      const budgetDeviation = Math.abs(item.wholeMonthMediaBudget - monthProgress)
      const rolloverDeviation = Math.abs(item.wholeMonthWithRollover - monthProgress)
      return budgetDeviation > 8 || rolloverDeviation > 8
    })
    .sort((a, b) => {
      const aMaxDeviation = Math.max(
        Math.abs(a.wholeMonthMediaBudget - monthProgress),
        Math.abs(a.wholeMonthWithRollover - monthProgress)
      )
      const bMaxDeviation = Math.max(
        Math.abs(b.wholeMonthMediaBudget - monthProgress),
        Math.abs(b.wholeMonthWithRollover - monthProgress)
      )
      return bMaxDeviation - aMaxDeviation
    })

  if (criticalAccounts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Critical Accounts (Outside 8% Tolerance vs Month Progress)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-green-600">
            <p className="text-lg font-medium">🎉 No critical accounts!</p>
            <p className="text-sm">All accounts are within 8% of month progress ({monthProgress.toFixed(1)}%).</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>Critical Accounts (Outside 8% Tolerance vs Month Progress)</span>
          <Badge variant="destructive">{criticalAccounts.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {criticalAccounts.map((account, index) => (
            <StatusIndicator
              key={index}
              budget={account.wholeMonthMediaBudget}
              rollover={account.wholeMonthWithRollover}
              account={account.account}
              monthProgress={monthProgress}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
