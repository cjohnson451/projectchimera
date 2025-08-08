import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getDeltaCards } from '../../lib/deltaApi'
import type { DeltaCardT } from '../../../../packages/schemas/ts/deltaSchemas'

export default function TickerChanges() {
  const { ticker } = useParams()
  const [cards, setCards] = useState<DeltaCardT[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!ticker) return
    setLoading(true)
    getDeltaCards(ticker)
      .then(setCards)
      .finally(() => setLoading(false))
  }, [ticker])

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Delta Tape — {ticker}</h1>
        <Link to={`/delta/t/${ticker}/memo`} className="text-blue-600">Generate Memo</Link>
      </div>
      {loading ? (
        <div>Loading…</div>
      ) : cards.length === 0 ? (
        <div>No DeltaCards yet.</div>
      ) : (
        <ul className="space-y-3">
          {cards.slice(0, 7).map((c) => (
            <li key={c.id} className="border rounded p-4">
              <div className="text-sm text-gray-500">{c.category}</div>
              <div className="font-medium">{c.summary}</div>
              <div className="text-sm text-gray-600">Why it matters: {c.why_it_matters}</div>
              <details className="mt-2">
                <summary className="cursor-pointer text-blue-600">Evidence</summary>
                <div className="text-sm text-gray-700">Evidence items will appear here.</div>
              </details>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}


