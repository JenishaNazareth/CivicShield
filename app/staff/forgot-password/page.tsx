import Link from 'next/link'

export default function ForgotPasswordPage() {
  return <main className="flex min-h-screen items-center justify-center bg-background px-6 py-12"><section className="w-full max-w-md rounded-3xl border border-border bg-card p-8 shadow-sm"><h1 className="font-serif text-3xl">Password assistance</h1><p className="mt-3 text-sm leading-6 text-muted-foreground">Password reset is handled by an authorized administrator. Contact your college system administrator for assistance.</p><Link href="/staff/login" className="mt-6 inline-block text-sm font-semibold text-primary hover:underline">Return to Staff Sign In</Link></section></main>
}
