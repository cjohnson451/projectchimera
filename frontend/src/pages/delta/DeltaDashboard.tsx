import { Link } from 'react-router-dom'

export default function DeltaDashboard() {
  const watch = ['GOOG', 'AAPL', 'MSFT']
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Delta</h1>
      <p className="text-gray-600 mb-6">Changes-driven research. Pick a ticker to view the Delta Tape.</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {watch.map((t) => (
          <Link key={t} to={`/delta/t/${t}/changes`} className="border rounded p-4 hover:bg-gray-50">
            <div className="font-medium">{t}</div>
            <div className="text-sm text-blue-600">View Changes</div>
          </Link>
        ))}
      </div>
    </div>
  )
}


