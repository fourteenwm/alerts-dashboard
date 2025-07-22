// src/components/MetricsChart.tsx

'use client'

import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { Card } from '@/components/ui/card'
import { format, isFirstDayOfMonth } from 'date-fns'
import { formatCurrencyForAxis, formatConversionsForAxis } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

type ChartType = 'line' | 'bar' | 'area'

interface ChartData {
  date: string
  [key: string]: any
}

interface MetricsChartProps {
  data: ChartData[]
  metric1: {
    key: string
    label: string
    color: string
    format: (value: number) => string
  }
  metric2?: {
    key: string
    label: string
    color: string
    format: (value: number) => string
  }
  chartType?: ChartType
  barColors?: {
    [key: string]: (value: number) => string
  }
  hideControls?: boolean
}

export function MetricsChart({
  data,
  metric1,
  metric2,
  chartType: initialChartType = 'line',
  barColors,
  hideControls = false
}: MetricsChartProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [currentChartType, setCurrentChartType] = useState<ChartType>(initialChartType)

  useEffect(() => {
    if (!data.length || !svgRef.current) return

    // Clear previous chart
    d3.select(svgRef.current).selectAll('*').remove()

    // Setup dimensions
    const margin = { top: 20, right: 60, bottom: 40, left: 60 }
    const width = svgRef.current.clientWidth - margin.left - margin.right
    const height = 400 - margin.top - margin.bottom

    const svg = d3.select(svgRef.current)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    const tooltip = d3.select(svgRef.current.parentElement)
      .append("div")
      .attr("class", "tooltip")
      .style("opacity", 0)
      .style("position", "absolute")
      .style("background-color", "white")
      .style("border", "solid")
      .style("border-width", "1px")
      .style("border-radius", "5px")
      .style("padding", "10px");


    // Parse dates and filter labels to show only first of month
    const dates = data.map(d => new Date(d.date)).sort((a, b) => a.getTime() - b.getTime())
    const filteredDates = dates.filter((d, i) =>
      isFirstDayOfMonth(d) || i === 0 || i === dates.length - 1
    )

    // Calculate tick values based on data length
    const getTickValues = () => {
      if (data.length <= 14) return dates;  // Show all dates if 2 weeks or less
      if (data.length <= 31) return dates.filter((_, i) => i % 2 === 0);  // Show every other date if month or less
      return filteredDates;  // Show first of month for longer periods
    };

    // Setup scales
    const xScale = currentChartType === 'bar'
      ? d3.scaleBand()
        .domain(dates.map(d => format(d, 'MMM d')))
        .range([0, width])
        .padding(0.2)
      : d3.scaleTime()
        .domain(d3.extent(dates) as [Date, Date])
        .range([0, width])

    const xGroupScale = currentChartType === 'bar'
      ? d3.scaleBand()
        .domain(metric2 ? ['metric1', 'metric2'] : ['metric1'])
        .range([0, (xScale as d3.ScaleBand<string>).bandwidth()])
        .padding(0.1)
      : null

    const y1Scale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d[metric1.key] as number) || 0])
      .range([height, 0])
      .nice()

    let y2Scale
    if (metric2) {
      y2Scale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d[metric2.key] as number) || 0])
        .range([height, 0])
        .nice()
    }

    // Helper function to format y-axis ticks
    const formatYAxisTick = (d: number, key: string) => {
      // Check if the metric is cost or value (currency)
      if (key.includes('cost') || key.includes('value') || key.includes('CPC') || key.includes('CPA') || key.includes('AOV')) {
        return formatCurrencyForAxis(d, '$')
      }
      // Check if the metric is conversions
      else if (key.includes('conv')) {
        return formatConversionsForAxis(d)
      }
      // For percentage metrics
      else if (key.includes('CTR') || key.includes('CvR') || key.includes('imprShare') || key.includes('lost')) {
        return `${Math.round(d)}%`
      }
      // For other metrics (impressions, clicks)
      return d.toLocaleString('en-US', { maximumFractionDigits: 0 })
    }

    // Add axes
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(
        currentChartType === 'bar'
          ? d3.axisBottom(xScale as d3.ScaleBand<string>)
            .tickValues(getTickValues().map(d => format(d, 'MMM d')))
          : d3.axisBottom(xScale as d3.ScaleTime<number, number>)
            .tickFormat(d => format(d as Date, 'MMM d'))
            .tickValues(getTickValues())
      )
      .call(g => g.select('.domain').attr('stroke', '#cbd5e1'))
      .call(g => g.selectAll('.tick line').attr('stroke', '#cbd5e1'))
      .call(g => g.selectAll('.tick text')
        .attr('fill', '#64748b')
        .style('text-anchor', 'end')
        .attr('transform', 'rotate(-45)'))

    svg.append('g')
      .call(d3.axisLeft(y1Scale)
        .ticks(5)
        .tickFormat(d => formatYAxisTick(d as number, metric1.key)))
      .call(g => g.select('.domain').attr('stroke', '#cbd5e1'))
      .call(g => g.selectAll('.tick line').attr('stroke', '#cbd5e1'))
      .call(g => g.selectAll('.tick text').attr('fill', '#64748b'))

    if (metric2 && y2Scale) {
      svg.append('g')
        .attr('transform', `translate(${width},0)`)
        .call(d3.axisRight(y2Scale)
          .ticks(5)
          .tickFormat(d => formatYAxisTick(d as number, metric2.key)))
        .call(g => g.select('.domain').attr('stroke', '#cbd5e1'))
        .call(g => g.selectAll('.tick line').attr('stroke', '#cbd5e1'))
        .call(g => g.selectAll('.tick text').attr('fill', '#64748b'))
    }

    if (currentChartType === 'line' || currentChartType === 'area') {
      if (currentChartType === 'area') {
        const area1 = d3.area<ChartData>()
          .x(d => (xScale as d3.ScaleTime<number, number>)(new Date(d.date)))
          .y0(height)
          .y1(d => y1Scale(d[metric1.key] as number))

        svg.append('path')
          .datum(data)
          .attr('fill', metric1.color)
          .attr('fill-opacity', 0.3)
          .attr('d', area1 as any)

        if (metric2 && y2Scale) {
          const area2 = d3.area<ChartData>()
            .x(d => (xScale as d3.ScaleTime<number, number>)(new Date(d.date)))
            .y0(height)
            .y1(d => y2Scale(d[metric2.key] as number))

          svg.append('path')
            .datum(data)
            .attr('fill', metric2.color)
            .attr('fill-opacity', 0.3)
            .attr('d', area2 as any)
        }
      }
      // Add lines
      const line1 = d3.line<ChartData>()
        .x(d => (xScale as d3.ScaleTime<number, number>)(new Date(d.date)))
        .y(d => y1Scale(d[metric1.key] as number))

      svg.append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', metric1.color)
        .attr('stroke-width', 2)
        .attr('d', line1 as any) // Type assertion needed due to d3 typing limitations

      if (metric2 && y2Scale) {
        const line2 = d3.line<ChartData>()
          .x(d => (xScale as d3.ScaleTime<number, number>)(new Date(d.date)))
          .y(d => y2Scale(d[metric2.key] as number))

        svg.append('path')
          .datum(data)
          .attr('fill', 'none')
          .attr('stroke', metric2.color)
          .attr('stroke-width', 2)
          .attr('d', line2 as any) // Type assertion needed due to d3 typing limitations
      }
    } else if (currentChartType === 'bar') {
      // Add bars
      const bars = svg.append('g')
        .selectAll('g')
        .data(data)
        .join('g')
        .attr('transform', d => `translate(${(xScale as d3.ScaleBand<string>)(format(new Date(d.date), 'MMM d'))},0)`)

      // Add metric1 bars
      bars.append('rect')
        .attr('x', () => xGroupScale!('metric1') || 0)
        .attr('y', d => y1Scale(d[metric1.key] as number))
        .attr('width', xGroupScale!.bandwidth())
        .attr('height', d => height - y1Scale(d[metric1.key] as number))
        .attr('fill', d => barColors?.[metric1.key]?.((d as ChartData)[metric1.key] as number) || metric1.color)
        .attr('opacity', 0.8)

      // Add metric2 bars if exists
      if (metric2 && y2Scale) {
        bars.append('rect')
          .attr('x', () => xGroupScale!('metric2') || 0)
          .attr('y', d => y2Scale(d[metric2.key] as number))
          .attr('width', xGroupScale!.bandwidth())
          .attr('height', d => height - y2Scale(d[metric2.key] as number))
          .attr('fill', d => barColors?.[metric2.key]?.((d as ChartData)[metric2.key] as number) || metric2.color)
          .attr('opacity', 0.8)
      }
    }

    const focus = svg.append('g')
      .attr('class', 'focus')
      .style('display', 'none');

    focus.append('line')
      .attr('class', 'x-hover-line hover-line')
      .attr('y1', 0)
      .attr('y2', height);

    svg.append('rect')
      .attr('class', 'overlay')
      .attr('width', width)
      .attr('height', height)
      .style('fill', 'none')
      .style('pointer-events', 'all')
      .on('mouseover', () => {
        focus.style('display', null);
        tooltip.style('opacity', 1);
      })
      .on('mouseout', () => {
        focus.style('display', 'none');
        tooltip.style('opacity', 0);
      })
      .on('mousemove', (event) => {
        const [mx, my] = d3.pointer(event);
        let d: ChartData | undefined;

        // Check if xScale has an 'invert' method to distinguish time scales from band scales
        if ('invert' in xScale) {
          // Logic for Line and Area charts (time scale)
          const timeScale = xScale as d3.ScaleTime<number, number>;
          const x0 = timeScale.invert(mx);
          const i = d3.bisector((d: ChartData) => new Date(d.date)).left(data, x0, 1);
          const d0 = data[i - 1];
          const d1 = data[i];
          if (d0 && d1) {
            d = (x0.getTime() - new Date(d0.date).getTime()) > (new Date(d1.date).getTime() - x0.getTime()) ? d1 : d0;
          } else {
            d = d0 || d1;
          }
        } else {
          // Logic for Bar charts (band scale)
          const bandScale = xScale as d3.ScaleBand<string>;
          const domain = bandScale.domain();
          const step = bandScale.step();
          const index = Math.floor(mx / step);
          if (index >= 0 && index < domain.length) {
            const dateString = domain[index];
            d = data.find(item => format(new Date(item.date), 'MMM d') === dateString);
          }
        }

        if (d) {
          const xPos = 'invert' in xScale
            ? (xScale as d3.ScaleTime<number, number>)(new Date(d.date))
            : (xScale as d3.ScaleBand<string>)(format(new Date(d.date), 'MMM d'))! + (xScale as d3.ScaleBand<string>).bandwidth() / 2;

          focus.select('.x-hover-line').attr('transform', `translate(${xPos}, 0)`);

          tooltip
            .html(`<strong>${format(new Date(d.date), 'MMM d, yyyy')}</strong><br/>
                       ${metric1.label}: ${metric1.format(d[metric1.key])}<br/>
                       ${metric2 ? `${metric2.label}: ${metric2.format(d[metric2.key])}` : ''}`)
            .style('left', (mx + margin.left + 15) + 'px')
            .style('top', (my + margin.top - 28) + 'px');
        }
      });

  }, [data, metric1, metric2, currentChartType, barColors])

  return (
    <Card className="p-4 relative">
      {!hideControls && (
        <div className="flex justify-end mb-4">
          <div className="inline-flex rounded-md shadow-sm" role="group">
            <button
              type="button"
              onClick={() => setCurrentChartType('line')}
              className={`px-4 py-2 text-sm font-medium border rounded-l-lg ${currentChartType === 'line'
                ? 'bg-blue-50 text-blue-700 border-blue-700'
                : 'bg-white text-gray-900 border-gray-200 hover:bg-gray-100'
                }`}
            >
              Line
            </button>
            <button
              type="button"
              onClick={() => setCurrentChartType('bar')}
              className={`px-4 py-2 text-sm font-medium border-t border-b ${currentChartType === 'bar'
                ? 'bg-blue-50 text-blue-700 border-blue-700'
                : 'bg-white text-gray-900 border-gray-200 hover:bg-gray-100'
                }`}
            >
              Bar
            </button>
            <button
              type="button"
              onClick={() => setCurrentChartType('area')}
              className={`px-4 py-2 text-sm font-medium border rounded-r-lg ${currentChartType === 'area'
                ? 'bg-blue-50 text-blue-700 border-blue-700'
                : 'bg-white text-gray-900 border-gray-200 hover:bg-gray-100'
                }`}
            >
              Area
            </button>
          </div>
        </div>
      )}
      <svg
        ref={svgRef}
        className="w-full"
        style={{ height: '400px' }}
      />
    </Card>
  )
}