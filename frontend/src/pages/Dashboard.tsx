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
  Plus,
  BarChart3
} from 'lucide-react'

interface Memo {
  id: number
  ticker: string
  date: string
  recommendation: 'Buy' | 'Sell' | 'Hold'
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
}

export default function Dashboard() {
  const { data: memos = [] } = useQuery<Memo[]>({
    queryKey: ['memos'],
    queryFn: async () => {
      const response = await api.get('/memos')
      return response.data
    }
  })

  const { data: watchlist = [] } = useQuery<string[]>({
    queryKey: ['watchlist'],
    queryFn: async () => {
      const response = await api.get('/watchlist')
      return response.data
    }
  })

  // Calculate statistics
  const totalMemos = memos.length
  const pendingMemos = memos.filter(m => m.status === 'pending').length
  const approvedMemos = memos.filter(m => m.status === 'approved').length
  const rejectedMemos = memos.filter(m => m.status === 'rejected').length
  
  const buyRecommendations = memos.filter(m => m.recommendation === 'Buy').length
  const sellRecommendations = memos.filter(m => m.recommendation === 'Sell').length
  const holdRecommendations = memos.filter(m => m.recommendation === 'Hold').length

  const recentMemos = memos.slice(0, 5)

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Overview of your investment analysis and portfolio management
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BarChart3 className="h-8 w-8 text-primary-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Total Memos</dt>
                <dd className="text-lg font-medium text-gray-900">{totalMemos}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Clock className="h-8 w-8 text-warning-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Pending Review</dt>
                <dd className="text-lg font-medium text-gray-900">{pendingMemos}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircle className="h-8 w-8 text-success-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Approved</dt>
                <dd className="text-lg font-medium text-gray-900">{approvedMemos}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-success-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Buy Signals</dt>
                <dd className="text-lg font-medium text-gray-900">{buyRecommendations}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Watchlist Summary */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Watchlist</h3>
            <Link
              to="/watchlist"
              className="btn-primary text-sm"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Ticker
            </Link>
          </div>
          
          <div className="space-y-3">
            {watchlist.length === 0 ? (
              <p className="text-gray-500 text-sm">No tickers in watchlist</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {watchlist.slice(0, 8).map((ticker) => (
                  <span
                    key={ticker}
                    className="badge badge-neutral"
                  >
                    {ticker}
                  </span>
                ))}
                {watchlist.length > 8 && (
                  <span className="badge badge-neutral">
                    +{watchlist.length - 8} more
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Recommendation Summary */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Recommendations</h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Buy</span>
              <span className="text-sm font-medium text-success-600">{buyRecommendations}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Sell</span>
              <span className="text-sm font-medium text-danger-600">{sellRecommendations}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Hold</span>
              <span className="text-sm font-medium text-warning-600">{holdRecommendations}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Memos */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Recent Investment Memos</h3>
          <Link
            to="/memos"
            className="text-sm font-medium text-primary-600 hover:text-primary-500"
          >
            View all
          </Link>
        </div>
        
        {recentMemos.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No memos generated yet</p>
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
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentMemos.map((memo) => (
                  <tr key={memo.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        to={`/memos/${memo.id}`}
                        className="text-sm font-medium text-primary-600 hover:text-primary-500"
                      >
                        {memo.ticker}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getRecommendationIcon(memo.recommendation)}
                        <span className="ml-2 text-sm text-gray-900">{memo.recommendation}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(memo.status)}
                        <span className="ml-2 text-sm text-gray-900 capitalize">{memo.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(memo.created_at).toLocaleDateString()}
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