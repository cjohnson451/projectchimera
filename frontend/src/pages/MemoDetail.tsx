import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  CheckCircle, 
  XCircle,
  ArrowLeft,
  User,
  Brain,
  Shield,
  BarChart3,
  MessageSquare
} from 'lucide-react'
import toast from 'react-hot-toast'
import React, { useState } from 'react'

interface Memo {
  id: number
  ticker: string
  date: string
  fundamental_analysis: string
  technical_analysis: string
  sentiment_analysis: string
  chief_strategist_analysis: string
  risk_assessment: string
  recommendation: 'Buy' | 'Sell' | 'Hold'
  position_size: number | null
  confidence_score: number | null
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  // New fields for full memo structure
  market_opportunity?: string
  business_overview?: string
  competitive_analysis?: string
  management_team?: string
  investment_thesis?: string
  risks_and_mitigation?: string
  valuation_and_deal_structure?: string
  source_citations?: string[]
}

export default function MemoDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: memo, isLoading } = useQuery<Memo>({
    queryKey: ['memo', id],
    queryFn: async () => {
      try {
        const response = await api.get(`/memos/${id}`)
        return response.data
      } catch (err) {
        console.error('Error fetching memo:', err)
        throw err
      }
    },
    enabled: !!id,
    retry: 1
  })

  const decisionMutation = useMutation({
    mutationFn: async ({ decision, notes }: { decision: string; notes?: string }) => {
      await api.post(`/memos/${id}/decision`, { decision, notes })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memo', id] })
      queryClient.invalidateQueries({ queryKey: ['memos'] })
      toast.success(`Memo ${decisionMutation.variables?.decision}`)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to update memo')
    }
  })

  const getRecommendationIcon = (recommendation: string) => {
    switch (recommendation) {
      case 'Buy':
        return <TrendingUp className="h-6 w-6 text-green-600" />
      case 'Sell':
        return <TrendingDown className="h-6 w-6 text-red-600" />
      case 'Hold':
        return <Minus className="h-6 w-6 text-yellow-600" />
      default:
        return <Minus className="h-6 w-6 text-gray-600" />
    }
  }

  const getRecommendationBadgeClass = (recommendation: string) => {
    switch (recommendation) {
      case 'Buy':
        return 'bg-green-100 text-green-800'
      case 'Sell':
        return 'bg-red-100 text-red-800'
      case 'Hold':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!memo) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Memo not found or failed to load.</p>
        <button 
          onClick={() => navigate('/memos')}
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
        >
          Back to Memos
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/memos')}
            className="text-gray-400 hover:text-gray-600"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Investment Memo: {memo.ticker}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Generated on {new Date(memo.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {getRecommendationIcon(memo.recommendation)}
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRecommendationBadgeClass(memo.recommendation)}`}>
              {memo.recommendation}
            </span>
          </div>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(memo.status)}`}>
            {memo.status}
          </span>
        </div>
      </div>

      {/* Recommendation Summary */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Investment Recommendation</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{memo.recommendation}</div>
            <div className="text-sm text-gray-500">Recommendation</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">
              {memo.position_size !== null && memo.position_size !== undefined ? `${memo.position_size}%` : 'N/A'}
            </div>
            <div className="text-sm text-gray-500">Position Size</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">
              {memo.confidence_score !== null && memo.confidence_score !== undefined ? `${Math.round(memo.confidence_score * 100)}%` : 'N/A'}
            </div>
            <div className="text-sm text-gray-500">Confidence</div>
          </div>
        </div>
      </div>

      {/* Memo Sections as vertical list */}
      <div className="space-y-4">
        <Section title="Executive Summary" content={memo.investment_thesis || memo.chief_strategist_analysis || 'No executive summary available.'} />
        <Section title="Market Opportunity" content={memo.market_opportunity || 'No market opportunity data available.'} />
        <Section title="Business Overview" content={memo.business_overview || 'No business overview available.'} />
        <Section title="Competitive Analysis" content={memo.competitive_analysis || 'No competitive analysis available.'} />
        <Section title="Management Team" content={memo.management_team || 'No management team information available.'} />
        <Section title="Valuation & Deal Structure" content={memo.valuation_and_deal_structure || 'No valuation data available.'} />
        <Section title="Risks & Mitigation" content={memo.risks_and_mitigation || memo.risk_assessment || 'No risk assessment available.'} />
        <Section title="Sentiment Analysis" content={memo.sentiment_analysis || 'No sentiment analysis available.'} />
        <Section title="Technical Analysis" content={memo.technical_analysis || 'No technical analysis available.'} />
        <Section title="Financial Analysis" content={memo.fundamental_analysis || 'No financial analysis available.'} />
        <Section title="Source Citations" content={memo.source_citations && memo.source_citations.length > 0 ? memo.source_citations : null} isCitations />
      </div>

      {/* Decision Actions */}
      {memo.status === 'pending' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Portfolio Manager Decision</h3>
          <div className="flex gap-4">
            <button
              onClick={() => decisionMutation.mutate({ decision: 'approved' })}
              disabled={decisionMutation.isPending}
              className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 flex-1 flex items-center justify-center"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              {decisionMutation.isPending ? 'Approving...' : 'Approve'}
            </button>
            <button
              onClick={() => decisionMutation.mutate({ decision: 'rejected' })}
              disabled={decisionMutation.isPending}
              className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 flex-1 flex items-center justify-center"
            >
              <XCircle className="h-4 w-4 mr-2" />
              {decisionMutation.isPending ? 'Rejecting...' : 'Reject'}
            </button>
          </div>
        </div>
      )}

      {/* Decision Status */}
      {memo.status !== 'pending' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2">
            {memo.status === 'approved' ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <XCircle className="h-5 w-5 text-red-600" />
            )}
            <span className="text-sm font-medium text-gray-900">
              Memo {memo.status} by Portfolio Manager
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

// Section component for rendering each memo section
function Section({ title, content, isCitations }: { title: string; content: string | string[] | null | undefined; isCitations?: boolean }) {
  if (isCitations) {
    if (!Array.isArray(content) || content.length === 0) {
      return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
          <div className="text-gray-500">No source citations available.</div>
        </div>
      )
    }
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
        <ul className="list-disc pl-6">
          {content.map((url: string, idx: number) => (
            <li key={idx}>
              <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline break-all">
                {url}
              </a>
            </li>
          ))}
        </ul>
      </div>
    )
  }
  if (!content || typeof content !== 'string') {
    return null
  }
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <div className="prose prose-sm max-w-none whitespace-pre-wrap text-gray-700">{content}</div>
    </div>
  )
} 