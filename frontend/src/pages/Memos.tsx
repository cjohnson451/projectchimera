import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import { deleteMemo, cleanupPendingMemos } from '../lib/api'
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Clock, 
  CheckCircle, 
  XCircle,
  Filter
} from 'lucide-react'

interface Memo {
  id: number
  ticker: string
  date: string
  recommendation: 'Buy' | 'Sell' | 'Hold'
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  fundamental_analysis?: string
  technical_analysis?: string
  sentiment_analysis?: string
  chief_strategist_analysis?: string
  risk_assessment?: string
}

export default function Memos() {
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [recommendationFilter, setRecommendationFilter] = useState<string>('all')
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [cleaningUp, setCleaningUp] = useState(false)
  const queryClient = useQueryClient()

  const { data: memos = [], error, isLoading, isError } = useQuery<Memo[]>({
    queryKey: ['memos'],
    queryFn: async () => {
      try {
        const response = await api.get('/memos')
        console.log('Memos API response:', response.data)
        
        // Ensure all memos have the required fields with defaults
        const processedMemos = response.data.map((memo: any) => ({
          id: memo.id,
          ticker: memo.ticker || '',
          date: memo.date || '',
          recommendation: memo.recommendation || 'Hold',
          status: memo.status || 'pending',
          created_at: memo.created_at || new Date().toISOString(),
          fundamental_analysis: memo.fundamental_analysis || '',
          technical_analysis: memo.technical_analysis || '',
          sentiment_analysis: memo.sentiment_analysis || '',
          chief_strategist_analysis: memo.chief_strategist_analysis || '',
          risk_assessment: memo.risk_assessment || ''
        }))
        
        return processedMemos
      } catch (err) {
        console.error('Error fetching memos:', err)
        throw err
      }
    },
    refetchInterval: false,
    retry: 1,
    staleTime: 30000,
    refetchOnWindowFocus: false
  })

  // Filter memos with safe access
  const filteredMemos = memos.filter(memo => {
    if (!memo) return false
    const statusMatch = statusFilter === 'all' || memo.status === statusFilter
    const recommendationMatch = recommendationFilter === 'all' || memo.recommendation === recommendationFilter
    return statusMatch && recommendationMatch
  })

  const handleDelete = async (memoId: number) => {
    if (!window.confirm('Are you sure you want to delete this memo?')) return
    setDeletingId(memoId)
    try {
      await deleteMemo(memoId)
      queryClient.invalidateQueries({ queryKey: ['memos'] })
    } catch (err) {
      console.error('Error deleting memo:', err)
      alert('Failed to delete memo')
    } finally {
      setDeletingId(null)
    }
  }

  const handleCleanup = async () => {
    if (!window.confirm('This will mark all pending memos as rejected. Continue?')) return
    setCleaningUp(true)
    try {
      await cleanupPendingMemos()
      queryClient.invalidateQueries({ queryKey: ['memos'] })
    } catch (err) {
      console.error('Error cleaning up memos:', err)
      alert('Failed to cleanup pending memos')
    } finally {
      setCleaningUp(false)
    }
  }

  const getRecommendationIcon = (recommendation: string) => {
    switch (recommendation) {
      case 'Buy':
        return <TrendingUp className="h-5 w-5 text-green-600" />
      case 'Sell':
        return <TrendingDown className="h-5 w-5 text-red-600" />
      case 'Hold':
        return <Minus className="h-5 w-5 text-yellow-600" />
      default:
        return <Minus className="h-5 w-5 text-gray-600" />
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-600" />
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-600" />
      default:
        return <Clock className="h-5 w-5 text-gray-600" />
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
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Investment Memos</h1>
          <p className="mt-1 text-sm text-gray-500">
            Review AI-generated investment analysis and recommendations
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading memos...</p>
          </div>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Investment Memos</h1>
          <p className="mt-1 text-sm text-gray-500">
            Review AI-generated investment analysis and recommendations
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-center py-8">
            <p className="text-red-500 mb-4">Error loading memos</p>
            <p className="text-sm text-gray-400 mb-4">
              {error instanceof Error ? error.message : 'Unknown error occurred'}
            </p>
            <button 
              onClick={() => queryClient.invalidateQueries({ queryKey: ['memos'] })}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Investment Memos</h1>
        <p className="mt-1 text-sm text-gray-500">
          Review AI-generated investment analysis and recommendations
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-4 mb-4">
          <Filter className="h-5 w-5 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900">Filters</h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recommendation
            </label>
            <select
              value={recommendationFilter}
              onChange={(e) => setRecommendationFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Recommendations</option>
              <option value="Buy">Buy</option>
              <option value="Sell">Sell</option>
              <option value="Hold">Hold</option>
            </select>
          </div>
        </div>
      </div>

      {/* Memos Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Memos ({filteredMemos.length})
          </h3>
          {memos.some(m => m.status === 'pending') && (
            <button
              onClick={handleCleanup}
              disabled={cleaningUp}
              className="bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50"
            >
              {cleaningUp ? 'Cleaning...' : 'Cleanup Stuck Memos'}
            </button>
          )}
        </div>
        
        {filteredMemos.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No memos found</p>
            <p className="text-sm text-gray-400">
              {memos.length === 0 
                ? 'Generate your first memo from the watchlist page'
                : 'Try adjusting your filters'
              }
            </p>
          </div>
        ) : (
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ticker
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Recommendation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMemos.map((memo) => (
                  <tr key={memo.id} className={`hover:bg-gray-50 ${memo.status === 'pending' ? 'opacity-60 bg-yellow-50' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-900">
                          {memo.ticker}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getRecommendationIcon(memo.recommendation)}
                        <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRecommendationBadgeClass(memo.recommendation)}`}>
                          {memo.recommendation}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(memo.status)}
                        <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(memo.status)}`}>
                          {memo.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(memo.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {memo.status === 'pending' ? (
                        <span className="italic text-gray-500">Generating...</span>
                      ) : (
                        <>
                          <button
                            className="bg-red-600 hover:bg-red-700 text-white font-medium py-1 px-3 rounded text-xs transition-colors duration-200 disabled:opacity-50"
                            disabled={deletingId === memo.id}
                            onClick={() => handleDelete(memo.id)}
                          >
                            {deletingId === memo.id ? 'Deleting...' : 'Delete'}
                          </button>
                          <Link
                            to={`/memos/${memo.id}`}
                            className="ml-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-1 px-3 rounded text-xs transition-colors duration-200"
                          >
                            View
                          </Link>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
} 