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
}

export default function MemoDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: memo, isLoading } = useQuery<Memo>({
    queryKey: ['memo', id],
    queryFn: async () => {
      const response = await api.get(`/memos/${id}`)
      return response.data
    },
    enabled: !!id
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
        return <TrendingUp className="h-6 w-6 text-success-600" />
      case 'Sell':
        return <TrendingDown className="h-6 w-6 text-danger-600" />
      case 'Hold':
        return <Minus className="h-6 w-6 text-warning-600" />
      default:
        return <Minus className="h-6 w-6 text-gray-600" />
    }
  }

  const getRecommendationBadgeClass = (recommendation: string) => {
    switch (recommendation) {
      case 'Buy':
        return 'badge-success'
      case 'Sell':
        return 'badge-danger'
      case 'Hold':
        return 'badge-warning'
      default:
        return 'badge-neutral'
    }
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending':
        return 'badge-warning'
      case 'approved':
        return 'badge-success'
      case 'rejected':
        return 'badge-danger'
      default:
        return 'badge-neutral'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!memo) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Memo not found</p>
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
            <span className={`badge ${getRecommendationBadgeClass(memo.recommendation)}`}>
              {memo.recommendation}
            </span>
          </div>
          <span className={`badge ${getStatusBadgeClass(memo.status)}`}>
            {memo.status}
          </span>
        </div>
      </div>

      {/* Recommendation Summary */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Investment Recommendation</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{memo.recommendation}</div>
            <div className="text-sm text-gray-500">Recommendation</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">
              {memo.position_size ? `${memo.position_size}%` : 'N/A'}
            </div>
            <div className="text-sm text-gray-500">Position Size</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">
              {memo.confidence_score ? `${Math.round(memo.confidence_score * 100)}%` : 'N/A'}
            </div>
            <div className="text-sm text-gray-500">Confidence</div>
          </div>
        </div>
      </div>

      {/* Agent Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fundamental Analysis */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-medium text-gray-900">Fundamental Analysis</h3>
          </div>
          <div className="prose prose-sm max-w-none">
            <p className="text-gray-700 whitespace-pre-wrap">{memo.fundamental_analysis}</p>
          </div>
        </div>

        {/* Technical Analysis */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-green-600" />
            <h3 className="text-lg font-medium text-gray-900">Technical Analysis</h3>
          </div>
          <div className="prose prose-sm max-w-none">
            <p className="text-gray-700 whitespace-pre-wrap">{memo.technical_analysis}</p>
          </div>
        </div>

        {/* Sentiment Analysis */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="h-5 w-5 text-purple-600" />
            <h3 className="text-lg font-medium text-gray-900">Sentiment Analysis</h3>
          </div>
          <div className="prose prose-sm max-w-none">
            <p className="text-gray-700 whitespace-pre-wrap">{memo.sentiment_analysis}</p>
          </div>
        </div>

        {/* Risk Assessment */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="h-5 w-5 text-red-600" />
            <h3 className="text-lg font-medium text-gray-900">Risk Assessment</h3>
          </div>
          <div className="prose prose-sm max-w-none">
            <p className="text-gray-700 whitespace-pre-wrap">{memo.risk_assessment}</p>
          </div>
        </div>
      </div>

      {/* Chief Strategist Analysis */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="h-5 w-5 text-indigo-600" />
          <h3 className="text-lg font-medium text-gray-900">Chief Strategist Analysis</h3>
        </div>
        <div className="prose prose-sm max-w-none">
          <p className="text-gray-700 whitespace-pre-wrap">{memo.chief_strategist_analysis}</p>
        </div>
      </div>

      {/* Decision Actions */}
      {memo.status === 'pending' && (
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Portfolio Manager Decision</h3>
          <div className="flex gap-4">
            <button
              onClick={() => decisionMutation.mutate({ decision: 'approved' })}
              disabled={decisionMutation.isPending}
              className="btn-success flex-1"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              {decisionMutation.isPending ? 'Approving...' : 'Approve'}
            </button>
            <button
              onClick={() => decisionMutation.mutate({ decision: 'rejected' })}
              disabled={decisionMutation.isPending}
              className="btn-danger flex-1"
            >
              <XCircle className="h-4 w-4 mr-2" />
              {decisionMutation.isPending ? 'Rejecting...' : 'Reject'}
            </button>
          </div>
        </div>
      )}

      {/* Decision Status */}
      {memo.status !== 'pending' && (
        <div className="card">
          <div className="flex items-center gap-2">
            {memo.status === 'approved' ? (
              <CheckCircle className="h-5 w-5 text-success-600" />
            ) : (
              <XCircle className="h-5 w-5 text-danger-600" />
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