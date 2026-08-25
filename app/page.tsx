import Link from 'next/link'
import { ArrowRight, BadgeCheck, BookOpen, ChevronRight, FileCheck2, LockKeyhole, MessageSquareText, ShieldCheck } from 'lucide-react'

const safeguards = [
  { icon: LockKeyhole, title: 'Encrypted at rest', text: 'Sensitive descriptions, messages, notes, and evidence are protected with envelope encryption.' },
  { icon: ShieldCheck, title: 'Least-privilege access', text: 'Only the assigned investigator can open protected complaint content.' },
  { icon: MessageSquareText, title: 'Safe progress updates', text: 'Follow a public-facing timeline without exposing confidential investigation details.' },
  { icon: FileCheck2, title: 'Verifiable records', text: 'Every coordination action is recorded in a tamper-evident audit trail.' },
]

export default function Page() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/70 bg-background/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
          <Link href="/" className="flex items-center gap-3" aria-label="CivicShield home">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground"><LockKeyhole className="size-5" /></span>
            <span><span className="block font-serif text-lg font-semibold tracking-tight">CivicShield</span><span className="block text-[11px] uppercase tracking-[0.18em] text-muted-foreground">College redressal</span></span>
          </Link>
          <nav className="flex items-center gap-5 text-sm" aria-label="Main navigation">
            <Link href="/track" className="hidden text-muted-foreground transition-colors hover:text-foreground sm:block">Track a grievance</Link>
            <Link href="/staff/login" className="rounded-full border border-border px-4 py-2 font-medium transition-colors hover:bg-muted">Staff sign in</Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-12 px-6 pb-20 pt-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:px-10 lg:pb-28 lg:pt-24">
        <div className="max-w-3xl">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-primary"><BadgeCheck className="size-3.5" /> Independent grievance channel</div>
          <h1 className="max-w-3xl font-serif text-5xl leading-[1.04] tracking-tight text-balance sm:text-6xl lg:text-7xl">Speak up. Stay protected. <span className="text-primary">Be heard.</span></h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-muted-foreground text-pretty">A secure college grievance redressal system for students and staff. Submit sensitive concerns without creating an account, then follow progress through a private tracking code.</p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link href="/submit" className="group inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-sm transition-transform hover:-translate-y-0.5">Submit a grievance <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" /></Link>
            <Link href="/track" className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-card px-6 py-3.5 text-sm font-semibold transition-colors hover:bg-muted">Track an existing grievance</Link>
          </div>
          <p className="mt-5 max-w-xl text-xs leading-5 text-muted-foreground">No login is required for complainants. We do not intentionally collect your name, student ID, or identity for anonymous submissions.</p>
        </div>

        <div className="relative overflow-hidden rounded-[2rem] border border-border bg-card p-7 shadow-[0_24px_80px_-32px_hsl(var(--primary)/.35)] lg:p-9">
          <div className="absolute right-0 top-0 h-36 w-36 rounded-bl-[5rem] bg-primary/10" />
          <div className="relative">
            <div className="flex items-center justify-between border-b border-border pb-5"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Your privacy boundary</p><p className="mt-2 font-serif text-2xl">Need-to-know, by design.</p></div><ShieldCheck className="size-8 text-primary" /></div>
            <div className="flex flex-col gap-5 pt-6">
              {[['You', 'Submit securely', 'Your complaint is encrypted before storage.'], ['Coordinator', 'Route the case', 'Admin sees routing metadata, not your story.'], ['Investigator', 'Review and respond', 'Only the assigned officer can decrypt content.']].map(([role, title, text], index) => <div className="flex gap-4" key={role}><span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary font-mono text-xs font-semibold text-secondary-foreground">0{index + 1}</span><div><p className="text-sm font-semibold">{role} <span className="mx-1 text-muted-foreground">·</span> {title}</p><p className="mt-1 text-sm leading-6 text-muted-foreground">{text}</p></div></div>)}
            </div>
            <div className="mt-8 rounded-2xl bg-muted/70 p-4"><p className="text-sm font-medium">Your tracking code is the key to your progress.</p><p className="mt-1 text-xs leading-5 text-muted-foreground">Save it somewhere safe. We cannot recover it for you.</p></div>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-card/50"><div className="mx-auto max-w-7xl px-6 py-16 lg:px-10"><div className="max-w-xl"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">How protection works</p><h2 className="mt-3 font-serif text-3xl tracking-tight sm:text-4xl">A safer path through a difficult process.</h2></div><div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">{safeguards.map(({ icon: Icon, title, text }) => <div className="rounded-2xl border border-border bg-background p-5" key={title}><Icon className="size-5 text-primary" /><h3 className="mt-8 font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p></div>)}</div></div></section>

      <section className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-16 lg:flex-row lg:items-end lg:justify-between lg:px-10"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Need help understanding the process?</p><h2 className="mt-3 font-serif text-3xl tracking-tight">Your concern deserves a clear next step.</h2></div><Link href="/track" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">Learn about tracking <ChevronRight className="size-4" /></Link></section>
      <footer className="border-t border-border"><div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-7 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between lg:px-10"><p>Designed for safer institutional accountability.</p><p>Privacy first · No unnecessary identity collection</p></div></footer>
    </main>
  )
}
