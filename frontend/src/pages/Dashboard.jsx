import React, { useMemo, useState } from 'react'
import API from '../api'
import ForecastChart from '../components/ForecastChart'
import ExplainabilityPanel from '../components/ExplainabilityPanel'
import SentimentCard from '../components/SentimentCard'
import StatCard from '../components/StatCard'

export default function Dashboard(){
  const [ticker, setTicker] = useState('AAPL')
  const [forecast, setForecast] = useState(null)
  const [rec, setRec] = useState(null)
  const [loading, setLoading] = useState({ forecast: false, rec: false })
  const [error, setError] = useState(null)

  async function runTicker(){
    setError(null); setLoading(l => ({ ...l, forecast: true }))
    try{
      const resp = await API.get('/forecast', { params: { ticker } })
      setForecast(resp.data)
    }catch(e){
      setError('Forecast failed. Ensure backend is running and ticker is valid.')
    }finally{
      setLoading(l => ({ ...l, forecast: false }))
    }
  }

  async function getRecommendation(){
    setError(null); setLoading(l => ({ ...l, rec: true }))
    try{
      const form = new FormData(); form.append('ticker', ticker); form.append('doc_id', 'demo_doc')
      const r = await API.post('/recommend', form)
      setRec(r.data)
    }catch(e){
      setError('Recommendation failed. Check backend connectivity.')
    }finally{
      setLoading(l => ({ ...l, rec: false }))
    }
  }

  const disabled = useMemo(()=> loading.forecast || loading.rec, [loading])

  return (
  <div className="space-y-6">
  <div className="rounded-2xl glass shadow-card p-5 animate-card-in hover-lift">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-white">Interactive Forecast & Recommendation</h2>
            <p className="text-sm text-gray-400">Enter a ticker and run the modules. Data is fetched live.</p>
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="ticker" className="sr-only">Ticker</label>
            <input
              id="ticker"
              value={ticker}
              onChange={e=>setTicker(e.target.value.toUpperCase())}
              placeholder="AAPL"
              className="w-36 rounded-md border border-white/10 bg-white/5 text-gray-100 placeholder:text-gray-500 px-3 py-2 text-sm focus-neon"
              aria-label="Ticker symbol"
            />
            <button onClick={runTicker} disabled={disabled} className="inline-flex items-center rounded-md text-white text-sm px-3 py-2 disabled:opacity-50 gradient-brand focus-neon">{loading.forecast ? 'Running…' : 'Run Forecast'}</button>
            <button onClick={getRecommendation} disabled={disabled} className="inline-flex items-center rounded-md bg-emerald-600 text-white text-sm px-3 py-2 hover:bg-emerald-700 disabled:opacity-50 focus-neon">{loading.rec ? 'Computing…' : 'Get Recommendation'}</button>
          </div>
        </div>
        {error && <div role="alert" className="mt-3 rounded-md border border-rose-900/50 bg-rose-900/20 px-3 py-2 text-sm text-rose-200">{error}</div>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SentimentCard docId="demo_doc" ticker={ticker} />
        <StatCard label="Data horizon" value="~1y" hint="Yahoo Finance daily" tone="brand" />
        <StatCard label="Forecast window" value="7 days" hint="Prophet extrapolation" tone="gray" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <h3 className="text-sm font-semibold text-gray-300 mb-2">Forecast</h3>
          {forecast ? (
            <ForecastChart data={forecast} />
          ) : (
            <div className="p-8 rounded-xl border border-dashed border-white/10 text-sm text-gray-400 glass animate-card-in">No forecast yet. Run a forecast to visualize predicted prices.</div>
          )}
        </div>
        <div className="lg:col-span-2">
          <h3 className="text-sm font-semibold text-gray-300 mb-2">Recommendation</h3>
          {rec ? (
            <div>
              <div className="p-5 rounded-xl glass shadow-card animate-card-in hover-lift">
                <div className="flex items-baseline gap-3">
                  <div className="text-3xl font-bold tracking-tight text-white">{rec.recommendation}</div>
                  <div className="text-xs text-gray-400">Score {Number(rec.score).toFixed(3)}</div>
                </div>
                <p className="mt-2 text-sm text-gray-300">{rec.reasoning_text}</p>
              </div>
              <div className="mt-4"><ExplainabilityPanel details={rec.details} /></div>
            </div>
          ) : (
            <div className="p-8 rounded-xl border border-dashed border-white/10 text-sm text-gray-400 glass animate-card-in">No recommendation yet. Click Get Recommendation.</div>
          )}
        </div>
      </div>
    </div>
  )
}
