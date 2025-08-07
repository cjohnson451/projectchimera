import React, { useState, useMemo } from 'react'
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Brush,
} from 'recharts'
import { clsx } from 'clsx'
import { TrendingUp, TrendingDown, BarChart3, Activity, Maximize2 } from 'lucide-react'
import { Card, CardHeader, CardBody } from '../ui/Card'
import Button from '../ui/Button'
import { LoadingSpinner } from '../ui/LoadingSpinner'
import { EmptyState } from '../ui/EmptyState'

export interface StockDataPoint {
  date: string
  timestamp: number
  open: number
  high: number
  low: number
  close: number
  volume: number
  // Technical indicators (optional)
  sma20?: number
  sma50?: number
  ema12?: number
  ema26?: number
  rsi?: number
  macd?: number
  signal?: number
  bollinger_upper?: number
  bollinger_lower?: number
}

export interface StockChartProps {
  data: StockDataPoint[]
  ticker: string
  loading?: boolean
  error?: string
  chartType?: 'line' | 'candlestick' | 'area'
  showVolume?: boolean
  showTechnicalIndicators?: boolean
  indicators?: ('sma20' | 'sma50' | 'ema12' | 'ema26' | 'bollinger')[]
  height?: number
  timeframe?: '1D' | '1W' | '1M' | '3M' | '6M' | '1Y' | 'ALL'
  onTimeframeChange?: (timeframe: string) => void
  showZoom?: boolean
  className?: string
}

const StockChart: React.FC<StockChartProps> = ({
  data,
  ticker,
  loading = false,
  error,
  chartType = 'line',
  showVolume = true,
  showTechnicalIndicators = false,
  indicators = ['sma20', 'sma50'],
  height = 400,
  timeframe = '1M',
  onTimeframeChange,
  showZoom = true,
  className,
}) => {
  const [selectedIndicators, setSelectedIndicators] = useState<string[]>(indicators)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const timeframes = [
    { label: '1D', value: '1D' },
    { label: '1W', value: '1W' },
    { label: '1M', value: '1M' },
    { label: '3M', value: '3M' },
    { label: '6M', value: '6M' },
    { label: '1Y', value: '1Y' },
    { label: 'ALL', value: 'ALL' },
  ]

  const indicatorOptions = [
    { label: 'SMA 20', value: 'sma20', color: '#3b82f6' },
    { label: 'SMA 50', value: 'sma50', color: '#8b5cf6' },
    { label: 'EMA 12', value: 'ema12', color: '#10b981' },
    { label: 'EMA 26', value: 'ema26', color: '#f59e0b' },
    { label: 'Bollinger', value: 'bollinger', color: '#ef4444' },
  ]

  // Calculate price change and percentage
  const priceChange = useMemo(() => {
    if (data.length < 2) return { change: 0, percentage: 0, isPositive: true }
    
    const latest = data[data.length - 1]
    const previous = data[data.length - 2]
    const change = latest.close - previous.close
    const percentage = (change / previous.close) * 100
    
    return {
      change,
      percentage,
      isPositive: change >= 0,
    }
  }, [data])

  // Format data for candlestick chart
  const candlestickData = useMemo(() => {
    return data.map(point => ({
      ...point,
      // For candlestick representation using high-low bars
      candlestick: [point.low, point.open, point.close, point.high],
    }))
  }, [data])

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border border-neutral-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-neutral-900 mb-2">
            {new Date(data.timestamp).toLocaleDateString()}
          </p>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between gap-4">
              <span className="text-neutral-600">Open:</span>
              <span className="font-mono">${data.open.toFixed(2)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-neutral-600">High:</span>
              <span className="font-mono text-bull-600">${data.high.toFixed(2)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-neutral-600">Low:</span>
              <span className="font-mono text-bear-600">${data.low.toFixed(2)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-neutral-600">Close:</span>
              <span className="font-mono font-semibold">${data.close.toFixed(2)}</span>
            </div>
            {showVolume && (
              <div className="flex justify-between gap-4 pt-1 border-t border-neutral-200">
                <span className="text-neutral-600">Volume:</span>
                <span className="font-mono">{(data.volume / 1000000).toFixed(2)}M</span>
              </div>
            )}
          </div>
        </div>
      )
    }
    return null
  }

  // Custom volume tooltip
  const VolumeTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-2 border border-neutral-200 rounded shadow-lg">
          <p className="text-xs text-neutral-600">
            Volume: {(data.volume / 1000000).toFixed(2)}M
          </p>
        </div>
      )
    }
    return null
  }

  const toggleIndicator = (indicator: string) => {
    setSelectedIndicators(prev =>
      prev.includes(indicator)
        ? prev.filter(i => i !== indicator)
        : [...prev, indicator]
    )
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader title={`${ticker} Stock Chart`} />
        <CardBody>
          <div className="flex items-center justify-center" style={{ height }}>
            <LoadingSpinner size="lg" text="Loading chart data..." />
          </div>
        </CardBody>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader title={`${ticker} Stock Chart`} />
        <CardBody>
          <EmptyState
            icon="error"
            title="Failed to load chart"
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
        <CardHeader title={`${ticker} Stock Chart`} />
        <CardBody>
          <EmptyState
            icon="chart"
            title="No chart data available"
            description="No price data available for the selected timeframe"
            size="sm"
          />
        </CardBody>
      </Card>
    )
  }

  return (
    <Card className={clsx(className, isFullscreen && 'fixed inset-4 z-50')}>
      <CardHeader
        title={
          <div className="flex items-center gap-3">
            <span>{ticker} Stock Chart</span>
            <div className="flex items-center gap-2">
              <span className={clsx(
                'text-lg font-mono font-bold',
                priceChange.isPositive ? 'text-bull-600' : 'text-bear-600'
              )}>
                ${data[data.length - 1]?.close.toFixed(2)}
              </span>
              <div className={clsx(
                'flex items-center gap-1 text-sm font-medium',
                priceChange.isPositive ? 'text-bull-600' : 'text-bear-600'
              )}>
                {priceChange.isPositive ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span className="font-mono">
                  {priceChange.isPositive ? '+' : ''}
                  {priceChange.change.toFixed(2)} ({priceChange.percentage.toFixed(2)}%)
                </span>
              </div>
            </div>
          </div>
        }
        action={
          <div className="flex items-center gap-2">
            {/* Timeframe selector */}
            <div className="flex bg-neutral-100 rounded-lg p-1">
              {timeframes.map((tf) => (
                <button
                  key={tf.value}
                  onClick={() => onTimeframeChange?.(tf.value)}
                  className={clsx(
                    'px-2 py-1 text-xs font-medium rounded transition-colors',
                    timeframe === tf.value
                      ? 'bg-white text-primary-600 shadow-sm'
                      : 'text-neutral-600 hover:text-neutral-900'
                  )}
                >
                  {tf.label}
                </button>
              ))}
            </div>

            {/* Chart type selector */}
            <div className="flex bg-neutral-100 rounded-lg p-1">
              <button
                onClick={() => {}}
                className={clsx(
                  'p-1 rounded transition-colors',
                  chartType === 'line'
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-neutral-600 hover:text-neutral-900'
                )}
                title="Line Chart"
              >
                <Activity className="w-4 h-4" />
              </button>
              <button
                onClick={() => {}}
                className={clsx(
                  'p-1 rounded transition-colors',
                  chartType === 'candlestick'
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-neutral-600 hover:text-neutral-900'
                )}
                title="Candlestick Chart"
              >
                <BarChart3 className="w-4 h-4" />
              </button>
            </div>

            {/* Fullscreen toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              <Maximize2 className="w-4 h-4" />
            </Button>
          </div>
        }
      />

      <CardBody className="p-0">
        {/* Technical indicators selector */}
        {showTechnicalIndicators && (
          <div className="px-6 py-3 border-b border-neutral-200">
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium text-neutral-700 mr-2">Indicators:</span>
              {indicatorOptions.map((indicator) => (
                <button
                  key={indicator.value}
                  onClick={() => toggleIndicator(indicator.value)}
                  className={clsx(
                    'px-2 py-1 text-xs rounded border transition-colors',
                    selectedIndicators.includes(indicator.value)
                      ? 'bg-primary-50 border-primary-200 text-primary-700'
                      : 'bg-neutral-50 border-neutral-200 text-neutral-600 hover:bg-neutral-100'
                  )}
                >
                  <span
                    className="inline-block w-2 h-2 rounded-full mr-1"
                    style={{ backgroundColor: indicator.color }}
                  />
                  {indicator.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Main price chart */}
        <div className="p-6">
          <ResponsiveContainer width="100%" height={height}>
            <ComposedChart data={candlestickData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12, fill: '#64748b' }}
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis
                yAxisId="price"
                orientation="right"
                tick={{ fontSize: 12, fill: '#64748b' }}
                tickFormatter={(value) => `$${value.toFixed(0)}`}
                domain={['dataMin - 5', 'dataMax + 5']}
              />
              {showVolume && (
                <YAxis
                  yAxisId="volume"
                  orientation="left"
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
                />
              )}
              
              <Tooltip content={<CustomTooltip />} />
              <Legend />

              {/* Volume bars */}
              {showVolume && (
                <Bar
                  yAxisId="volume"
                  dataKey="volume"
                  fill="#94a3b8"
                  fillOpacity={0.3}
                  name="Volume"
                />
              )}

              {/* Price line/candlestick */}
              {chartType === 'line' ? (
                <Line
                  yAxisId="price"
                  type="monotone"
                  dataKey="close"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                  name="Price"
                />
              ) : (
                // Simplified candlestick using high-low bars with close markers
                <>
                  <Bar
                    yAxisId="price"
                    dataKey="high"
                    fill="transparent"
                    stroke="#64748b"
                    strokeWidth={1}
                    name="High-Low"
                  />
                  <Line
                    yAxisId="price"
                    type="monotone"
                    dataKey="close"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ r: 2 }}
                    name="Close"
                  />
                </>
              )}

              {/* Technical indicators */}
              {showTechnicalIndicators && selectedIndicators.includes('sma20') && (
                <Line
                  yAxisId="price"
                  type="monotone"
                  dataKey="sma20"
                  stroke="#3b82f6"
                  strokeWidth={1}
                  strokeDasharray="5 5"
                  dot={false}
                  name="SMA 20"
                />
              )}
              {showTechnicalIndicators && selectedIndicators.includes('sma50') && (
                <Line
                  yAxisId="price"
                  type="monotone"
                  dataKey="sma50"
                  stroke="#8b5cf6"
                  strokeWidth={1}
                  strokeDasharray="5 5"
                  dot={false}
                  name="SMA 50"
                />
              )}
              {showTechnicalIndicators && selectedIndicators.includes('ema12') && (
                <Line
                  yAxisId="price"
                  type="monotone"
                  dataKey="ema12"
                  stroke="#10b981"
                  strokeWidth={1}
                  dot={false}
                  name="EMA 12"
                />
              )}
              {showTechnicalIndicators && selectedIndicators.includes('ema26') && (
                <Line
                  yAxisId="price"
                  type="monotone"
                  dataKey="ema26"
                  stroke="#f59e0b"
                  strokeWidth={1}
                  dot={false}
                  name="EMA 26"
                />
              )}
              {showTechnicalIndicators && selectedIndicators.includes('bollinger') && (
                <>
                  <Line
                    yAxisId="price"
                    type="monotone"
                    dataKey="bollinger_upper"
                    stroke="#ef4444"
                    strokeWidth={1}
                    strokeDasharray="3 3"
                    dot={false}
                    name="Bollinger Upper"
                  />
                  <Line
                    yAxisId="price"
                    type="monotone"
                    dataKey="bollinger_lower"
                    stroke="#ef4444"
                    strokeWidth={1}
                    strokeDasharray="3 3"
                    dot={false}
                    name="Bollinger Lower"
                  />
                </>
              )}

              {/* Zoom functionality */}
              {showZoom && data.length > 20 && (
                <Brush
                  dataKey="date"
                  height={30}
                  stroke="#3b82f6"
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short' })}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardBody>
    </Card>
  )
}

export default StockChart
