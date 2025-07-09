import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
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
}

export default function Memos() {
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [recommendationFilter, setRecommendationFilter] = useState<string>('all')

  const { data: memos = [] } = useQuery<Memo[]>({
    queryKey: ['memos'],
    queryFn: async () => {
      const response = await api.get('/memos')
      return response.data
    }
  })

  // Filter memos
  const filteredMemos = memos.filter(memo => {
    const statusMatch = statusFilter === 'all' || memo.status === statusFilter
    const recommendationMatch = recommendationFilter === 'all' || memo.recommendation === recommendationFilter
    return statusMatch && recommendationMatch
  })

  const getRecommendationIcon = (recommendation: string) => {
    switch (recommendation) {
      case 'Buy':
        return <TrendingUp className="h-5 w-5 text-success-600" />
      case 'Sell':
        return <TrendingDown className="h-5 w-5 text-danger-600" />
      case 'Hold':
        return <Minus className="h-5 w-5 text-warning-600" />
      default:
        return <Minus className="h-5 w-5 text-gray-600" />
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-warning-600" />
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-success-600" />
      case 'rejected':
        return <XCircle className="h-5 w-5 text-danger-600" />
      default:
        return <Clock className="h-5 w-5 text-gray-600" />
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
      <div className="card">
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
              className="input-field"
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
              className="input-field"
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
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Memos ({filteredMemos.length})
          </h3>
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
                  <tr key={memo.id} className="hover:bg-gray-50">
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
                        <span className={`ml-2 badge ${getRecommendationBadgeClass(memo.recommendation)}`}>
                          {memo.recommendation}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(memo.status)}
                        <span className={`ml-2 badge ${getStatusBadgeClass(memo.status)}`}>
                          {memo.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(memo.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        to={`/memos/${memo.id}`}
                        className="text-primary-600 hover:text-primary-500"
                      >
                        View Details
                      </Link>
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