import { NextRequest, NextResponse } from 'next/server'
import { InsightRequest, LLMResponse, TokenUsage } from '@/lib/types'

const MAX_RECOMMENDED_INSIGHT_ROWS = 1000

export async function POST(request: NextRequest) {
  try {
    const body: InsightRequest = await request.json()
    const { prompt, data, dataSource, dataSources, filters, totalRows, filteredRows, currency, provider, rowLimitPerSource } = body

    if (!prompt || !data || data.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: prompt and data' },
        { status: 400 }
      )
    }

    // Limit data size for API efficiency
    const dataToAnalyze = data.length > MAX_RECOMMENDED_INSIGHT_ROWS 
      ? data.slice(0, MAX_RECOMMENDED_INSIGHT_ROWS)
      : data

    const response = await generateInsightsWithProvider({
      prompt,
      data: dataToAnalyze,
      dataSource,
      dataSources,
      filters,
      totalRows,
      filteredRows,
      currency,
      provider,
      rowLimitPerSource
    })

    return NextResponse.json(response)

  } catch (error) {
    console.error('Insights API Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
    return NextResponse.json(
      { error: 'Failed to generate insights', details: errorMessage },
      { status: 500 }
    )
  }
}

async function generateInsightsWithProvider(request: InsightRequest): Promise<LLMResponse> {
  const { prompt, data, dataSource, dataSources, filters, totalRows, filteredRows, currency, provider, rowLimitPerSource } = request

  // Determine if this is multi-source analysis
  const isMultiSource = dataSources && dataSources.length > 1
  const sourcesList = dataSources || [dataSource]

  // Create context for the AI
  const context = {
    dataSource: isMultiSource ? dataSources?.join(', ') : dataSource,
    dataSources: sourcesList,
    isMultiSource,
    totalRows,
    filteredRows,
    currency,
    rowLimitPerSource,
    filters: filters.map(f => `${f.column} ${f.operator} ${f.value}`).join(', '),
    dataSample: data.slice(0, 10), // Send first 10 rows as sample
    columnNames: Object.keys(data[0] || {}),
    dataTypes: inferDataTypes(data[0] || {})
  }

  // Enhanced system prompt for multi-source analysis
  const systemPrompt = `You are a data analyst assistant specializing in advertising campaign performance analysis. Analyze the provided data and respond to the user's query with comprehensive insights.

Analysis Context:
${isMultiSource ? `- Multi-Source Analysis: ${sourcesList.join(', ')}` : `- Data Source: ${context.dataSource}`}
- Total Rows Across All Sources: ${context.totalRows}
- Filtered/Analyzed Rows: ${context.filteredRows}
${rowLimitPerSource ? `- Row Limit Per Source: ${rowLimitPerSource}` : ''}
- Currency: ${currency}
- Applied Filters: ${context.filters || 'None'}
- Available Columns: ${context.columnNames.join(', ')}

${isMultiSource ? `
IMPORTANT: This is a multi-source analysis combining data from multiple dashboard views. Look for:
- Cross-source patterns and relationships
- Comparative insights between different data sources
- Overall performance trends across the combined dataset
- Correlations between metrics from different sources

The data includes a __dataSource field indicating which source each row came from.
` : ''}

Data Sample (first 10 rows):
${JSON.stringify(context.dataSample, null, 2)}

Please provide clear, actionable insights based on the data and the user's specific question. Focus on patterns, trends, and recommendations that would be valuable for advertising campaign optimization.${isMultiSource ? ' Pay special attention to cross-source relationships and comprehensive analysis across all selected data sources.' : ''}`

  const userPrompt = `${prompt}\n\nPlease analyze the data and provide insights.`

  try {
    switch (provider) {
      case 'gemini-pro':
        return await callGeminiAPI(systemPrompt, userPrompt)
      case 'openai-gpt-4':
        return await callOpenAIAPI(systemPrompt, userPrompt)
      case 'anthropic-claude-3':
        return await callAnthropicAPI(systemPrompt, userPrompt)
      default:
        throw new Error(`Unsupported provider: ${provider}`)
    }
  } catch (error) {
    console.error(`Error calling ${provider} API:`, error)
    return {
      text: '',
      error: `Failed to generate insights using ${provider}: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}

async function callGeminiAPI(systemPrompt: string, userPrompt: string): Promise<LLMResponse> {
  const apiKey = process.env.GEMINI_API_KEY
  
  if (!apiKey) {
         return {
       text: '',
       error: 'Google AI API key not configured. Please add GEMINI_API_KEY to your .env file.'
     }
  }

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: systemPrompt },
              { text: userPrompt }
            ]
          }
        ]
      })
    })

    if (!response.ok) {
      throw new Error(`Google AI API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      const text = data.candidates[0].content.parts[0].text
      return {
        text,
        tokenUsage: {
          inputTokens: data.usageMetadata?.promptTokenCount || 0,
          outputTokens: data.usageMetadata?.candidatesTokenCount || 0,
          totalTokens: data.usageMetadata?.totalTokenCount || 0
        }
      }
    } else {
      throw new Error('Invalid response format from Google AI API')
    }
  } catch (error) {
    console.error('Google AI API Error:', error)
    return {
      text: '',
      error: `Failed to call Google AI API: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}

async function callOpenAIAPI(systemPrompt: string, userPrompt: string): Promise<LLMResponse> {
  const apiKey = process.env.OPENAI_API_KEY
  
  if (!apiKey) {
    return {
      text: '',
      error: 'OpenAI API key not configured. Please add OPENAI_API_KEY to your .env file.'
    }
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 1000,
        temperature: 0.7
      })
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    
    if (data.choices && data.choices[0] && data.choices[0].message) {
      const text = data.choices[0].message.content
      return {
        text,
        tokenUsage: {
          inputTokens: data.usage?.prompt_tokens || 0,
          outputTokens: data.usage?.completion_tokens || 0,
          totalTokens: data.usage?.total_tokens || 0
        }
      }
    } else {
      throw new Error('Invalid response format from OpenAI API')
    }
  } catch (error) {
    console.error('OpenAI API Error:', error)
    return {
      text: '',
      error: `Failed to call OpenAI API: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}

async function callAnthropicAPI(systemPrompt: string, userPrompt: string): Promise<LLMResponse> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  
  if (!apiKey) {
    return {
      text: '',
      error: 'Anthropic API key not configured. Please add ANTHROPIC_API_KEY to your .env file.'
    }
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: `${systemPrompt}\n\n${userPrompt}`
          }
        ]
      })
    })

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    
    if (data.content && data.content[0] && data.content[0].text) {
      const text = data.content[0].text
      return {
        text,
        tokenUsage: {
          inputTokens: data.usage?.input_tokens || 0,
          outputTokens: data.usage?.output_tokens || 0,
          totalTokens: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0)
        }
      }
    } else {
      throw new Error('Invalid response format from Anthropic API')
    }
  } catch (error) {
    console.error('Anthropic API Error:', error)
    return {
      text: '',
      error: `Failed to call Anthropic API: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}

function inferDataTypes(sampleRow: any): Record<string, string> {
  const types: Record<string, string> = {}
  
  for (const [key, value] of Object.entries(sampleRow)) {
    if (typeof value === 'number') {
      types[key] = 'metric'
    } else if (typeof value === 'string') {
      // Check if it's a date
      if (key.toLowerCase().includes('date') || /^\d{4}-\d{2}-\d{2}/.test(value)) {
        types[key] = 'date'
      } else {
        types[key] = 'dimension'
      }
    } else {
      types[key] = 'dimension'
    }
  }
  
  return types
}
