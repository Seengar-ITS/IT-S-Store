import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ITSShell } from '@its-universe/os'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { ArrowLeft, Upload, Loader2, CheckCircle } from 'lucide-react'

const CATEGORIES = ['Games','Productivity','Social','Education','Utilities','Entertainment']

export default function UploadApp() {
  const { user, loading: authLoading, signOut } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState(''); const [description, setDescription] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0]); const [price, setPrice] = useState('0')
  const [version, setVersion] = useState('1.0.0'); const [apkFile, setApkFile] = useState<File|null>(null)
  const [iconFile, setIconFile] = useState<File|null>(null); const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    setSubmitting(true)
    let apk_url = ''; let icon_url = ''
    if (apkFile) {
      const { data } = await supabase.storage.from('app-assets').upload(`${user.id}/${Date.now()}_${apkFile.name}`, apkFile)
      if (data) { const { data: u } = supabase.storage.from('app-assets').getPublicUrl(data.path); apk_url = u.publicUrl }
    }
    if (iconFile) {
      const { data } = await supabase.storage.from('app-assets').upload(`${user.id}/icon_${Date.now()}_${iconFile.name}`, iconFile)
      if (data) { const { data: u } = supabase.storage.from('app-assets').getPublicUrl(data.path); icon_url = u.publicUrl }
    }
    await supabase.from('apps').insert({ developer_id: user.id, name, description, category, price: parseFloat(price), currency: 'USD', apk_url, icon_url, version, is_published: true })
    setSubmitting(false); setDone(true)
  }

  if (authLoading) return <div className="flex items-center justify-center h-screen"><Loader2 className="animate-spin text-[#6C63FF]" size={32}/></div>
  const itsUser = user ? { id: user.id, name: user.email, email: user.email } : null

  return (
    <ITSShell serviceName="IT-S Store" user={itsUser} onAvatarClick={signOut}>
      <div className="max-w-lg mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate('/developer')} className="text-muted-foreground hover:text-foreground"><ArrowLeft size={20}/></button>
          <h1 className="text-xl font-bold">Upload App</h1>
        </div>
        {done ? (
          <div className="flex flex-col items-center py-20 gap-3 text-center">
            <CheckCircle size={56} className="text-green-500"/>
            <p className="text-xl font-bold">App Published!</p>
            <button onClick={() => navigate('/developer')} className="px-6 py-2 rounded-xl bg-[#6C63FF] text-white">Back to Dashboard</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input value={name} onChange={e=>setName(e.target.value)} required placeholder="App Name" className="w-full px-4 py-3 rounded-xl border border-border bg-card text-sm outline-none focus:border-[#6C63FF]/50"/>
            <textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder="Description" rows={4} className="w-full px-4 py-3 rounded-xl border border-border bg-card text-sm outline-none focus:border-[#6C63FF]/50 resize-none"/>
            <div className="flex gap-3">
              <select value={category} onChange={e=>setCategory(e.target.value)} className="flex-1 px-4 py-3 rounded-xl border border-border bg-card text-sm outline-none">
                {CATEGORIES.map(c=><option key={c}>{c}</option>)}
              </select>
              <input value={version} onChange={e=>setVersion(e.target.value)} placeholder="Version" className="w-28 px-3 py-3 rounded-xl border border-border bg-card text-sm outline-none"/>
            </div>
            <input value={price} onChange={e=>setPrice(e.target.value)} type="number" min="0" step="0.01" placeholder="Price (USD, 0 = Free)" className="w-full px-4 py-3 rounded-xl border border-border bg-card text-sm outline-none focus:border-[#6C63FF]/50"/>
            <label className="flex items-center gap-3 p-3 rounded-xl border border-dashed border-border cursor-pointer hover:bg-muted text-sm text-muted-foreground">
              <Upload size={18}/> {apkFile ? apkFile.name : 'Upload APK file'}
              <input type="file" accept=".apk" className="hidden" onChange={e=>setApkFile(e.target.files?.[0]??null)}/>
            </label>
            <label className="flex items-center gap-3 p-3 rounded-xl border border-dashed border-border cursor-pointer hover:bg-muted text-sm text-muted-foreground">
              <Upload size={18}/> {iconFile ? iconFile.name : 'Upload App Icon'}
              <input type="file" accept="image/*" className="hidden" onChange={e=>setIconFile(e.target.files?.[0]??null)}/>
            </label>
            <button type="submit" disabled={submitting || !name} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#6C63FF] text-white font-medium disabled:opacity-40">
              {submitting ? <Loader2 size={18} className="animate-spin"/> : <Upload size={18}/>} Publish App
            </button>
          </form>
        )}
      </div>
    </ITSShell>
  )
}
