import React, { useState, useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  ComposedChart,
  Bar,
} from 'recharts'
import { clsx } from 'clsx'
import { TrendingUp, TrendingDown, Target, BarChart3, Activity, Eye, EyeOff } from 'lucide-react'
import { Card, CardHeader, CardBody } from '../ui/Card'
import Button from '../ui/Button'
import { LoadingSpinner } from '../ui/LoadingSpinner'
import { EmptyState } from '../ui/EmptyState'

export interface PerformanceDataPoint {
  date: string
  timestamp: number
  portfolioValue: number
  portfolioReturn: number
  benchmarkValue?: number
  benchmarkReturn?: number
  drawdown?: number
  // Additional metrics
  sharpeRatio?: number
  volatility?: number
  alpha?: number
  beta?: number
}

export interface PerformanceChartProps {
  data: PerformanceDataPoint[]
  portfolioName?: string
  benchmarkName?: string
  loading?: boolean
  error?: string
  showBenchmark?: boolean
  showDrawdown?: boolean
  showMetrics?: boolean
  height?: number
  timeframe?: '1M' | '3M' | '6M' | '1Y' | '2Y' | '5Y' | 'ALL'
  onTimeframeChange?: (timeframe: string) => void
  className?: string
}

const PerformanceChart: React.FC<PerformanceChartProps> = ({
  data,
  portfolioName = 'Portfolio',
  benchmarkName = 'S&P 500',
  loading = false,
  error,
  showBenchmark = true,
  showDrawdown = true,
  showMetrics = true,
  height = 400,
  timeframe = '1Y',
  onTimeframeChange,
  className,
}) => {
  const [visibleLines, setVisibleLines] = useState({
    portfolio: true,
    benchmark: showBenchmark,
    drawdown: showDrawdown,
  })

  const timeframes = [
    { label: '1M', value: '1M' },
    { label: '3M', value: '3M' },
    { label: '6M', value: '6M' },
    { label: '1Y', value: '1Y' },
    { label: '2Y', value: '2Y' },
    { label: '5Y', value: '5Y' },
    { label: 'ALL', value: 'ALL' },
  ]

  // Calculate performance metrics
  const metrics = useMemo(() => {
    if (data.length < 2) return null

    const latest = data[data.length - 1]
    const first = data[0]
    
    const portfolioTotalReturn = ((latest.portfolioValue - first.portfolioValue) / first.portfolioValue) * 100
    const benchmarkTotalReturn = latest.benchmarkValue && first.benchmarkValue 
      ? ((latest.benchmarkValue - first.benchmarkValue) / first.benchmarkValue) * 100 
      : null

    // Calculate annualized return
    const daysDiff = (latest.timestamp - first.timestamp) / (1000 * 60 * 60 * 24)
    const years = daysDiff / 365.25
    const portfolioAnnualizedReturn = years > 0 ? (Math.pow(1 + portfolioTotalReturn / 100, 1 / years) - 1) * 100 : 0

    // Calculate volatility (standard deviation of daily returns)
    const dailyReturns = data.slice(1).map((point, index) => {
      const prevValue = data[index].portfolioValue
      return (point.portfolioValue - prevValue) / prevValue
    })
    const avgReturn = dailyReturns.reduce((sum, ret) => sum + ret, 0) / dailyReturns.length
    const variance = dailyReturns.reduce((sum, ret) => sum + Math.pow(ret - avgReturn, 2), 0) / dailyReturns.length
    const volatility = Math.sqrt(variance * 252) * 100 // Annualized volatility

    // Maximum drawdown
    let maxDrawdown = 0
    let peak = first.portfolioValue
    data.forEach(point => {
      if (point.portfolioValue > peak) {
        peak = point.portfolioValue
      }
      const drawdown = (peak - point.portfolioValue) / peak
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown
      }
    })

    // Sharpe ratio (assuming risk-free rate of 2%)
    const riskFreeRate = 0.02
    const excessReturn = (portfolioAnnualizedReturn / 100) - riskFreeRate
    const sharpeRatio = volatility > 0 ? excessReturn / (volatility / 100) : 0

    return {
      portfolioTotalReturn,
      benchmarkTotalReturn,
      portfolioAnnualizedReturn,
      volatility,
      maxDrawdown: maxDrawdown * 100,
      sharpeRatio,
      alpha: latest.alpha || 0,
      beta: latest.beta || 1,
    }
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
            {visibleLines.portfolio && (
              <div className="flex justify-between gap-4">
                <span className="text-primary-600">Portfolio:</span>
                <span className="font-mono font-semibold">
                  {data.portfolioReturn >= 0 ? '+' : ''}{data.portfolioReturn.toFixed(2)}%
                </span>
              </div>
            )}
            {visibleLines.benchmark && data.benchmarkReturn !== undefined && (
              <div className="flex justify-between gap-4">
                <span className="text-neutral-600">Benchmark:</span>
                <span className="font-mono">
                  {data.benchmarkReturn >= 0 ? '+' : ''}{data.benchmarkReturn.toFixed(2)}%
                </span>
              </div>
            )}
            {visibleLines.drawdown && data.drawdown !== undefined && (
              <div className="flex justify-between gap-4">
                <span className="text-bear-600">Drawdown:</span>
                <span className="font-mono text-bear-600">
                  {data.drawdown.toFixed(2)}%
                </span>
              </div>
            )}
          </div>
        </div>
      )
    }
    return null
  }

  const toggleLine = (line: keyof typeof visibleLines) => {
    setVisibleLines(prev => ({
      ...prev,
      [line]: !prev[line],
    }))
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader title="Performance Chart" />
        <CardBody>
          <div className="flex items-center justify-center" style={{ height }}>
            <LoadingSpinner size="lg" text="Loading performance data..." />
          </div>
        </CardBody>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader title="Performance Chart" />
        <CardBody>
          <EmptyState
            icon="error"
            title="Failed to load performance data"
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
        <CardHeader title="Performance Chart" />
        <CardBody>
          <EmptyState
            icon="chart"
            title="No performance data available"
            description="No performance data available for the selected timeframe"
            size="sm"
          />
        </CardBody>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader
        title={
          <div className="flex items-center gap-3">
            <span>Performance Chart</span>
            {metrics && (
              <div className="flex items-center gap-4 text-sm">
                <div className={clsx(
                  'flex items-center gap-1',
                  metrics.portfolioTotalReturn >= 0 ? 'text-bull-600' : 'text-bear-600'
                )}>
                  {metrics.portfolioTotalReturn >= 0 ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  <span className="font-mono font-semibold">
                    {metrics.portfolioTotalReturn >= 0 ? '+' : ''}
                    {metrics.portfolioTotalReturn.toFixed(2)}%
                  </span>
                </div>
                {metrics.benchmarkTotalReturn !== null && (
                  <div className="text-neutral-600">
                    <span className="text-xs">vs </span>
                    <span className="font-mono">
                      {metrics.benchmarkTotalReturn >= 0 ? '+' : ''}
                      {metrics.benchmarkTotalReturn.toFixed(2)}%
                    </span>
                  </div>
                )}
              </div>
            )}
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

            {/* Line visibility toggles */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleLine('portfolio')}
                className={clsx(
                  'text-xs',
                  visibleLines.portfolio ? 'text-primary-600' : 'text-neutral-400'
                )}
              >
                {visibleLines.portfolio ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                Portfolio
              </Button>
              {showBenchmark && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleLine('benchmark')}
                  className={clsx(
                    'text-xs',
                    visibleLines.benchmark ? 'text-neutral-600' : 'text-neutral-400'
                  )}
                >
                  {visibleLines.benchmark ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                  Benchmark
                </Button>
              )}
              {showDrawdown && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleLine('drawdown')}
                  className={clsx(
                    'text-xs',
                    visibleLines.drawdown ? 'text-bear-600' : 'text-neutral-400'
                  )}
                >
                  {visibleLines.drawdown ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                  Drawdown
                </Button>
              )}
            </div>
          </div>
        }
      />

      <CardBody className="p-0">
        {/* Performance metrics */}
        {showMetrics && metrics && (
          <div className="px-6 py-4 border-b border-neutral-200 bg-neutral-50/50">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <div className="text-center">
                <div className="text-xs text-neutral-500 mb-1">Total Return</div>
                <div className={clsx(
                  'text-sm font-semibold font-mono',
                  metrics.portfolioTotalReturn >= 0 ? 'text-bull-600' : 'text-bear-600'
                )}>
                  {metrics.portfolioTotalReturn >= 0 ? '+' : ''}
                  {metrics.portfolioTotalReturn.toFixed(2)}%
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-neutral-500 mb-1">Annualized</div>
                <div className={clsx(
                  'text-sm font-semibold font-mono',
                  metrics.portfolioAnnualizedReturn >= 0 ? 'text-bull-600' : 'text-bear-600'
                )}>
                  {metrics.portfolioAnnualizedReturn >= 0 ? '+' : ''}
                  {metrics.portfolioAnnualizedReturn.toFixed(2)}%
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-neutral-500 mb-1">Volatility</div>
                <div className="text-sm font-semibold font-mono text-neutral-700">
                  {metrics.volatility.toFixed(2)}%
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-neutral-500 mb-1">Max Drawdown</div>
                <div className="text-sm font-semibold font-mono text-bear-600">
                  -{metrics.maxDrawdown.toFixed(2)}%
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-neutral-500 mb-1">Sharpe Ratio</div>
                <div className={clsx(
                  'text-sm font-semibold font-mono',
                  metrics.sharpeRatio >= 1 ? 'text-bull-600' : 
                  metrics.sharpeRatio >= 0.5 ? 'text-neutral-700' : 'text-bear-600'
                )}>
                  {metrics.sharpeRatio.toFixed(2)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-neutral-500 mb-1">Beta</div>
                <div className="text-sm font-semibold font-mono text-neutral-700">
                  {metrics.beta.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Chart */}
        <div className="p-6">
          <ResponsiveContainer width="100%" height={height}>
            <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12, fill: '#64748b' }}
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis
                yAxisId="return"
                orientation="left"
                tick={{ fontSize: 12, fill: '#64748b' }}
                tickFormatter={(value) => `${value.toFixed(0)}%`}
              />
              {visibleLines.drawdown && (
                <YAxis
                  yAxisId="drawdown"
                  orientation="right"
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  tickFormatter={(value) => `${value.toFixed(0)}%`}
                  domain={['dataMin', 0]}
                />
              )}
              
              <Tooltip content={<CustomTooltip />} />
              <Legend />

              {/* Zero reference line */}
              <ReferenceLine yAxisId="return" y={0} stroke="#64748b" strokeDasharray="2 2" />

              {/* Portfolio performance line */}
              {visibleLines.portfolio && (
                <Line
                  yAxisId="return"
                  type="monotone"
                  dataKey="portfolioReturn"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={false}
                  name={portfolioName}
                />
              )}

              {/* Benchmark performance line */}
              {visibleLines.benchmark && showBenchmark && (
                <Line
                  yAxisId="return"
                  type="monotone"
                  dataKey="benchmarkReturn"
                  stroke="#64748b"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  name={benchmarkName}
                />
              )}

              {/* Drawdown area */}
              {visibleLines.drawdown && showDrawdown && (
                <Area
                  yAxisId="drawdown"
                  type="monotone"
                  dataKey="drawdown"
                  fill="#ef4444"
                  fillOpacity={0.2}
                  stroke="#ef4444"
                  strokeWidth={1}
                  name="Drawdown"
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardBody>
    </Card>
  )
}

export default PerformanceChart
