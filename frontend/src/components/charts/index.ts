// Chart Components Library Index
// This file exports all chart components for easy importing throughout the application

// Stock Chart components
export { default as StockChart } from './StockChart'
export type { StockChartProps, StockDataPoint } from './StockChart'

// Performance Chart components
export { default as PerformanceChart } from './PerformanceChart'
export type { PerformanceChartProps, PerformanceDataPoint } from './PerformanceChart'

// Risk Visualization components
export { default as RiskVisualization } from './RiskVisualization'
export type { 
  RiskVisualizationProps, 
  RiskMetric, 
  RiskDistribution, 
  PortfolioRisk 
} from './RiskVisualization'

// Sentiment Gauge components
export { default as SentimentGauge } from './SentimentGauge'
export type { 
  SentimentGaugeProps, 
  SentimentData, 
  SentimentBreakdown, 
  SentimentTrend 
} from './SentimentGauge'

// Comparison Chart components
export { default as ComparisonChart } from './ComparisonChart'
export type { 
  ComparisonChartProps, 
  ComparisonDataPoint, 
  TimeSeriesComparison 
} from './ComparisonChart'

// Re-export commonly used chart types for convenience
export type ChartType = 'line' | 'bar' | 'area' | 'pie' | 'radar' | 'candlestick'
export type TimeframeType = '1H' | '4H' | '1D' | '1W' | '1M' | '3M' | '6M' | '1Y' | '2Y' | '5Y' | 'ALL'
export type SentimentLevel = 'very_bullish' | 'bullish' | 'neutral' | 'bearish' | 'very_bearish'
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical'

// Chart configuration interfaces
export interface ChartConfig {
  colors: string[]
  height: number
  showLegend: boolean
  showGrid: boolean
  responsive: boolean
}

export interface FinancialChartTheme {
  bull: string
  bear: string
  neutral: string
  risk: string
  background: string
  grid: string
  text: string
}

// Default chart configurations
export const DEFAULT_CHART_CONFIG: ChartConfig = {
  colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'],
  height: 400,
  showLegend: true,
  showGrid: true,
  responsive: true,
}

export const FINANCIAL_CHART_THEME: FinancialChartTheme = {
  bull: '#10b981',
  bear: '#ef4444',
  neutral: '#64748b',
  risk: '#f59e0b',
  background: '#ffffff',
  grid: '#e2e8f0',
  text: '#374151',
}

// Chart utility functions
export const formatCurrency = (value: number, decimals: number = 2): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`
}

export const formatVolume = (value: number): string => {
  if (value >= 1000000000) {
    return `${(value / 1000000000).toFixed(1)}B`
  } else if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`
  }
  return value.toString()
}

export const formatMarketCap = (value: number): string => {
  if (value >= 1000000000000) {
    return `$${(value / 1000000000000).toFixed(1)}T`
  } else if (value >= 1000000000) {
    return `$${(value / 1000000000).toFixed(1)}B`
  } else if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`
  }
  return formatCurrency(value, 0)
}

export const getSentimentColor = (sentiment: number): string => {
  if (sentiment >= 60) return FINANCIAL_CHART_THEME.bull
  if (sentiment >= 20) return '#22c55e'
  if (sentiment >= -20) return FINANCIAL_CHART_THEME.neutral
  if (sentiment >= -60) return '#f97316'
  return FINANCIAL_CHART_THEME.bear
}

export const getRiskColor = (riskScore: number): string => {
  if (riskScore < 25) return FINANCIAL_CHART_THEME.bull
  if (riskScore < 50) return FINANCIAL_CHART_THEME.risk
  if (riskScore < 75) return '#f97316'
  return FINANCIAL_CHART_THEME.bear
}

export const getPerformanceColor = (performance: number): string => {
  return performance >= 0 ? FINANCIAL_CHART_THEME.bull : FINANCIAL_CHART_THEME.bear
}

// Chart data validation utilities
export const validateStockData = (data: any[]): boolean => {
  if (!Array.isArray(data) || data.length === 0) return false
  
  const requiredFields = ['date', 'open', 'high', 'low', 'close', 'volume']
  return data.every(item => 
    requiredFields.every(field => 
      item.hasOwnProperty(field) && typeof item[field] === 'number'
    )
  )
}

export const validatePerformanceData = (data: any[]): boolean => {
  if (!Array.isArray(data) || data.length === 0) return false
  
  const requiredFields = ['date', 'portfolioValue', 'portfolioReturn']
  return data.every(item => 
    requiredFields.every(field => 
      item.hasOwnProperty(field) && 
      (field === 'date' ? typeof item[field] === 'string' : typeof item[field] === 'number')
    )
  )
}

export const validateSentimentData = (data: any[]): boolean => {
  if (!Array.isArray(data) || data.length === 0) return false
  
  const requiredFields = ['source', 'positive', 'negative', 'neutral', 'overall', 'volume']
  return data.every(item => 
    requiredFields.every(field => 
      item.hasOwnProperty(field) && 
      (field === 'source' ? typeof item[field] === 'string' : typeof item[field] === 'number')
    )
  )
}

// Chart component metadata
export const CHART_LIBRARY_VERSION = '1.0.0'
export const CHART_LIBRARY_NAME = 'Project Chimera Charts'

// Supported chart types and their capabilities
export const CHART_CAPABILITIES = {
  StockChart: {
    types: ['line', 'candlestick', 'area'],
    features: ['zoom', 'technical_indicators', 'volume', 'timeframe_selection'],
    dataTypes: ['price', 'volume', 'technical_indicators'],
  },
  PerformanceChart: {
    types: ['line', 'area'],
    features: ['benchmark_comparison', 'drawdown', 'metrics', 'timeframe_selection'],
    dataTypes: ['performance', 'returns', 'drawdown', 'metrics'],
  },
  RiskVisualization: {
    types: ['gauge', 'pie', 'bar', 'heatmap'],
    features: ['risk_breakdown', 'portfolio_risk', 'risk_distribution'],
    dataTypes: ['risk_metrics', 'portfolio_allocation', 'risk_scores'],
  },
  SentimentGauge: {
    types: ['gauge', 'bar', 'trend'],
    features: ['sentiment_breakdown', 'source_analysis', 'trend_analysis'],
    dataTypes: ['sentiment_scores', 'volume', 'source_breakdown'],
  },
  ComparisonChart: {
    types: ['bar', 'radar', 'line', 'area'],
    features: ['multi_metric', 'sorting', 'time_series', 'statistical_summary'],
    dataTypes: ['financial_metrics', 'performance_data', 'comparison_data'],
  },
}

// Usage examples for documentation
export const CHART_EXAMPLES = {
  StockChart: `
    <StockChart
      data={stockData}
      ticker="AAPL"
      chartType="line"
      showVolume={true}
      showTechnicalIndicators={true}
      indicators={['sma20', 'sma50']}
      timeframe="1M"
      onTimeframeChange={(tf) => setTimeframe(tf)}
    />
  `,
  PerformanceChart: `
    <PerformanceChart
      data={performanceData}
      portfolioName="My Portfolio"
      benchmarkName="S&P 500"
      showBenchmark={true}
      showDrawdown={true}
      showMetrics={true}
      timeframe="1Y"
    />
  `,
  RiskVisualization: `
    <RiskVisualization
      overallRiskScore={65}
      riskMetrics={riskMetrics}
      portfolioRisks={portfolioRisks}
      showGauge={true}
      showHeatMap={true}
    />
  `,
  SentimentGauge: `
    <SentimentGauge
      overallSentiment={25}
      sentimentData={sentimentData}
      ticker="AAPL"
      showBreakdown={true}
      showTrend={true}
      timeframe="1D"
    />
  `,
  ComparisonChart: `
    <ComparisonChart
      data={comparisonData}
      chartType="bar"
      metrics={['return1Y', 'volatility', 'sharpeRatio']}
      sortBy="return1Y"
      sortOrder="desc"
    />
  `,
}

// Performance optimization utilities
export const memoizeChartData = <T>(data: T[], keyExtractor: (item: T) => string): T[] => {
  // Simple memoization for chart data to prevent unnecessary re-renders
  const seen = new Set()
  return data.filter(item => {
    const key = keyExtractor(item)
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

export const throttleChartUpdates = (callback: Function, delay: number = 100) => {
  let timeoutId: NodeJS.Timeout | null = null
  
  return (...args: any[]) => {
    if (timeoutId) clearTimeout(timeoutId)
    timeoutId = setTimeout(() => callback(...args), delay)
  }
}
