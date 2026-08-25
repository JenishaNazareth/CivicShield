'use client'

import { useState } from 'react'

export function StaffLogout() {
  const [loading, setLoading] = useState(false)
  async function logout() { setLoading(true); await fetch('/api/staff/logout', { method: 'POST' }); window.location.href = '/staff/login' }
  return <button type="button" onClick={logout} disabled={loading} className="rounded-full border border-border px-4 py-2 text-sm font-medium disabled:opacity-60">{loading ? 'Signing out…' : 'Logout'}</button>
}
