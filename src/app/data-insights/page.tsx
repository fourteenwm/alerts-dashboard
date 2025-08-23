'use client'

import { useDataInsights } from '@/hooks/useDataInsights'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { ArrowUpDown, Plus, X, Loader2, BarChart3, Filter, Database, Brain, CheckSquare, Square } from 'lucide-react'
import { COLORS } from '@/lib/config'

export default function DataInsightsPage() {
  const {
    // State
    selectedDataSources,
    columns,
    filters,
    sortConfig,
    previewRowCount,
    rowLimitPerSource,
    userPrompt,
    selectedLLM,
    aiResponse,
    isGeneratingInsights,
    error,
    
    // Data
    availableDataSources,
    filteredAndSortedData,
    previewData,
    dataSummary,
    
    // Actions
    setSelectedDataSources,
    toggleDataSource,
    selectAllDataSources,
    clearAllDataSources,
    setPreviewRowCount,
    setRowLimitPerSource,
    setUserPrompt,
    setSelectedLLM,
    addFilter,
    updateFilter,
    removeFilter,
    clearFilters,
    handleSort,
    generateInsights,
    getAvailableOperators,
    
    // Utilities
    hasData,
    canGenerateInsights
  } = useDataInsights()

  return (
    <div className="container mx-auto px-4 py-8 pt-24">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" style={{ color: COLORS.primary }}>
          Data Insights
        </h1>
        <p className="text-gray-600">
          Explore, analyze, and generate AI-powered insights from your advertising data.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Controls */}
        <div className="lg:col-span-1 space-y-6">
          {/* Data Source Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database size={20} />
                Select Data Sources for Analysis
                {selectedDataSources.length > 0 && (
                  <Badge variant="secondary" className="ml-auto">
                    {selectedDataSources.length}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Choose multiple data sources to analyze together
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Data source checkboxes */}
              <div className="space-y-3">
                {availableDataSources.map(source => (
                  <div 
                    key={source.id} 
                    className={`flex items-center gap-3 p-3 rounded-lg border ${
                      source.selected ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
                    } ${source.available ? 'cursor-pointer hover:bg-opacity-80' : 'opacity-50 cursor-not-allowed'}`}
                    onClick={() => source.available && toggleDataSource(source.id)}
                  >
                    <div className="flex-shrink-0">
                      {source.selected ? (
                        <CheckSquare size={20} className="text-blue-600" />
                      ) : (
                        <Square size={20} className="text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">
                        {source.name}
                        {source.id === 'Dashboard LivCor' && (
                          <span className="ml-2 text-xs text-blue-600">(default)</span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        {source.rowCount} rows available
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Select All / Clear All buttons */}
              <div className="flex gap-2 pt-2 border-t">
                <Button 
                  onClick={selectAllDataSources} 
                  variant="outline" 
                  size="sm"
                  className="flex-1"
                >
                  Select All
                </Button>
                <Button 
                  onClick={clearAllDataSources} 
                  variant="outline" 
                  size="sm"
                  className="flex-1"
                  disabled={selectedDataSources.length === 0}
                >
                  Clear All
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Data Volume Control */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 size={20} />
                Data Volume Control
              </CardTitle>
              <CardDescription>
                Control the amount of data analyzed for performance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="row-limit">Rows per Data Source</Label>
                <Select 
                  value={rowLimitPerSource.toString()} 
                  onValueChange={(value) => setRowLimitPerSource(Number(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="100">100</SelectItem>
                    <SelectItem value="250">250</SelectItem>
                    <SelectItem value="500">500</SelectItem>
                    <SelectItem value="1000">1000</SelectItem>
                    <SelectItem value="2000">2000</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {dataSummary.estimatedTotalRows && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm font-medium">Estimated Total Rows: {dataSummary.estimatedTotalRows.toLocaleString()}</div>
                  {dataSummary.estimatedTotalRows > 1000 && (
                    <div className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                      <span>⚠️</span> Large datasets may take longer to process
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter size={20} />
                Filters
                {filters.length > 0 && (
                  <Badge variant="secondary" className="ml-auto">
                    {filters.length}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Add filters to refine your data view
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {filters.map(filter => (
                <div key={filter.id} className="flex gap-2 items-start">
                  <div className="flex-1 space-y-2">
                    <Select 
                      value={filter.column} 
                      onValueChange={(value) => updateFilter(filter.id, { column: value, operator: 'equals', value: '' })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {columns.map(column => (
                          <SelectItem key={column.name} value={column.name}>
                            {column.displayName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Select 
                      value={filter.operator} 
                      onValueChange={(value) => updateFilter(filter.id, { operator: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {getAvailableOperators(filter.column).map(operator => (
                          <SelectItem key={operator} value={operator}>
                            {operator}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                                         <Input
                       value={String(filter.value)}
                       onChange={(e) => updateFilter(filter.id, { value: e.target.value })}
                       placeholder="Enter value..."
                     />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeFilter(filter.id)}
                    className="mt-2"
                  >
                    <X size={16} />
                  </Button>
                </div>
              ))}
              
              <div className="flex gap-2">
                <Button onClick={addFilter} variant="outline" size="sm">
                  <Plus size={16} className="mr-1" />
                  Add Filter
                </Button>
                {filters.length > 0 && (
                  <Button onClick={clearFilters} variant="outline" size="sm">
                    Clear All
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* AI Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain size={20} />
                AI Insights
              </CardTitle>
              <CardDescription>
                Generate insights using AI models
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="llm-select">AI Model</Label>
                <Select value={selectedLLM} onValueChange={(value: any) => setSelectedLLM(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
                    <SelectItem value="openai-gpt-4">OpenAI GPT-4</SelectItem>
                    <SelectItem value="anthropic-claude-3">Anthropic Claude 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="prompt">Your Question</Label>
                <Textarea
                  id="prompt"
                  value={userPrompt}
                  onChange={(e) => setUserPrompt(e.target.value)}
                  placeholder="Ask about trends, patterns, or insights in your data..."
                  rows={4}
                />
              </div>
              
              <Button 
                onClick={generateInsights} 
                disabled={!canGenerateInsights || isGeneratingInsights}
                className="w-full"
              >
                {isGeneratingInsights ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  'Generate Insights'
                )}
              </Button>
              
              {error && (
                <div className="text-red-600 text-sm p-2 bg-red-50 rounded">
                  {error}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Data Display */}
        <div className="lg:col-span-2 space-y-6">
          {/* Data Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 size={20} />
                Data Summary
              </CardTitle>
              <CardDescription>
                Statistical overview of your filtered data
              </CardDescription>
            </CardHeader>
            <CardContent>
              {hasData ? (
                <div className="space-y-4">
                  {/* Multi-source context */}
                  {dataSummary.selectedSources && dataSummary.selectedSources.length > 1 && (
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-sm mb-2">Analyzing data from:</h4>
                      <div className="space-y-1">
                        {dataSummary.selectedSources.map(source => (
                          <div key={source} className="text-sm text-blue-700">
                            • {source} ({availableDataSources.find(ds => ds.id === source)?.rowCount || 0} rows)
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <div className="text-2xl font-bold" style={{ color: COLORS.primary }}>
                        {dataSummary.totalRows.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">Filtered Rows</div>
                    </div>
                    
                    {Object.entries(dataSummary.metrics).slice(0, 3).map(([column, stats]) => (
                      <div key={column} className="text-center p-3 bg-gray-50 rounded">
                        <div className="text-lg font-semibold" style={{ color: COLORS.primary }}>
                          {stats.avg.toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-600">{column} (avg)</div>
                      </div>
                    ))}
                  </div>
                  
                  {Object.entries(dataSummary.dimensions).length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Dimensions</h4>
                      <div className="grid grid-cols-2 gap-4">
                        {Object.entries(dataSummary.dimensions).map(([column, info]) => (
                          <div key={column} className="p-3 bg-gray-50 rounded">
                            <div className="font-medium">{column}</div>
                            <div className="text-sm text-gray-600">
                              {info.uniqueCount} unique values
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  {filteredAndSortedData.length === 0 && hasData 
                    ? "No data matches your current filters"
                    : selectedDataSources.length === 0
                      ? "Select data sources to view summary"
                      : "No data available for selected sources"
                  }
                </div>
              )}
            </CardContent>
          </Card>

          {/* Data Preview Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Data Preview</CardTitle>
                <div className="flex items-center gap-2">
                  <Label htmlFor="row-count" className="text-sm">Rows:</Label>
                  <Select value={previewRowCount.toString()} onValueChange={(value) => setPreviewRowCount(Number(value))}>
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="30">30</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {hasData && previewData.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {columns.map(column => (
                          <TableHead key={column.name}>
                            <Button
                              variant="ghost"
                              onClick={() => handleSort(column.name)}
                              className="h-auto p-0 font-semibold"
                            >
                              {column.displayName}
                              <ArrowUpDown className="ml-1 h-4 w-4" />
                            </Button>
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {previewData.map((row, index) => (
                        <TableRow key={index}>
                          {columns.map(column => (
                            <TableCell key={column.name}>
                              {formatCellValue(row[column.name], column.type)}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  {filteredAndSortedData.length === 0 && hasData 
                    ? "No data matches your current filters"
                    : selectedDataSources.length === 0
                      ? "Select data sources to view data"
                      : "No data available for selected sources"
                  }
                </div>
              )}
            </CardContent>
          </Card>

          {/* AI Insights Response */}
          {aiResponse && (
            <Card>
              <CardHeader>
                <CardTitle>AI Insights</CardTitle>
                <CardDescription>
                  {dataSummary.selectedSources && dataSummary.selectedSources.length > 1 && (
                    <div className="mb-2">
                      Analysis includes data from: {dataSummary.selectedSources.join(', ')}
                    </div>
                  )}
                  {aiResponse.tokenUsage && (
                    <div>
                      Tokens: {aiResponse.tokenUsage.totalTokens} 
                      (Input: {aiResponse.tokenUsage.inputTokens}, Output: {aiResponse.tokenUsage.outputTokens})
                    </div>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {aiResponse.error ? (
                  <div className="text-red-600 p-4 bg-red-50 rounded">
                    {aiResponse.error}
                  </div>
                ) : (
                  <div className="prose max-w-none">
                    <pre className="whitespace-pre-wrap text-sm">{aiResponse.text}</pre>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

function formatCellValue(value: any, type: string): string {
  if (value === null || value === undefined) return '-'
  
  switch (type) {
    case 'metric':
      return typeof value === 'number' ? value.toLocaleString() : String(value)
    case 'date':
      return new Date(value).toLocaleDateString()
    default:
      return String(value)
  }
}
