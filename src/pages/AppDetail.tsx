import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ITSShell } from '@its-universe/os'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { ArrowLeft, Download, Star, Loader2 } from 'lucide-react'

interface AppRow { id: string; name: string; description: string; category: string; price: number; currency: string; icon_url?: string; apk_url?: string; screenshots: string[]; version: string; downloads: number; developer_id: string }
interface Review { id: string; user_id: string; rating: number; review: string; created_at: string }

export default function AppDetail() {
  const { id } = useParams<{ id: string }>()
  const { user, loading: authLoading, signOut } = useAuth()
  const navigate = useNavigate()
  const [app, setApp] = useState<AppRow | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [owned, setOwned] = useState(false)
  const [rating, setRating] = useState(5)
  const [review, setReview] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id || !user) return
    Promise.all([
      supabase.from('apps').select('*').eq('id', id).single(),
      supabase.from('app_reviews').select('*').eq('app_id', id).order('created_at', { ascending: false }),
      supabase.from('app_purchases').select('id').eq('app_id', id).eq('user_id', user.id).maybeSingle()
    ]).then(([{data: a}, {data: r}, {data: p}]) => {
      setApp(a); setReviews(r ?? []); setOwned(!!p || a?.price === 0); setLoading(false)
    })
  }, [id, user])

  async function submitReview(e: React.FormEvent) {
    e.preventDefault()
    if (!user || !id) return
    setSubmitting(true)
    await supabase.from('app_reviews').upsert({ app_id: id, user_id: user.id, rating, review }, { onConflict: 'app_id,user_id' })
    const { data } = await supabase.from('app_reviews').select('*').eq('app_id', id).order('created_at', { ascending: false })
    setReviews(data ?? []); setReview(''); setSubmitting(false)
  }

  if (authLoading || loading) return <div className="flex items-center justify-center h-screen"><Loader2 className="animate-spin text-[#6C63FF]" size={32}/></div>
  if (!app) return <div className="flex items-center justify-center h-screen"><p className="text-muted-foreground">App not found</p></div>
  const itsUser = user ? { id: user.id, name: user.email, email: user.email } : null
  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : null

  return (
    <ITSShell serviceName="IT-S Store" user={itsUser} onAvatarClick={signOut}>
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm"><ArrowLeft size={16}/>Back</button>
        <div className="flex items-start gap-4">
          <div className="w-20 h-20 rounded-2xl bg-[#6C63FF]/10 flex items-center justify-center text-[#6C63FF] font-bold text-3xl flex-shrink-0">
            {app.icon_url ? <img src={app.icon_url} alt={app.name} className="w-full h-full rounded-2xl object-cover"/> : app.name[0]}
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold">{app.name}</h1>
            <p className="text-sm text-muted-foreground">{app.category} · v{app.version}</p>
            {avgRating && <p className="text-sm flex items-center gap-1 mt-1"><Star size={13} className="fill-amber-400 text-amber-400"/>{avgRating} ({reviews.length})</p>}
          </div>
        </div>
        {app.screenshots?.length > 0 && (
          <div className="flex gap-3 overflow-x-auto pb-2">
            {app.screenshots.map((s, i) => <img key={i} src={s} alt={`screenshot ${i+1}`} className="h-40 rounded-xl flex-shrink-0 object-cover"/>)}
          </div>
        )}
        <p className="text-sm text-muted-foreground">{app.description}</p>
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold text-[#6C63FF]">{app.price === 0 ? 'Free' : `${app.price} ${app.currency}`}</span>
          {owned && app.apk_url ? (
            <a href={app.apk_url} download className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#6C63FF] text-white font-medium hover:bg-[#5a52e0]">
              <Download size={16}/>Download APK
            </a>
          ) : owned ? (
            <span className="text-sm text-green-600 font-medium">✓ Installed</span>
          ) : (
            <button className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#6C63FF] text-white font-medium hover:bg-[#5a52e0]">
              {app.price === 0 ? 'Install' : `Buy ${app.price} ${app.currency}`}
            </button>
          )}
        </div>
        <div>
          <h2 className="font-semibold mb-3">Reviews ({reviews.length})</h2>
          {owned && (
            <form onSubmit={submitReview} className="rounded-xl border border-border bg-card p-4 mb-4 space-y-3">
              <div className="flex gap-1">{[1,2,3,4,5].map(s => <button key={s} type="button" onClick={() => setRating(s)}><Star size={20} className={s <= rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground'}/></button>)}</div>
              <textarea value={review} onChange={e => setReview(e.target.value)} placeholder="Write a review..." rows={3}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm outline-none focus:border-[#6C63FF]/50 resize-none"/>
              <button type="submit" disabled={submitting} className="px-4 py-2 rounded-lg bg-[#6C63FF] text-white text-sm disabled:opacity-40">
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          )}
          {reviews.length === 0 ? <p className="text-sm text-muted-foreground">No reviews yet</p> : (
            <ul className="space-y-3">
              {reviews.map(r => (
                <li key={r.id} className="p-3 rounded-xl border border-border bg-card">
                  <div className="flex gap-0.5 mb-1">{[1,2,3,4,5].map(s => <Star key={s} size={12} className={s <= r.rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground'}/>)}</div>
                  <p className="text-sm">{r.review}</p>
                  <p className="text-xs text-muted-foreground mt-1">{new Date(r.created_at).toLocaleDateString()}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </ITSShell>
  )
}
