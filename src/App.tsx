import { useMemo, useRef, useState } from 'react'
import { format } from 'date-fns'
import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { createDemoData } from './demoData'
import { forecastCash } from './engine'
import {
  guessBankMapping,
  guessInvoiceMapping,
  readCsv,
  rowsToInvoices,
  rowsToTransactions,
  type BankMapping,
  type CsvRow,
  type DateOrder,
  type InvoiceMapping,
  type ParsedCsv,
} from './csv'
import type { Fix, ForecastResult, Invoice, Scenario, Transaction } from './types'

type Screen = 'landing' | 'upload' | 'setup' | 'radar'

interface SessionData {
  businessName: string
  transactions: Transaction[]
  invoices: Invoice[]
  openingBalance: number
  safetyBuffer: number
  isDemo: boolean
  skippedRows?: string[]
}

const CAD = new Intl.NumberFormat('en-CA', {
  style: 'currency',
  currency: 'CAD',
  maximumFractionDigits: 0,
})

function Icon({ name, size = 18 }: { name: string; size?: number }) {
  const paths: Record<string, React.ReactNode> = {
    radar: <><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="M12 4v8l5 3"/></>,
    lock: <><rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></>,
    arrow: <><path d="M5 12h14"/><path d="m14 7 5 5-5 5"/></>,
    upload: <><path d="M12 16V4"/><path d="m7 9 5-5 5 5"/><path d="M5 20h14"/></>,
    spark: <><path d="m12 3-1.5 4.5L6 9l4.5 1.5L12 15l1.5-4.5L18 9l-4.5-1.5L12 3Z"/><path d="m5 15-.8 2.2L2 18l2.2.8L5 21l.8-2.2L8 18l-2.2-.8L5 15Z"/></>,
    check: <path d="m5 12 4 4L19 6"/>,
    warn: <><path d="M12 4 3 20h18L12 4Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></>,
    copy: <><rect x="8" y="8" width="11" height="11" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/></>,
    download: <><path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/></>,
    close: <><path d="m6 6 12 12"/><path d="m18 6-12 12"/></>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></>,
  }
  return <svg className="icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>
}

function Logo({ compact = false }: { compact?: boolean }) {
  return <div className="logo"><span className="logo-mark"><Icon name="radar" size={compact ? 18 : 20} /></span>{!compact && <span>Cash Gap Radar</span>}</div>
}

function App() {
  const [screen, setScreen] = useState<Screen>('landing')
  const [session, setSession] = useState<SessionData | null>(null)
  const [scenario, setScenario] = useState<Scenario>('expected')
  const today = useMemo(() => new Date(), [])

  const startDemo = () => {
    const demo = createDemoData(today)
    setSession({ ...demo, isDemo: true })
    setScenario('expected')
    setScreen('radar')
    window.scrollTo({ top: 0 })
  }

  return (
    <div className="app-shell">
      {screen === 'landing' && <Landing onDemo={startDemo} onUpload={() => setScreen('upload')} />}
      {screen === 'upload' && (
        <UploadFlow
          onBack={() => setScreen('landing')}
          onReady={(data) => { setSession(data); setScreen('setup') }}
        />
      )}
      {screen === 'setup' && session && (
        <SetupFlow
          session={session}
          onBack={() => setScreen('upload')}
          onContinue={(openingBalance, safetyBuffer) => {
            setSession({ ...session, openingBalance, safetyBuffer })
            setScreen('radar')
          }}
        />
      )}
      {screen === 'radar' && session && (
        <Radar
          session={session}
          scenario={scenario}
          today={today}
          onScenario={setScenario}
          onReset={() => { setSession(null); setScreen('landing') }}
          onEdit={() => setScreen(session.isDemo ? 'landing' : 'setup')}
        />
      )}
    </div>
  )
}

function Landing({ onDemo, onUpload }: { onDemo: () => void; onUpload: () => void }) {
  return (
    <main className="landing">
      <nav className="topbar wrap" aria-label="Main navigation">
        <Logo />
        <div className="privacy-pill"><Icon name="lock" size={15} /> Your files stay on this device</div>
      </nav>
      <section className="hero wrap">
        <div className="hero-copy">
          <span className="eyebrow"><span className="live-dot" /> 13-week cash clarity</span>
          <h1>See the cash gap<br /><em>before it sees you.</em></h1>
          <p className="hero-lede">Know exactly when cash gets tight, what causes it, and the smallest moves that can close the gap.</p>
          <div className="hero-actions">
            <button className="btn btn-primary btn-large" onClick={onDemo}>Try the live demo <Icon name="arrow" /></button>
            <button className="btn btn-secondary btn-large" onClick={onUpload}><Icon name="upload" /> Upload my data</button>
          </div>
          <p className="microcopy"><Icon name="lock" size={14} /> No signup. No bank connection. Nothing is stored.</p>
        </div>
        <HeroPreview />
      </section>
      <section className="trust-strip">
        <div className="wrap trust-grid">
          <div><span>01</span><strong>Bring two exports</strong><p>Your bank transactions and open invoices.</p></div>
          <div><span>02</span><strong>See 13 weeks ahead</strong><p>Built from how customers actually pay.</p></div>
          <div><span>03</span><strong>Know what to do</strong><p>Specific actions ranked by dollars covered.</p></div>
        </div>
      </section>
    </main>
  )
}

function HeroPreview() {
  const bars = [58, 46, 71, 50, 61, 33, 27, 44, 37, 52, 48, 57, 63]
  return (
    <div className="hero-visual" aria-label="Example cash forecast">
      <div className="preview-glow" />
      <div className="preview-card">
        <div className="preview-top"><div><span className="preview-label">EXPECTED SCENARIO</span><strong>Maple & Main</strong></div><span className="demo-tag">Demo</span></div>
        <div className="alert-preview"><span className="alert-icon"><Icon name="warn" /></span><div><span>Cash gap detected</span><strong>Short by $4,200 in 6 weeks</strong></div></div>
        <div className="mini-chart">
          <div className="safety-line"><span>Safety line</span></div>
          {bars.map((height, index) => <span key={index} className={index === 5 ? 'danger' : ''} style={{ height: `${height}%` }} />)}
        </div>
        <div className="preview-fix"><span className="fix-number">1</span><div><span>Best move</span><strong>Nudge Harbor Dental</strong></div><b>+$8.4k</b></div>
        <div className="preview-footer"><Icon name="spark" size={15} /> Two invoices can cover the gap</div>
      </div>
      <div className="floating-note note-one"><Icon name="check" size={15} /> Clear answer in seconds</div>
      <div className="floating-note note-two"><Icon name="lock" size={15} /> Runs in your browser</div>
    </div>
  )
}

function FlowShell({ children, onBack, step }: { children: React.ReactNode; onBack: () => void; step: string }) {
  return (
    <main className="flow-page">
      <nav className="flow-nav wrap"><button className="logo-button" onClick={onBack}><Logo /></button><span className="step-label">{step}</span></nav>
      <div className="flow-wrap">{children}</div>
    </main>
  )
}

function UploadFlow({ onBack, onReady }: { onBack: () => void; onReady: (data: SessionData) => void }) {
  const [bank, setBank] = useState<ParsedCsv | null>(null)
  const [invoice, setInvoice] = useState<ParsedCsv | null>(null)
  const [bankName, setBankName] = useState('')
  const [invoiceName, setInvoiceName] = useState('')
  const [bankMap, setBankMap] = useState<BankMapping | null>(null)
  const [invoiceMap, setInvoiceMap] = useState<InvoiceMapping | null>(null)
  const [dateOrder, setDateOrder] = useState<DateOrder>('mdy')
  const [error, setError] = useState('')

  const handleFile = async (file: File, kind: 'bank' | 'invoice') => {
    setError('')
    try {
      const parsed = await readCsv(file)
      if (!parsed.headers.length) throw new Error(`${file.name} has no header row.`)
      if (kind === 'bank') {
        setBank(parsed); setBankName(file.name); setBankMap(guessBankMapping(parsed.headers))
      } else {
        setInvoice(parsed); setInvoiceName(file.name); setInvoiceMap(guessInvoiceMapping(parsed.headers))
      }
    } catch (caught) { setError((caught as Error).message) }
  }
