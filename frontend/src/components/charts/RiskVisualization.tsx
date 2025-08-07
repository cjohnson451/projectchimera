import React, { useState, useMemo } from 'react'
import {
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Area,
  AreaChart,
} from 'recharts'
import { clsx } from 'clsx'
import { 
  Shield, 
  AlertTriangle, 
  TrendingDown, 
  Target,
  Activity,
  BarChart3,
  PieChart as PieChartIcon,
  Thermometer
} from 'lucide-react'
import { Card, CardHeader, CardBody } from '../ui/Card'
import Button from '../ui/Button'
import { LoadingSpinner } from '../ui/LoadingSpinner'
import { EmptyState } from '../ui/EmptyState'

export interface RiskMetric {
  name: string
  value: number
  maxValue: number
  category: 'low' | 'medium' | 'high' | 'critical'
  description?: string
}

export interface RiskDistribution {
  category: string
  value: number
  percentage: number
  color: string
}

export interface PortfolioRisk {
  ticker: string
  allocation: number
  riskScore: number
  beta: number
  volatility: number
  var: number // Value at Risk
  expectedShortfall: number
}

export interface RiskVisualizationProps {
  overallRiskScore?: number
  riskMetrics?: RiskMetric[]
  riskDistribution?: RiskDistribution[]
  portfolioRisks?: PortfolioRisk[]
  loading?: boolean
  error?: string
  showGauge?: boolean
  showDistribution?: boolean
  showHeatMap?: boolean
  showMetrics?: boolean
  height?: number
  className?: string
}

const RiskVisualization: React.FC<RiskVisualizationProps> = ({
  overallRiskScore = 0,
  riskMetrics = [],
  riskDistribution = [],
  portfolioRisks = [],
  loading = false,
  error,
  showGauge = true,
  showDistribution = true,
  showHeatMap = true,
  showMetrics = true,
  height = 300,
  className,
}) => {
  const [activeView, setActiveView] = useState<'gauge' | 'distribution' | 'heatmap' | 'metrics'>('gauge')

  // Risk level configuration
  const riskLevels = [
    { min: 0, max: 25, label: 'Low Risk', color: '#10b981', bgColor: '#ecfdf5' },
    { min: 25, max: 50, label: 'Medium Risk', color: '#f59e0b', bgColor: '#fffbeb' },
    { min: 50, max: 75, label: 'High Risk', color: '#f97316', bgColor: '#fff7ed' },
    { min: 75, max: 100, label: 'Critical Risk', color: '#ef4444', bgColor: '#fef2f2' },
  ]

  const getCurrentRiskLevel = (score: number) => {
    return riskLevels.find(level => score >= level.min && score < level.max) || riskLevels[0]
  }

  const currentRiskLevel = getCurrentRiskLevel(overallRiskScore)

  // Gauge chart data
  const gaugeData = useMemo(() => {
    return riskLevels.map(level => ({
      name: level.label,
      value: 25, // Each segment is 25% of the gauge
      fill: level.color,
    }))
  }, [])

  // Heat map data preparation
  const heatMapData = useMemo(() => {
    if (portfolioRisks.length === 0) return []
    
    // Create a grid of risk vs allocation
    return portfolioRisks.map(risk => ({
      ...risk,
      riskCategory: risk.riskScore < 25 ? 'Low' : 
                   risk.riskScore < 50 ? 'Medium' : 
                   risk.riskScore < 75 ? 'High' : 'Critical',
      color: getCurrentRiskLevel(risk.riskScore).color,
    }))
  }, [portfolioRisks])

  // Custom gauge needle component
  const GaugeNeedle = ({ cx, cy, value }: { cx: number; cy: number; value: number }) => {
    const angle = -90 + (value / 100) * 180 // Convert to angle (0-180 degrees)
    const radian = (angle * Math.PI) / 180
    const radius = 80
    const x = cx + radius * Math.cos(radian)
    const y = cy + radius * Math.sin(radian)

    return (
      <g>
        <circle cx={cx} cy={cy} r={8} fill="#374151" />
        <line
          x1={cx}
          y1={cy}
          x2={x}
          y2={y}
          stroke="#374151"
          strokeWidth={3}
          strokeLinecap="round"
        />
      </g>
    )
  }

  // Custom tooltip components
  const RiskTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border border-neutral-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-neutral-900 mb-2">{data.name}</p>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between gap-4">
              <span className="text-neutral-600">Risk Score:</span>
              <span className="font-mono font-semibold">{data.value}</span>
            </div>
            {data.description && (
              <p className="text-neutral-500 mt-2">{data.description}</p>
            )}
          </div>
        </div>
      )
    }
    return null
  }

  const HeatMapTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border border-neutral-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-neutral-900 mb-2">{data.ticker}</p>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between gap-4">
              <span className="text-neutral-600">Allocation:</span>
              <span className="font-mono">{data.allocation.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-neutral-600">Risk Score:</span>
              <span className="font-mono">{data.riskScore.toFixed(1)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-neutral-600">Beta:</span>
              <span className="font-mono">{data.beta.toFixed(2)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-neutral-600">Volatility:</span>
              <span className="font-mono">{data.volatility.toFixed(1)}%</span>
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
        <CardHeader title="Risk Assessment" />
        <CardBody>
          <div className="flex items-center justify-center" style={{ height }}>
            <LoadingSpinner size="lg" text="Loading risk data..." />
          </div>
        </CardBody>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader title="Risk Assessment" />
        <CardBody>
          <EmptyState
            icon="error"
            title="Failed to load risk data"
            description={error}
            size="sm"
          />
        </CardBody>
      </Card>
    )
  }

  const renderGaugeView = () => (
    <div className="space-y-6">
      {/* Overall Risk Score Gauge */}
      <div className="text-center">
        <div className="relative">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={gaugeData}
                cx="50%"
                cy="50%"
                startAngle={180}
                endAngle={0}
                innerRadius={60}
                outerRadius={90}
                dataKey="value"
              >
                {gaugeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pt-8">
            <div className="text-3xl font-bold font-mono" style={{ color: currentRiskLevel.color }}>
              {overallRiskScore.toFixed(0)}
            </div>
            <div className="text-sm text-neutral-600">Risk Score</div>
            <div 
              className="text-xs font-medium px-2 py-1 rounded-full mt-1"
              style={{ 
                color: currentRiskLevel.color,
                backgroundColor: currentRiskLevel.bgColor 
              }}
            >
              {currentRiskLevel.label}
            </div>
          </div>
        </div>
      </div>

      {/* Risk Metrics Bars */}
      {riskMetrics.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-neutral-900">Risk Breakdown</h4>
          {riskMetrics.map((metric, index) => {
            const percentage = (metric.value / metric.maxValue) * 100
            const level = getCurrentRiskLevel(percentage)
            
            return (
              <div key={index} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-neutral-600">{metric.name}</span>
                  <span className="font-mono">{metric.value.toFixed(1)}</span>
                </div>
                <div className="w-full bg-neutral-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${percentage}%`,
                      backgroundColor: level.color 
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )

  const renderDistributionView = () => (
    <div className="space-y-4">
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={riskDistribution}
            cx="50%"
            cy="50%"
            outerRadius={80}
            dataKey="value"
            label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
          >
            {riskDistribution.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )

  const renderHeatMapView = () => (
    <div className="space-y-4">
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={heatMapData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis 
            dataKey="ticker" 
            tick={{ fontSize: 12, fill: '#64748b' }}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis
            yAxisId="allocation"
            orientation="left"
            tick={{ fontSize: 12, fill: '#64748b' }}
            tickFormatter={(value) => `${value}%`}
          />
          <YAxis
            yAxisId="risk"
            orientation="right"
            tick={{ fontSize: 12, fill: '#64748b' }}
            tickFormatter={(value) => value.toFixed(0)}
          />
          <Tooltip content={<HeatMapTooltip />} />
          <Legend />
          
          <Bar
            yAxisId="allocation"
            dataKey="allocation"
            fill="#94a3b8"
            fillOpacity={0.6}
            name="Allocation %"
          />
          <Bar
            yAxisId="risk"
            dataKey="riskScore"
            fill={(entry: any) => entry.color}
            name="Risk Score"
          >
            {heatMapData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )

  const renderMetricsView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* VaR Distribution */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-neutral-900">Value at Risk (95%)</h4>
        <ResponsiveContainer width="100%" height={150}>
          <AreaChart data={portfolioRisks.map(risk => ({ name: risk.ticker, var: risk.var }))}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="var"
              stroke="#ef4444"
              fill="#ef4444"
              fillOpacity={0.3}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Beta Distribution */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-neutral-900">Beta Distribution</h4>
        <ResponsiveContainer width="100%" height={150}>
          <BarChart data={portfolioRisks.map(risk => ({ name: risk.ticker, beta: risk.beta }))}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip />
            <Bar dataKey="beta" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )

  return (
    <Card className={className}>
      <CardHeader
        title={
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-primary-600" />
            <span>Risk Assessment</span>
            {overallRiskScore > 0 && (
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: currentRiskLevel.color }}
                />
                <span className="text-sm font-medium" style={{ color: currentRiskLevel.color }}>
                  {currentRiskLevel.label}
                </span>
              </div>
            )}
          </div>
        }
        action={
          <div className="flex items-center gap-1">
            <Button
              variant={activeView === 'gauge' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setActiveView('gauge')}
              className="text-xs"
            >
              <Thermometer className="w-3 h-3" />
              Gauge
            </Button>
            {riskDistribution.length > 0 && (
              <Button
                variant={activeView === 'distribution' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setActiveView('distribution')}
                className="text-xs"
              >
                <PieChartIcon className="w-3 h-3" />
                Distribution
              </Button>
            )}
            {portfolioRisks.length > 0 && (
              <>
                <Button
                  variant={activeView === 'heatmap' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveView('heatmap')}
                  className="text-xs"
                >
                  <BarChart3 className="w-3 h-3" />
                  Heat Map
                </Button>
                <Button
                  variant={activeView === 'metrics' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveView('metrics')}
                  className="text-xs"
                >
                  <Activity className="w-3 h-3" />
                  Metrics
                </Button>
              </>
            )}
          </div>
        }
      />

      <CardBody>
        {activeView === 'gauge' && renderGaugeView()}
        {activeView === 'distribution' && riskDistribution.length > 0 && renderDistributionView()}
        {activeView === 'heatmap' && portfolioRisks.length > 0 && renderHeatMapView()}
        {activeView === 'metrics' && portfolioRisks.length > 0 && renderMetricsView()}
        
        {((activeView === 'distribution' && riskDistribution.length === 0) ||
          (activeView === 'heatmap' && portfolioRisks.length === 0) ||
          (activeView === 'metrics' && portfolioRisks.length === 0)) && (
          <EmptyState
            icon="chart"
            title="No data available"
            description={`No ${activeView} data available for display`}
            size="sm"
          />
        )}
      </CardBody>
    </Card>
  )
}

export default RiskVisualization
