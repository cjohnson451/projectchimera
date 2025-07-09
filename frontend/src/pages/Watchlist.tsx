import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { X, Plus, Play } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Watchlist() {
  const [newTicker, setNewTicker] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const queryClient = useQueryClient()

  const { data: watchlist = [] } = useQuery<string[]>({
    queryKey: ['watchlist'],
    queryFn: async () => {
      const response = await api.get('/watchlist')
      return response.data
    }
  })

  const addTickerMutation = useMutation({
    mutationFn: async (ticker: string) => {
      await api.post('/watchlist', { ticker })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlist'] })
      setNewTicker('')
      toast.success(`Added ${newTicker.toUpperCase()} to watchlist`)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to add ticker')
    }
  })

  const removeTickerMutation = useMutation({
    mutationFn: async (ticker: string) => {
      await api.delete(`/watchlist/${ticker}`)
    },
    onSuccess: (_, ticker) => {
      queryClient.invalidateQueries({ queryKey: ['watchlist'] })
      toast.success(`Removed ${ticker} from watchlist`)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to remove ticker')
    }
  })

  const generateAllMemosMutation = useMutation({
    mutationFn: async () => {
      await api.post('/memos/generate-all')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memos'] })
      toast.success('Generated memos for all tickers')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to generate memos')
    }
  })

  const handleAddTicker = (e: React.FormEvent) => {
    e.preventDefault()
    if (newTicker.trim()) {
      addTickerMutation.mutate(newTicker.trim().toUpperCase())
    }
  }

  const handleRemoveTicker = (ticker: string) => {
    removeTickerMutation.mutate(ticker)
  }

  const handleGenerateAllMemos = async () => {
    setIsGenerating(true)
    try {
      await generateAllMemosMutation.mutateAsync()
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Watchlist Management</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your stock watchlist and generate investment memos
        </p>
      </div>

      {/* Add Ticker Form */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Add Ticker</h3>
        <form onSubmit={handleAddTicker} className="flex gap-3">
          <input
            type="text"
            value={newTicker}
            onChange={(e) => setNewTicker(e.target.value)}
            placeholder="Enter ticker symbol (e.g., AAPL)"
            className="input-field flex-1"
            maxLength={5}
          />
          <button
            type="submit"
            disabled={addTickerMutation.isPending || !newTicker.trim()}
            className="btn-primary disabled:opacity-50"
          >
            {addTickerMutation.isPending ? 'Adding...' : 'Add'}
          </button>
        </form>
      </div>

      {/* Watchlist */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Watchlist ({watchlist.length}/20)
          </h3>
          {watchlist.length > 0 && (
            <button
              onClick={handleGenerateAllMemos}
              disabled={isGenerating}
              className="btn-success text-sm"
            >
              <Play className="h-4 w-4 mr-1" />
              {isGenerating ? 'Generating...' : 'Generate All Memos'}
            </button>
          )}
        </div>

        {watchlist.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No tickers in your watchlist</p>
            <p className="text-sm text-gray-400">
              Add tickers above to start generating investment memos
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {watchlist.map((ticker) => (
              <div
                key={ticker}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
              >
                <span className="font-medium text-gray-900">{ticker}</span>
                <button
                  onClick={() => handleRemoveTicker(ticker)}
                  className="text-gray-400 hover:text-danger-600 transition-colors"
                  title="Remove from watchlist"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">How it works</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Add up to 20 ticker symbols to your watchlist</li>
          <li>• Generate memos for individual tickers or all at once</li>
          <li>• Each memo includes fundamental, technical, and sentiment analysis</li>
          <li>• Review and approve/reject recommendations</li>
        </ul>
      </div>
    </div>
  )
} 