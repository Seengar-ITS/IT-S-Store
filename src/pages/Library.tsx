import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ITSShell } from '@its-universe/os'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { ArrowLeft, BookOpen, Download, Loader2 } from 'lucide-react'

interface Purchase { id: string; app_id: string; apps: { name: string; description: string; apk_url: string; icon_url: string } }

export default function Library() {
  const { user, loading: authLoading, signOut } = useAuth()
  const navigate = useNavigate()
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    supabase.from('app_purchases').select('*, apps(name, description, apk_url, icon_url)').eq('user_id', user.id)
      .then(({ data }) => { setPurchases((data ?? []) as Purchase[]); setLoading(false) })
  }, [user])

  const itsUser = user ? { id: user.id, name: user.email, email: user.email } : null
  if (authLoading || loading) return <div className="flex items-center justify-center h-screen"><Loader2 className="animate-spin text-[#6C63FF]" size={32}/></div>

  return (
    <ITSShell serviceName="IT-S Store" user={itsUser} onAvatarClick={signOut}>
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate('/')} className="text-muted-foreground hover:text-foreground"><ArrowLeft size={20}/></button>
          <h1 className="text-xl font-bold">My Library</h1>
        </div>
        {purchases.length === 0 ? (
          <div className="flex flex-col items-center py-20 gap-3 text-muted-foreground">
            <BookOpen size={40} className="opacity-40"/>
            <p className="text-sm">No apps in your library</p>
            <button onClick={() => navigate('/')} className="text-[#6C63FF] text-sm hover:underline">Browse Store</button>
          </div>
        ) : (
          <ul className="space-y-3">
            {purchases.map(p => (
              <li key={p.id} className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card">
                <div className="w-12 h-12 rounded-xl bg-[#6C63FF]/10 flex items-center justify-center text-[#6C63FF] font-bold flex-shrink-0">
                  {p.apps?.icon_url ? <img src={p.apps.icon_url} alt="" className="w-full h-full rounded-xl object-cover"/> : p.apps?.name?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{p.apps?.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{p.apps?.description}</p>
                </div>
                {p.apps?.apk_url && <a href={p.apps.apk_url} download className="p-2 rounded-lg hover:bg-muted"><Download size={18} className="text-[#6C63FF]"/></a>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </ITSShell>
  )
}
