import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ITSShell } from '@its-universe/os'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { Plus, Upload as UploadIcon, Loader2, TrendingUp } from 'lucide-react'

interface AppRow { id: string; name: string; price: number; currency: string; downloads: number; is_published: boolean; created_at: string }

export default function Developer() {
  const { user, loading: authLoading, signOut } = useAuth()
  const navigate = useNavigate()
  const [apps, setApps] = useState<AppRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    supabase.from('apps').select('*').eq('developer_id', user.id).order('created_at', { ascending: false })
      .then(({ data }) => { setApps(data ?? []); setLoading(false) })
  }, [user])

  const totalDownloads = apps.reduce((s, a) => s + a.downloads, 0)
  const itsUser = user ? { id: user.id, name: user.email, email: user.email } : null
  if (authLoading || loading) return <div className="flex items-center justify-center h-screen"><Loader2 className="animate-spin text-[#6C63FF]" size={32}/></div>

  return (
    <ITSShell serviceName="IT-S Store" user={itsUser} onAvatarClick={signOut}>
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Developer Dashboard</h1>
          <button onClick={() => navigate('/developer/upload')} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#6C63FF] text-white text-sm font-medium hover:bg-[#5a52e0]">
            <Plus size={16}/>Upload App
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground mb-1">Total Apps</p>
            <p className="text-2xl font-bold">{apps.length}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><TrendingUp size={11}/>Total Downloads</p>
            <p className="text-2xl font-bold">{totalDownloads.toLocaleString()}</p>
          </div>
        </div>
        {apps.length === 0 ? (
          <div className="flex flex-col items-center py-16 gap-3 text-muted-foreground">
            <UploadIcon size={40} className="opacity-40"/>
            <p className="text-sm">No apps published yet</p>
            <button onClick={() => navigate('/developer/upload')} className="text-[#6C63FF] text-sm hover:underline">Upload your first app</button>
          </div>
        ) : (
          <ul className="space-y-3">
            {apps.map(a => (
              <li key={a.id} className="flex items-center justify-between p-4 rounded-xl border border-border bg-card">
                <div>
                  <p className="font-semibold text-sm">{a.name}</p>
                  <p className="text-xs text-muted-foreground">{a.downloads} downloads · {a.price === 0 ? 'Free' : `${a.price} ${a.currency}`}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${a.is_published ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'}`}>
                  {a.is_published ? 'Published' : 'Draft'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </ITSShell>
  )
}
