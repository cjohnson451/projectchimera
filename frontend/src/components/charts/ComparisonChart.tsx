import React, { useState, useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  LineChart,
  Line,
  ComposedChart,
  Area,
  AreaChart,
} from 'recharts'
import { clsx } from 'clsx'
import { 
  BarChart3, 
  Radar as RadarIcon, 
  TrendingUp, 
  TrendingDown,
  Activity,
  Target,
  Layers,
  GitCompare,
  Calendar,
  DollarSign
} from 'lucide-react'
import { Card, CardHeader, CardBody } from '../ui/Card'
import Button from '../ui/Button'
import { LoadingSpinner } from '../ui/LoadingSpinner'
import { EmptyState } from '../ui/EmptyState'

export interface ComparisonDataPoint {
  name: string
  ticker?: string
  // Financial metrics
  price?: number
  marketCap?: number
  peRatio?: number
  pbRatio?: number
  roe?: number
  roa?: number
  debtToEquity?: number
  currentRatio?: number
  // Performance metrics
  return1M?: number
  return3M?: number
  return6M?: number
  return1Y?: number
  volatility?: number
  beta?: number
  sharpeRatio?: number
  // Risk metrics
  riskScore?: number
  var?: number
  maxDrawdown?: number
  // Custom metrics
  [key: string]: any
}

export interface TimeSeriesComparison {
  date: string
  timestamp: number
  [ticker: string]: any // Dynamic ticker data
}

export interface ComparisonChartProps {
  data: ComparisonDataPoint[]
  timeSeriesData?: TimeSeriesComparison[]
  title?: string
  loading?: boolean
  error?: string
  chartType?: 'bar' | 'radar' | 'line' | 'area'
  comparisonType?: 'stocks' | 'periods' | 'metrics' | 'performance'
  metrics?: string[]
  colors?: string[]
  showLegend?: boolean
  showGrid?: boolean
  height?: number
  maxItems?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  onSortChange?: (sortBy: string, sortOrder: 'asc' | 'desc') => void
  className?: string
}

const ComparisonChart: React.FC<ComparisonChartProps> = ({
  data,
  timeSeriesData = [],
  title = 'Comparison Analysis',
  loading = false,
  error,
  chartType = 'bar',
  comparisonType = 'stocks',
  metrics = ['return1Y', 'volatility', 'sharpeRatio', 'riskScore'],
  colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'],
  showLegend = true,
  showGrid = true,
  height = 400,
  maxItems = 10,
  sortBy,
  sortOrder = 'desc',
  onSortChange,
  className,
}) => {
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(metrics)
  const [activeChartType, setActiveChartType] = useState(chartType)

  // Metric configuration for different comparison types
  const metricConfigs = {
    stocks: {
      financial: [
        { key: 'peRatio', label: 'P/E Ratio', format: (v: number) => v?.toFixed(1) || 'N/A' },
        { key: 'pbRatio', label: 'P/B Ratio', format: (v: number) => v?.toFixed(1) || 'N/A' },
        { key: 'roe', label: 'ROE %', format: (v: number) => v?.toFixed(1) + '%' || 'N/A' },
        { key: 'roa', label: 'ROA %', format: (v: number) => v?.toFixed(1) + '%' || 'N/A' },
        { key: 'debtToEquity', label: 'D/E Ratio', format: (v: number) => v?.toFixed(2) || 'N/A' },
        { key: 'currentRatio', label: 'Current Ratio', format: (v: number) => v?.toFixed(2) || 'N/A' },
      ],
      performance: [
        { key: 'return1M', label: '1M Return', format: (v: number) => (v > 0 ? '+' : '') + v?.toFixed(1) + '%' || 'N/A' },
        { key: 'return3M', label: '3M Return', format: (v: number) => (v > 0 ? '+' : '') + v?.toFixed(1) + '%' || 'N/A' },
        { key: 'return6M', label: '6M Return', format: (v: number) => (v > 0 ? '+' : '') + v?.toFixed(1) + '%' || 'N/A' },
        { key: 'return1Y', label: '1Y Return', format: (v: number) => (v > 0 ? '+' : '') + v?.toFixed(1) + '%' || 'N/A' },
        { key: 'volatility', label: 'Volatility', format: (v: number) => v?.toFixed(1) + '%' || 'N/A' },
        { key: 'beta', label: 'Beta', format: (v: number) => v?.toFixed(2) || 'N/A' },
        { key: 'sharpeRatio', label: 'Sharpe Ratio', format: (v: number) => v?.toFixed(2) || 'N/A' },
      ],
      risk: [
        { key: 'riskScore', label: 'Risk Score', format: (v: number) => v?.toFixed(0) || 'N/A' },
        { key: 'var', label: 'VaR', format: (v: number) => v?.toFixed(2) + '%' || 'N/A' },
        { key: 'maxDrawdown', label: 'Max Drawdown', format: (v: number) => v?.toFixed(1) + '%' || 'N/A' },
      ],
    },
    periods: [
      { key: 'return', label: 'Return', format: (v: number) => (v > 0 ? '+' : '') + v?.toFixed(1) + '%' || 'N/A' },
      { key: 'volatility', label: 'Volatility', format: (v: number) => v?.toFixed(1) + '%' || 'N/A' },
      { key: 'sharpeRatio', label: 'Sharpe Ratio', format: (v: number) => v?.toFixed(2) || 'N/A' },
    ],
  }

  // Sort and limit data
  const processedData = useMemo(() => {
    let sortedData = [...data]
    
    if (sortBy && data.length > 0 && data[0][sortBy] !== undefined) {
      sortedData.sort((a, b) => {
        const aVal = a[sortBy] || 0
        const bVal = b[sortBy] || 0
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal
      })
    }
    
    return sortedData.slice(0, maxItems)
  }, [data, sortBy, sortOrder, maxItems])

  // Prepare radar chart data
  const radarData = useMemo(() => {
    if (processedData.length === 0) return []
    
    return selectedMetrics.map(metric => {
      const dataPoint: any = { metric }
      processedData.forEach((item, index) => {
        dataPoint[item.name || item.ticker || `Item ${index + 1}`] = item[metric] || 0
      })
      return dataPoint
    })
  }, [processedData, selectedMetrics])

  // Custom tooltip components
  const BarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-neutral-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-neutral-900 mb-2">{label}</p>
          <div className="space-y-1 text-xs">
            {payload.map((entry: any, index: number) => (
              <div key={index} className="flex justify-between gap-4">
                <span style={{ color: entry.color }}>{entry.dataKey}:</span>
                <span className="font-mono font-semibold">
                  {typeof entry.value === 'number' ? entry.value.toFixed(2) : entry.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )
    }
    return null
  }

  const RadarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-neutral-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-neutral-900 mb-2">{label}</p>
          <div className="space-y-1 text-xs">
            {payload.map((entry: any, index: number) => (
              <div key={index} className="flex justify-between gap-4">
                <span style={{ color: entry.color }}>{entry.dataKey}:</span>
                <span className="font-mono font-semibold">
                  {typeof entry.value === 'number' ? entry.value.toFixed(2) : entry.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )
    }
    return null
  }

  const toggleMetric = (metric: string) => {
    setSelectedMetrics(prev =>
      prev.includes(metric)
        ? prev.filter(m => m !== metric)
        : [...prev, metric]
    )
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader title={title} />
        <CardBody>
          <div className="flex items-center justify-center" style={{ height }}>
            <LoadingSpinner size="lg" text="Loading comparison data..." />
          </div>
        </CardBody>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader title={title} />
        <CardBody>
          <EmptyState
            icon="error"
            title="Failed to load comparison data"
            description={error}
            size="sm"
          />
        </CardBody>
      </Card>
    )
  }

  if (!data || data.length === 0) {
    return (
      <Card className={className}>
        <CardHeader title={title} />
        <CardBody>
          <EmptyState
            icon="chart"
            title="No comparison data available"
            description="No data available for comparison analysis"
            size="sm"
          />
        </CardBody>
      </Card>
    )
  }

  const renderBarChart = () => (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={processedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />}
        <XAxis 
          dataKey="name" 
          tick={{ fontSize: 12, fill: '#64748b' }}
          angle={-45}
          textAnchor="end"
          height={80}
        />
        <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
        <Tooltip content={<BarTooltip />} />
        {showLegend && <Legend />}
        
        {selectedMetrics.map((metric, index) => (
          <Bar
            key={metric}
            dataKey={metric}
            fill={colors[index % colors.length]}
            name={metric.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )

  const renderRadarChart = () => (
    <ResponsiveContainer width="100%" height={height}>
      <RadarChart data={radarData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
        <PolarGrid stroke="#e2e8f0" />
        <PolarAngleAxis 
          dataKey="metric" 
          tick={{ fontSize: 12, fill: '#64748b' }}
          tickFormatter={(value) => value.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
        />
        <PolarRadiusAxis 
          angle={90} 
          domain={[0, 'dataMax']} 
          tick={{ fontSize: 10, fill: '#64748b' }}
        />
        <Tooltip content={<RadarTooltip />} />
        {showLegend && <Legend />}
        
        {processedData.map((item, index) => (
          <Radar
            key={item.name || item.ticker || index}
            name={item.name || item.ticker || `Item ${index + 1}`}
            dataKey={item.name || item.ticker || `Item ${index + 1}`}
            stroke={colors[index % colors.length]}
            fill={colors[index % colors.length]}
            fillOpacity={0.1}
            strokeWidth={2}
          />
        ))}
      </RadarChart>
    </ResponsiveContainer>
  )

  const renderLineChart = () => (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={timeSeriesData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />}
        <XAxis
          dataKey="date"
          tick={{ fontSize: 12, fill: '#64748b' }}
          tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        />
        <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
        <Tooltip />
        {showLegend && <Legend />}
        
        {processedData.map((item, index) => (
          <Line
            key={item.ticker || item.name || index}
            type="monotone"
            dataKey={item.ticker || item.name || `series${index}`}
            stroke={colors[index % colors.length]}
            strokeWidth={2}
            dot={false}
            name={item.name || item.ticker || `Series ${index + 1}`}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )

  const renderAreaChart = () => (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={timeSeriesData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />}
        <XAxis
          dataKey="date"
          tick={{ fontSize: 12, fill: '#64748b' }}
          tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        />
        <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
        <Tooltip />
        {showLegend && <Legend />}
        
        {processedData.map((item, index) => (
          <Area
            key={item.ticker || item.name || index}
            type="monotone"
            dataKey={item.ticker || item.name || `series${index}`}
            stackId="1"
            stroke={colors[index % colors.length]}
            fill={colors[index % colors.length]}
            fillOpacity={0.6}
            name={item.name || item.ticker || `Series ${index + 1}`}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  )

  const renderChart = () => {
    switch (activeChartType) {
      case 'bar':
        return renderBarChart()
      case 'radar':
        return renderRadarChart()
      case 'line':
        return timeSeriesData.length > 0 ? renderLineChart() : renderBarChart()
      case 'area':
        return timeSeriesData.length > 0 ? renderAreaChart() : renderBarChart()
      default:
        return renderBarChart()
    }
  }

  const availableMetrics = useMemo(() => {
    if (data.length === 0) return []
    
    const firstItem = data[0]
    return Object.keys(firstItem).filter(key => 
      typeof firstItem[key] === 'number' && 
      key !== 'timestamp' &&
      !key.includes('id')
    )
  }, [data])

  return (
    <Card className={className}>
      <CardHeader
        title={
          <div className="flex items-center gap-3">
            <GitCompare className="w-5 h-5 text-primary-600" />
            <span>{title}</span>
            <div className="text-sm text-neutral-500">
              ({processedData.length} items)
            </div>
          </div>
        }
        action={
          <div className="flex items-center gap-2">
            {/* Chart type selector */}
            <div className="flex bg-neutral-100 rounded-lg p-1">
              <button
                onClick={() => setActiveChartType('bar')}
                className={clsx(
                  'p-1 rounded transition-colors',
                  activeChartType === 'bar'
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-neutral-600 hover:text-neutral-900'
                )}
                title="Bar Chart"
              >
                <BarChart3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setActiveChartType('radar')}
                className={clsx(
                  'p-1 rounded transition-colors',
                  activeChartType === 'radar'
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-neutral-600 hover:text-neutral-900'
                )}
                title="Radar Chart"
              >
                <RadarIcon className="w-4 h-4" />
              </button>
              {timeSeriesData.length > 0 && (
                <>
                  <button
                    onClick={() => setActiveChartType('line')}
                    className={clsx(
                      'p-1 rounded transition-colors',
                      activeChartType === 'line'
                        ? 'bg-white text-primary-600 shadow-sm'
                        : 'text-neutral-600 hover:text-neutral-900'
                    )}
                    title="Line Chart"
                  >
                    <Activity className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setActiveChartType('area')}
                    className={clsx(
                      'p-1 rounded transition-colors',
                      activeChartType === 'area'
                        ? 'bg-white text-primary-600 shadow-sm'
                        : 'text-neutral-600 hover:text-neutral-900'
                    )}
                    title="Area Chart"
                  >
                    <Layers className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>

            {/* Sort options */}
            {availableMetrics.length > 0 && (
              <select
                value={sortBy || ''}
                onChange={(e) => onSortChange?.(e.target.value, sortOrder)}
                className="text-xs border border-neutral-300 rounded px-2 py-1"
              >
                <option value="">Sort by...</option>
                {availableMetrics.map(metric => (
                  <option key={metric} value={metric}>
                    {metric.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </option>
                ))}
              </select>
            )}
          </div>
        }
      />

      <CardBody className="p-0">
        {/* Metric selector */}
        {availableMetrics.length > 0 && (
          <div className="px-6 py-3 border-b border-neutral-200">
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium text-neutral-700 mr-2">Metrics:</span>
              {availableMetrics.slice(0, 8).map((metric) => (
                <button
                  key={metric}
                  onClick={() => toggleMetric(metric)}
                  className={clsx(
                    'px-2 py-1 text-xs rounded border transition-colors',
                    selectedMetrics.includes(metric)
                      ? 'bg-primary-50 border-primary-200 text-primary-700'
                      : 'bg-neutral-50 border-neutral-200 text-neutral-600 hover:bg-neutral-100'
                  )}
                >
                  {metric.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chart */}
        <div className="p-6">
          {renderChart()}
        </div>

        {/* Summary statistics */}
        {processedData.length > 0 && selectedMetrics.length > 0 && (
          <div className="px-6 py-4 border-t border-neutral-200 bg-neutral-50/50">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {selectedMetrics.slice(0, 4).map((metric) => {
                const values = processedData.map(item => item[metric]).filter(v => typeof v === 'number')
                if (values.length === 0) return null
                
                const avg = values.reduce((sum, val) => sum + val, 0) / values.length
                const max = Math.max(...values)
                const min = Math.min(...values)
                
                return (
                  <div key={metric} className="text-center">
                    <div className="text-xs text-neutral-500 mb-1">
                      {metric.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </div>
                    <div className="text-sm font-semibold font-mono text-neutral-700">
                      Avg: {avg.toFixed(2)}
                    </div>
                    <div className="text-xs text-neutral-500">
                      {min.toFixed(2)} - {max.toFixed(2)}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  )
}

export default ComparisonChart
