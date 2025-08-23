import { useState, useMemo, useCallback } from 'react'
import { 
  ColumnDefinition, 
  FilterCondition, 
  SortConfig, 
  DataSummary, 
  LLMProvider, 
  LLMResponse,
  InsightRequest,
  FILTER_OPERATORS
} from '@/lib/types'
import { useDataStore } from '@/lib/contexts/SettingsContext'

export function useDataInsights() {
  // State management
  const [selectedDataSources, setSelectedDataSources] = useState<string[]>([])
  const [columns, setColumns] = useState<ColumnDefinition[]>([])
  const [filters, setFilters] = useState<FilterCondition[]>([])
  const [sortConfig, setSortConfig] = useState<SortConfig>({ column: '', direction: 'asc' })
  const [previewRowCount, setPreviewRowCount] = useState<number>(10)
  const [rowLimitPerSource, setRowLimitPerSource] = useState<number>(500)
  const [userPrompt, setUserPrompt] = useState<string>('')
  const [selectedLLM, setSelectedLLM] = useState<LLMProvider>('openai-gpt-4')
  const [aiResponse, setAiResponse] = useState<LLMResponse | null>(null)
  const [isGeneratingInsights, setIsGeneratingInsights] = useState<boolean>(false)
  const [error, setError] = useState<string>('')

  // Get data from global store
  const { dataStore, settings } = useDataStore()

  // Available data sources with selection state
  const availableDataSources = useMemo(() => {
    if (!dataStore) return []
    
    return Object.entries(dataStore).map(([key, data]) => ({
      id: key,
      name: key,
      description: `${key} data (${data.length} rows)`,
      available: data.length > 0,
      selected: selectedDataSources.includes(key),
      rowCount: data.length
    }))
  }, [dataStore, selectedDataSources])

  // Set default data source on mount (Dashboard LivCor as per PRD)
  useMemo(() => {
    if (availableDataSources.length > 0 && selectedDataSources.length === 0) {
      const livCorSource = availableDataSources.find(ds => ds.id === 'Dashboard LivCor' && ds.available)
      if (livCorSource) {
        setSelectedDataSources([livCorSource.id])
      } else {
        // Fallback to first available source if LivCor not available
        const defaultSource = availableDataSources.find(ds => ds.available)
        if (defaultSource) {
          setSelectedDataSources([defaultSource.id])
        }
      }
    }
  }, [availableDataSources, selectedDataSources])

  // Derive columns from selected data sources (combined schema)
  useMemo(() => {
    if (selectedDataSources.length === 0 || !dataStore) {
      setColumns([])
      return
    }

    // Collect all unique columns from selected data sources
    const allColumns = new Map<string, ColumnDefinition>()
    
    selectedDataSources.forEach(sourceId => {
      const data = dataStore[sourceId]
      if (data && data.length > 0) {
        const sampleRow = data[0]
        Object.entries(sampleRow).forEach(([key, value]) => {
          if (!allColumns.has(key)) {
            let type: 'metric' | 'dimension' | 'date' = 'dimension'
            
            if (typeof value === 'number') {
              type = 'metric'
            } else if (typeof value === 'string') {
              if (key.toLowerCase().includes('date') || /^\d{4}-\d{2}-\d{2}/.test(value)) {
                type = 'date'
              }
            }

            allColumns.set(key, {
              name: key,
              displayName: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
              type,
              originalName: key
            })
          }
        })
      }
    })

    setColumns(Array.from(allColumns.values()))
  }, [selectedDataSources, dataStore])

  // Combine, filter and sort data from multiple sources
  const filteredAndSortedData = useMemo(() => {
    if (selectedDataSources.length === 0 || !dataStore) return []

    // Combine data from all selected sources with row limiting
    let combinedData: any[] = []
    
    selectedDataSources.forEach(sourceId => {
      const sourceData = dataStore[sourceId]
      if (sourceData && sourceData.length > 0) {
        // Apply row limit per source
        const limitedData = sourceData.slice(0, rowLimitPerSource).map(row => ({
          ...row,
          __dataSource: sourceId // Add source identifier
        }))
        combinedData = [...combinedData, ...limitedData]
      }
    })

    let data = combinedData

    // Apply filters
    if (filters.length > 0) {
      data = data.filter(row => {
        return filters.every(filter => {
          const value = row[filter.column]
          const filterValue = filter.value

          switch (filter.operator) {
            case 'contains':
              return String(value).toLowerCase().includes(String(filterValue).toLowerCase())
            case 'does not contain':
              return !String(value).toLowerCase().includes(String(filterValue).toLowerCase())
            case 'equals':
              return value == filterValue
            case 'not equals':
              return value != filterValue
            case 'starts with':
              return String(value).toLowerCase().startsWith(String(filterValue).toLowerCase())
            case 'ends with':
              return String(value).toLowerCase().endsWith(String(filterValue).toLowerCase())
            case 'greater than':
              return Number(value) > Number(filterValue)
            case 'less than':
              return Number(value) < Number(filterValue)
            case 'greater than or equals':
              return Number(value) >= Number(filterValue)
            case 'less than or equals':
              return Number(value) <= Number(filterValue)
            case 'after':
              return new Date(value) > new Date(filterValue)
            case 'before':
              return new Date(value) < new Date(filterValue)
            case 'on or after':
              return new Date(value) >= new Date(filterValue)
            case 'on or before':
              return new Date(value) <= new Date(filterValue)
            default:
              return true
          }
        })
      })
    }

    // Apply sorting
    if (sortConfig.column) {
      data.sort((a, b) => {
        const aVal = a[sortConfig.column]
        const bVal = b[sortConfig.column]
        
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal
        }
        
        const aStr = String(aVal || '')
        const bStr = String(bVal || '')
        
        if (sortConfig.direction === 'asc') {
          return aStr.localeCompare(bStr)
        } else {
          return bStr.localeCompare(aStr)
        }
      })
    }

    return data
  }, [selectedDataSources, dataStore, filters, sortConfig, rowLimitPerSource])

  // Preview data (limited rows)
  const previewData = useMemo(() => {
    return filteredAndSortedData.slice(0, previewRowCount)
  }, [filteredAndSortedData, previewRowCount])

  // Calculate data summary with multi-source support
  const dataSummary = useMemo((): DataSummary => {
    const estimatedTotal = selectedDataSources.reduce((total, sourceId) => {
      const sourceData = dataStore?.[sourceId]
      return total + (sourceData ? Math.min(sourceData.length, rowLimitPerSource) : 0)
    }, 0)

    const summary: DataSummary = {
      totalRows: filteredAndSortedData.length,
      estimatedTotalRows: estimatedTotal,
      selectedSources: selectedDataSources,
      metrics: {},
      dimensions: {}
    }

    if (filteredAndSortedData.length === 0) return summary

    // Process each column
    columns.forEach(column => {
      if (column.type === 'metric') {
        const values = filteredAndSortedData
          .map(row => Number(row[column.name]))
          .filter(val => !isNaN(val))

        if (values.length > 0) {
          summary.metrics[column.name] = {
            min: Math.min(...values),
            max: Math.max(...values),
            avg: values.reduce((sum, val) => sum + val, 0) / values.length,
            sum: values.reduce((sum, val) => sum + val, 0)
          }
        }
      } else {
        const uniqueValues = new Set(filteredAndSortedData.map(row => String(row[column.name])))
        summary.dimensions[column.name] = {
          uniqueCount: uniqueValues.size
        }

        // Calculate top values for dimensions
        if (uniqueValues.size <= 10) {
          const valueCounts = new Map<string, number>()
          filteredAndSortedData.forEach(row => {
            const value = String(row[column.name])
            valueCounts.set(value, (valueCounts.get(value) || 0) + 1)
          })

          summary.dimensions[column.name].topValues = Array.from(valueCounts.entries())
            .map(([value, count]) => ({ value, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5)
        }
      }
    })

    return summary
  }, [filteredAndSortedData, columns, selectedDataSources, dataStore, rowLimitPerSource])

  // Filter management
  const addFilter = useCallback(() => {
    const newFilter: FilterCondition = {
      id: Date.now().toString(),
      column: columns.length > 0 ? columns[0].name : '',
      operator: 'equals',
      value: ''
    }
    setFilters(prev => [...prev, newFilter])
  }, [columns])

  const updateFilter = useCallback((id: string, updates: Partial<FilterCondition>) => {
    setFilters(prev => prev.map(filter => 
      filter.id === id ? { ...filter, ...updates } : filter
    ))
  }, [])

  const removeFilter = useCallback((id: string) => {
    setFilters(prev => prev.filter(filter => filter.id !== id))
  }, [])

  const clearFilters = useCallback(() => {
    setFilters([])
  }, [])

  // Sorting
  const handleSort = useCallback((column: string) => {
    setSortConfig(prev => ({
      column,
      direction: prev.column === column && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }, [])

  // AI Insights generation with multi-source support
  const generateInsights = useCallback(async () => {
    if (!userPrompt.trim() || filteredAndSortedData.length === 0) {
      setError('Please enter a prompt and ensure data is available')
      return
    }

    setIsGeneratingInsights(true)
    setError('')

    try {
      const totalRowsAllSources = selectedDataSources.reduce((total, sourceId) => {
        return total + (dataStore?.[sourceId]?.length || 0)
      }, 0)

      const request: InsightRequest = {
        prompt: userPrompt,
        data: filteredAndSortedData,
        dataSource: selectedDataSources.join(', '), // Legacy compatibility
        dataSources: selectedDataSources,
        filters,
        totalRows: totalRowsAllSources,
        filteredRows: filteredAndSortedData.length,
        currency: settings.currency || 'USD',
        provider: selectedLLM,
        rowLimitPerSource
      }

      const response = await fetch('/api/insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result: LLMResponse = await response.json()
      setAiResponse(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate insights')
      setAiResponse(null)
    } finally {
      setIsGeneratingInsights(false)
    }
  }, [userPrompt, filteredAndSortedData, selectedDataSources, filters, dataStore, settings.currency, selectedLLM, rowLimitPerSource])

  // Get available operators for a column
  const getAvailableOperators = useCallback((columnName: string) => {
    const column = columns.find(col => col.name === columnName)
    if (!column) return []
    
    return FILTER_OPERATORS[column.type] || []
  }, [columns])

  // Multi-source selection helpers
  const toggleDataSource = useCallback((sourceId: string) => {
    setSelectedDataSources(prev => 
      prev.includes(sourceId)
        ? prev.filter(id => id !== sourceId)
        : [...prev, sourceId]
    )
  }, [])

  const selectAllDataSources = useCallback(() => {
    const availableSources = availableDataSources.filter(ds => ds.available).map(ds => ds.id)
    setSelectedDataSources(availableSources)
  }, [availableDataSources])

  const clearAllDataSources = useCallback(() => {
    setSelectedDataSources([])
  }, [])

  return {
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
    hasData: filteredAndSortedData.length > 0,
    canGenerateInsights: userPrompt.trim().length > 0 && filteredAndSortedData.length > 0
  }
}
