import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ITSShell } from '@its-universe/os'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { Search, Star, Download, Loader2 } from 'lucide-react'

interface App { id: string; name: string; description: string; category: string; price: number; currency: string; icon_url?: string; downloads: number; is_published: boolean }

const CATEGORIES = ['All','Games','Productivity','Social','Education','Utilities','Entertainment']

export default function Home() {
  const { user, loading: authLoading, signOut } = useAuth()
  const navigate = useNavigate()
  const [apps, setApps] = useState<App[]>([])
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let q = supabase.from('apps').select('*').eq('is_published', true).order('downloads', { ascending: false })
    if (category !== 'All') q = q.eq('category', category)
    if (query) q = q.ilike('name', `%${query}%`)
    q.then(({ data }) => { setApps(data ?? []); setLoading(false) })
  }, [query, category])

  const itsUser = user ? { id: user.id, name: user.email, email: user.email } : null
  if (authLoading) return <div className="flex items-center justify-center h-screen"><Loader2 className="animate-spin text-[#6C63FF]" size={32}/></div>

  return (
    <ITSShell serviceName="IT-S Store" user={itsUser} onAvatarClick={signOut}>
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">IT-S Store</h1>
          <button onClick={() => navigate('/library')} className="text-sm text-[#6C63FF] hover:underline">My Library</button>
        </div>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"/>
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search apps..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-card text-sm outline-none focus:border-[#6C63FF]/50"/>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCategory(c)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap flex-shrink-0 ${category === c ? 'bg-[#6C63FF] text-white' : 'border border-border hover:bg-muted'}`}>{c}</button>
          ))}
        </div>
        {loading ? <div className="flex justify-center py-16"><Loader2 className="animate-spin text-[#6C63FF]" size={28}/></div> : apps.length === 0 ? (
          <p className="text-center text-muted-foreground py-16">No apps found</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {apps.map(a => (
              <button key={a.id} onClick={() => navigate(`/app/${a.id}`)}
                className="text-left p-4 rounded-xl border border-border bg-card hover:border-[#6C63FF]/40 transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-xl bg-[#6C63FF]/10 flex items-center justify-center text-[#6C63FF] font-bold text-lg flex-shrink-0">
                    {a.icon_url ? <img src={a.icon_url} alt={a.name} className="w-full h-full rounded-xl object-cover"/> : a.name[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate">{a.name}</p>
                    <p className="text-xs text-muted-foreground">{a.category}</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{a.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs flex items-center gap-1 text-muted-foreground"><Download size={11}/>{a.downloads.toLocaleString()}</span>
                  <span className="text-sm font-semibold text-[#6C63FF]">{a.price === 0 ? 'Free' : `${a.price} ${a.currency}`}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </ITSShell>
  )
}
