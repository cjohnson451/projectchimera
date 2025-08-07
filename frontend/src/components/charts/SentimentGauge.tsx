import React, { useState, useMemo } from 'react'
import {
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'
import { clsx } from 'clsx'
import { 
  Smile, 
  Frown, 
  Meh, 
  TrendingUp, 
  TrendingDown,
  MessageSquare,
  Users,
  Globe,
  BarChart3,
  Activity,
  Eye
} from 'lucide-react'
import { Card, CardHeader, CardBody } from '../ui/Card'
import Button from '../ui/Button'
import { LoadingSpinner } from '../ui/LoadingSpinner'
import { EmptyState } from '../ui/EmptyState'

export interface SentimentData {
  source: string
  positive: number
  negative: number
  neutral: number
  overall: number // -100 to 100 scale
  volume: number
  timestamp: number
}

export interface SentimentBreakdown {
  category: string
  sentiment: number
  volume: number
  change: number
  color: string
}

export interface SentimentTrend {
  date: string
  timestamp: number
  sentiment: number
  volume: number
}

export interface SentimentGaugeProps {
  overallSentiment?: number
  sentimentData?: SentimentData[]
  sentimentBreakdown?: SentimentBreakdown[]
  sentimentTrend?: SentimentTrend[]
  ticker?: string
  loading?: boolean
  error?: string
  showBreakdown?: boolean
  showTrend?: boolean
  showSources?: boolean
  height?: number
  timeframe?: '1H' | '4H' | '1D' | '1W' | '1M'
  onTimeframeChange?: (timeframe: string) => void
  className?: string
}

const SentimentGauge: React.FC<SentimentGaugeProps> = ({
  overallSentiment = 0,
  sentimentData = [],
  sentimentBreakdown = [],
  sentimentTrend = [],
  ticker,
  loading = false,
  error,
  showBreakdown = true,
  showTrend = true,
  showSources = true,
  height = 300,
  timeframe = '1D',
  onTimeframeChange,
  className,
}) => {
  const [activeView, setActiveView] = useState<'gauge' | 'breakdown' | 'trend' | 'sources'>('gauge')

  const timeframes = [
    { label: '1H', value: '1H' },
    { label: '4H', value: '4H' },
    { label: '1D', value: '1D' },
    { label: '1W', value: '1W' },
    { label: '1M', value: '1M' },
  ]

  // Sentiment level configuration
  const getSentimentLevel = (sentiment: number) => {
    if (sentiment >= 60) return { label: 'Very Bullish', color: '#10b981', bgColor: '#ecfdf5', icon: Smile }
    if (sentiment >= 20) return { label: 'Bullish', color: '#22c55e', bgColor: '#f0fdf4', icon: TrendingUp }
    if (sentiment >= -20) return { label: 'Neutral', color: '#64748b', bgColor: '#f8fafc', icon: Meh }
    if (sentiment >= -60) return { label: 'Bearish', color: '#f97316', bgColor: '#fff7ed', icon: TrendingDown }
    return { label: 'Very Bearish', color: '#ef4444', bgColor: '#fef2f2', icon: Frown }
  }

  const currentSentimentLevel = getSentimentLevel(overallSentiment)

  // Gauge data for radial chart
  const gaugeData = useMemo(() => {
    // Convert sentiment (-100 to 100) to percentage (0 to 100)
    const percentage = ((overallSentiment + 100) / 200) * 100
    
    return [
      {
        name: 'Sentiment',
        value: percentage,
        fill: currentSentimentLevel.color,
      },
      {
        name: 'Remaining',
        value: 100 - percentage,
        fill: '#e2e8f0',
      }
    ]
  }, [overallSentiment, currentSentimentLevel.color])

  // Sentiment distribution data
  const distributionData = useMemo(() => {
    if (sentimentData.length === 0) return []
    
    const totalVolume = sentimentData.reduce((sum, data) => sum + data.volume, 0)
    
    return sentimentData.map(data => ({
      name: data.source,
      positive: data.positive,
      negative: data.negative,
      neutral: data.neutral,
      volume: data.volume,
      volumePercentage: (data.volume / totalVolume) * 100,
    }))
  }, [sentimentData])

  // Custom tooltip components
  const SentimentTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border border-neutral-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-neutral-900 mb-2">{data.name}</p>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between gap-4">
              <span className="text-neutral-600">Sentiment:</span>
              <span className="font-mono font-semibold">{data.sentiment?.toFixed(1) || 'N/A'}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-neutral-600">Volume:</span>
              <span className="font-mono">{data.volume?.toLocaleString() || 'N/A'}</span>
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  const BreakdownTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border border-neutral-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-neutral-900 mb-2">{data.name}</p>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between gap-4">
              <span className="text-bull-600">Positive:</span>
              <span className="font-mono">{data.positive?.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-neutral-600">Neutral:</span>
              <span className="font-mono">{data.neutral?.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-bear-600">Negative:</span>
              <span className="font-mono">{data.negative?.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between gap-4 pt-1 border-t border-neutral-200">
              <span className="text-neutral-600">Volume:</span>
              <span className="font-mono">{data.volume?.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader title={`${ticker ? `${ticker} ` : ''}Sentiment Analysis`} />
        <CardBody>
          <div className="flex items-center justify-center" style={{ height }}>
            <LoadingSpinner size="lg" text="Loading sentiment data..." />
          </div>
        </CardBody>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader title={`${ticker ? `${ticker} ` : ''}Sentiment Analysis`} />
        <CardBody>
          <EmptyState
            icon="error"
            title="Failed to load sentiment data"
            description={error}
            size="sm"
          />
        </CardBody>
      </Card>
    )
  }

  const renderGaugeView = () => (
    <div className="space-y-6">
      {/* Main Sentiment Gauge */}
      <div className="text-center">
        <div className="relative">
          <ResponsiveContainer width="100%" height={200}>
            <RadialBarChart
              cx="50%"
              cy="50%"
              innerRadius="60%"
              outerRadius="90%"
              data={[{ value: ((overallSentiment + 100) / 200) * 100 }]}
              startAngle={180}
              endAngle={0}
            >
              <RadialBar
                dataKey="value"
                cornerRadius={10}
                fill={currentSentimentLevel.color}
              />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pt-4">
            <currentSentimentLevel.icon 
              className="w-8 h-8 mb-2" 
              style={{ color: currentSentimentLevel.color }}
            />
            <div className="text-3xl font-bold font-mono" style={{ color: currentSentimentLevel.color }}>
              {overallSentiment > 0 ? '+' : ''}{overallSentiment.toFixed(0)}
            </div>
            <div className="text-sm text-neutral-600">Sentiment Score</div>
            <div 
              className="text-xs font-medium px-2 py-1 rounded-full mt-1"
              style={{ 
                color: currentSentimentLevel.color,
                backgroundColor: currentSentimentLevel.bgColor 
              }}
            >
              {currentSentimentLevel.label}
            </div>
          </div>
        </div>
      </div>

      {/* Sentiment Breakdown Cards */}
      {sentimentBreakdown.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {sentimentBreakdown.slice(0, 3).map((item, index) => {
            const level = getSentimentLevel(item.sentiment)
            return (
              <div key={index} className="text-center p-4 rounded-lg border border-neutral-200">
                <div className="text-xs text-neutral-500 mb-1">{item.category}</div>
                <div className="text-lg font-bold font-mono" style={{ color: level.color }}>
                  {item.sentiment > 0 ? '+' : ''}{item.sentiment.toFixed(0)}
                </div>
                <div className="text-xs text-neutral-600">
                  {item.volume.toLocaleString()} mentions
                </div>
                {item.change !== 0 && (
                  <div className={clsx(
                    'text-xs font-medium mt-1',
                    item.change > 0 ? 'text-bull-600' : 'text-bear-600'
                  )}>
                    {item.change > 0 ? '+' : ''}{item.change.toFixed(1)}%
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )

  const renderBreakdownView = () => (
    <div className="space-y-4">
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={distributionData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 12, fill: '#64748b' }}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis
            tick={{ fontSize: 12, fill: '#64748b' }}
            tickFormatter={(value) => `${value}%`}
          />
          <Tooltip content={<BreakdownTooltip />} />
          <Legend />
          
          <Bar dataKey="positive" stackId="sentiment" fill="#10b981" name="Positive" />
          <Bar dataKey="neutral" stackId="sentiment" fill="#64748b" name="Neutral" />
          <Bar dataKey="negative" stackId="sentiment" fill="#ef4444" name="Negative" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )

  const renderTrendView = () => (
    <div className="space-y-4">
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={sentimentTrend} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12, fill: '#64748b' }}
            tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          />
          <YAxis
            tick={{ fontSize: 12, fill: '#64748b' }}
            domain={[-100, 100]}
            tickFormatter={(value) => value.toString()}
          />
          <Tooltip content={<SentimentTooltip />} />
          
          <Bar 
            dataKey="sentiment" 
            fill={(entry: any) => entry.sentiment >= 0 ? '#10b981' : '#ef4444'}
            name="Sentiment"
          >
            {sentimentTrend.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.sentiment >= 0 ? '#10b981' : '#ef4444'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )

  const renderSourcesView = () => (
    <div className="space-y-4">
      {sentimentData.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sentimentData.map((source, index) => {
            const level = getSentimentLevel(source.overall)
            return (
              <div key={index} className="p-4 border border-neutral-200 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {source.source.toLowerCase().includes('news') && <Globe className="w-4 h-4 text-neutral-500" />}
                    {source.source.toLowerCase().includes('social') && <Users className="w-4 h-4 text-neutral-500" />}
                    {source.source.toLowerCase().includes('analyst') && <MessageSquare className="w-4 h-4 text-neutral-500" />}
                    <span className="font-medium text-sm">{source.source}</span>
                  </div>
                  <div className="text-xs text-neutral-500">
                    {source.volume.toLocaleString()} mentions
                  </div>
                </div>
                
                <div className="flex items-center gap-3 mb-3">
                  <div className="text-lg font-bold font-mono" style={{ color: level.color }}>
                    {source.overall > 0 ? '+' : ''}{source.overall.toFixed(0)}
                  </div>
                  <div 
                    className="text-xs font-medium px-2 py-1 rounded-full"
                    style={{ 
                      color: level.color,
                      backgroundColor: level.bgColor 
                    }}
                  >
                    {level.label}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-bull-600">Positive</span>
                    <span className="font-mono">{source.positive.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-neutral-200 rounded-full h-1">
                    <div
                      className="h-1 rounded-full bg-bull-500"
                      style={{ width: `${source.positive}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-xs">
                    <span className="text-neutral-600">Neutral</span>
                    <span className="font-mono">{source.neutral.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-neutral-200 rounded-full h-1">
                    <div
                      className="h-1 rounded-full bg-neutral-500"
                      style={{ width: `${source.neutral}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-xs">
                    <span className="text-bear-600">Negative</span>
                    <span className="font-mono">{source.negative.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-neutral-200 rounded-full h-1">
                    <div
                      className="h-1 rounded-full bg-bear-500"
                      style={{ width: `${source.negative}%` }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <EmptyState
          icon="chart"
          title="No source data available"
          description="No sentiment source data available for display"
          size="sm"
        />
      )}
    </div>
  )

  return (
    <Card className={className}>
      <CardHeader
        title={
          <div className="flex items-center gap-3">
            <MessageSquare className="w-5 h-5 text-primary-600" />
            <span>{ticker ? `${ticker} ` : ''}Sentiment Analysis</span>
            {overallSentiment !== 0 && (
              <div className="flex items-center gap-2">
                <currentSentimentLevel.icon 
                  className="w-4 h-4" 
                  style={{ color: currentSentimentLevel.color }}
                />
                <span className="text-sm font-medium" style={{ color: currentSentimentLevel.color }}>
                  {overallSentiment > 0 ? '+' : ''}{overallSentiment.toFixed(0)}
                </span>
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

            {/* View selector */}
            <div className="flex items-center gap-1">
              <Button
                variant={activeView === 'gauge' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setActiveView('gauge')}
                className="text-xs"
              >
                <Activity className="w-3 h-3" />
                Gauge
              </Button>
              {distributionData.length > 0 && (
                <Button
                  variant={activeView === 'breakdown' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveView('breakdown')}
                  className="text-xs"
                >
                  <BarChart3 className="w-3 h-3" />
                  Breakdown
                </Button>
              )}
              {sentimentTrend.length > 0 && (
                <Button
                  variant={activeView === 'trend' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveView('trend')}
                  className="text-xs"
                >
                  <TrendingUp className="w-3 h-3" />
                  Trend
                </Button>
              )}
              {sentimentData.length > 0 && (
                <Button
                  variant={activeView === 'sources' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveView('sources')}
                  className="text-xs"
                >
                  <Eye className="w-3 h-3" />
                  Sources
                </Button>
              )}
            </div>
          </div>
        }
      />

      <CardBody>
        {activeView === 'gauge' && renderGaugeView()}
        {activeView === 'breakdown' && renderBreakdownView()}
        {activeView === 'trend' && renderTrendView()}
        {activeView === 'sources' && renderSourcesView()}
      </CardBody>
    </Card>
  )
}

export default SentimentGauge
