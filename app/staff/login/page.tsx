'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Eye, EyeOff, LockKeyhole, ShieldCheck } from 'lucide-react'

export default function StaffLoginPage() {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (loading) return
    setLoading(true)
    setError('')
    const form = new FormData(event.currentTarget)
    try {
      const response = await fetch('/api/staff/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: form.get('email'), password: form.get('password'), remember: form.get('remember') === 'on' }) })
      const result = await response.json()
      if (!response.ok) {
        setError('Invalid email or password')
        return
      }
      window.location.assign(result.role === 'INVESTIGATOR' ? '/investigator/dashboard' : '/admin/dashboard')
    } catch {
      setError('Unable to sign in right now. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 shadow-sm">
        <Link href="/" className="flex items-center gap-3"><span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground"><LockKeyhole className="size-4" /></span><span className="font-serif text-xl font-semibold">CivicShield staff</span></Link>
        <div className="mt-10 flex items-center gap-3"><ShieldCheck className="size-5 text-primary" /><p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Protected workspace</p></div>
        <h1 className="mt-3 font-serif text-4xl tracking-tight">Staff Sign In</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">Secure access for authorized college personnel.</p>
        <form onSubmit={submit} className="mt-8 flex flex-col gap-4">
          <label className="flex flex-col gap-2 text-sm font-medium">Institutional Email<input name="email" type="email" required autoComplete="username" placeholder="name@college.edu" className="rounded-xl border border-input bg-background px-4 py-3" /></label>
          <label className="flex flex-col gap-2 text-sm font-medium">Password<div className="relative"><input name="password" type={showPassword ? 'text' : 'password'} required autoComplete="current-password" className="w-full rounded-xl border border-input bg-background px-4 py-3 pr-12" /><button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">{showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button></div></label>
          <div className="flex items-center justify-between"><label className="flex items-center gap-2 text-sm text-muted-foreground"><input name="remember" type="checkbox" className="size-4 accent-primary" />Remember me</label><Link href="/staff/forgot-password" className="text-sm font-medium text-primary hover:underline">Forgot Password?</Link></div>
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <button type="submit" disabled={loading} className="rounded-xl bg-primary px-4 py-3 font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60">{loading ? 'Signing in…' : 'Sign In'}</button>
        </form>
        <p className="mt-6 border-t border-border pt-5 text-center text-xs text-muted-foreground">Staff access is restricted to authorized college personnel.</p>
      </div>
    </main>
  )
}
