import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { postMemoDelta } from '../../lib/deltaApi'
import type { MemoDeltaT } from '../../../../packages/schemas/ts/deltaSchemas'

export default function TickerMemo() {
  const { ticker } = useParams()
  const [memo, setMemo] = useState<MemoDeltaT | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!ticker) return
    setLoading(true)
    postMemoDelta(ticker)
      .then(setMemo)
      .finally(() => setLoading(false))
  }, [ticker])

  if (loading) return <div className="p-6">Generating memo…</div>
  if (!memo) return <div className="p-6">Failed to generate memo.</div>

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Memo — {memo.ticker} ({memo.as_of})</h1>
      <pre className="bg-gray-50 p-4 rounded text-sm overflow-auto">{JSON.stringify(memo, null, 2)}</pre>
    </div>
  )
}


