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

  const continueFlow = (skipBadRows = false) => {
    if (!bank || !invoice || !bankMap || !invoiceMap) return
    setError('')
    try {
      const bankResult = rowsToTransactions(bank.rows, bankMap, dateOrder, skipBadRows)
      const invoiceResult = rowsToInvoices(invoice.rows, invoiceMap, dateOrder, skipBadRows)
      const balanceRows = bankResult.data.filter((row) => row.balance !== undefined).sort((a, b) => b.date.getTime() - a.date.getTime())
      onReady({
        businessName: 'Your business',
        transactions: bankResult.data,
        invoices: invoiceResult.data,
        openingBalance: balanceRows[0]?.balance ?? 0,
        safetyBuffer: 0,
        isDemo: false,
        skippedRows: [...bankResult.skipped, ...invoiceResult.skipped],
      })
    } catch (caught) { setError((caught as Error).message) }
  }

  return (
    <FlowShell onBack={onBack} step="Step 1 of 2 · Add your data">
      <div className="flow-heading"><span className="eyebrow">Private by design</span><h1>Bring the two files that tell the story.</h1><p>We read them in your browser. They are never uploaded to a server.</p></div>
      {error && <div className="error-banner" role="alert"><Icon name="warn" /><div><strong>We found a problem</strong><span>{error}</span></div>{bank && invoice && <button onClick={() => continueFlow(true)}>Skip bad rows and continue</button>}</div>}
      <div className="upload-grid">
        <FileDrop title="Bank transactions" subtitle="CSV with date, description, and amount" fileName={bankName} onFile={(file) => handleFile(file, 'bank')} />
        <FileDrop title="Invoices" subtitle="CSV with customer, amount, and due date" fileName={invoiceName} onFile={(file) => handleFile(file, 'invoice')} />
      </div>
      {(bank && invoice && bankMap && invoiceMap) && (
        <div className="mapper-panel">
          <div className="mapper-head"><div><span className="eyebrow">Column check</span><h2>Make sure we read that correctly.</h2></div><label className="date-order">Date format<select value={dateOrder} onChange={(event) => setDateOrder(event.target.value as DateOrder)}><option value="mdy">MM/DD/YYYY</option><option value="dmy">DD/MM/YYYY</option></select></label></div>
          <MappingSection title="Bank columns" headers={bank.headers} mapping={bankMap} required={['date', 'description']} onChange={(key, value) => setBankMap({ ...bankMap, [key]: value })} />
          <PreviewTable rows={bank.rows} headers={bank.headers} />
          <MappingSection title="Invoice columns" headers={invoice.headers} mapping={invoiceMap} required={['customer', 'invoiceNumber', 'amount', 'issueDate', 'dueDate']} onChange={(key, value) => setInvoiceMap({ ...invoiceMap, [key]: value })} />
          <PreviewTable rows={invoice.rows} headers={invoice.headers} />
          <div className="mapper-actions"><span><Icon name="lock" size={15} /> Processed locally</span><button className="btn btn-primary" onClick={() => continueFlow()}>Set my safety line <Icon name="arrow" /></button></div>
        </div>
      )}
    </FlowShell>
  )
}

function FileDrop({ title, subtitle, fileName, onFile }: { title: string; subtitle: string; fileName: string; onFile: (file: File) => void }) {
  const ref = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  return (
    <button className={`file-drop ${dragging ? 'dragging' : ''} ${fileName ? 'loaded' : ''}`} onClick={() => ref.current?.click()} onDragOver={(event) => { event.preventDefault(); setDragging(true) }} onDragLeave={() => setDragging(false)} onDrop={(event) => { event.preventDefault(); setDragging(false); const file = event.dataTransfer.files[0]; if (file) onFile(file) }}>
      <input ref={ref} type="file" accept=".csv,text/csv" hidden onChange={(event) => { const file = event.target.files?.[0]; if (file) onFile(file) }} />
      <span className="drop-icon"><Icon name={fileName ? 'check' : 'upload'} /></span>
      <strong>{fileName || title}</strong><span>{fileName ? 'Ready to map' : subtitle}</span><small>{fileName ? 'Choose a different file' : 'Drop CSV here or click to browse · 5 MB max'}</small>
    </button>
  )
}

function MappingSection({ title, headers, mapping, required, onChange }: { title: string; headers: string[]; mapping: BankMapping | InvoiceMapping; required: string[]; onChange: (key: string, value: string) => void }) {
  return <div className="mapping-section"><h3>{title}</h3><div className="mapping-grid">{Object.entries(mapping).map(([key, value]) => <label key={key}><span>{labelFor(key)}{required.includes(key) && <b>Required</b>}</span><select value={value} onChange={(event) => onChange(key, event.target.value)}><option value="">Not mapped</option>{headers.map((header) => <option key={header} value={header}>{header}</option>)}</select></label>)}</div></div>
}

function labelFor(key: string) {
  return key.replace(/([A-Z])/g, ' $1').replace(/^./, (letter) => letter.toUpperCase())
}

function PreviewTable({ rows, headers }: { rows: CsvRow[]; headers: string[] }) {
  return <div className="preview-table-wrap"><table><thead><tr>{headers.slice(0, 6).map((header) => <th key={header}>{header}</th>)}</tr></thead><tbody>{rows.slice(0, 3).map((row, index) => <tr key={index}>{headers.slice(0, 6).map((header) => <td key={header}>{row[header]}</td>)}</tr>)}</tbody></table></div>
}

function SetupFlow({ session, onBack, onContinue }: { session: SessionData; onBack: () => void; onContinue: (opening: number, buffer: number) => void }) {
  const largestPayroll = useMemo(() => Math.max(0, ...session.transactions.filter((transaction) => transaction.amount < 0 && /payroll|salary|adp|gusto|wages/i.test(transaction.description)).map((transaction) => Math.abs(transaction.amount))), [session])
  const [opening, setOpening] = useState(session.openingBalance || 0)
  const [buffer, setBuffer] = useState(session.safetyBuffer || largestPayroll || 5000)
  return (
    <FlowShell onBack={onBack} step="Step 2 of 2 · Set the line">
      <div className="setup-card">
        <div className="flow-heading"><span className="eyebrow">One last check</span><h1>Where does “too tight” start?</h1><p>Set the balance we should treat as your safety floor. You can change it later.</p></div>
        {session.skippedRows?.length ? <div className="notice"><Icon name="warn" /> {session.skippedRows.length} invalid row{session.skippedRows.length === 1 ? ' was' : 's were'} skipped.</div> : null}
        <div className="money-inputs">
          <label><span>Current bank balance</span><div><b>$</b><input inputMode="decimal" value={opening} onChange={(event) => setOpening(Number(event.target.value))} /></div><small>{session.openingBalance ? 'Prefilled from your latest balance column' : 'Enter today’s available balance'}</small></label>
          <label><span>Safety buffer</span><div><b>$</b><input inputMode="decimal" value={buffer} onChange={(event) => setBuffer(Number(event.target.value))} /></div><small>{largestPayroll ? `Suggested from your largest payroll-like payment (${CAD.format(largestPayroll)})` : 'A payroll, rent, or comfort-line amount'}</small></label>
        </div>
        <div className="setup-note"><Icon name="lock" /><div><strong>Only the preference is saved while this page is open.</strong><span>Your transactions and invoices are never stored.</span></div></div>
        <button className="btn btn-primary btn-wide" disabled={opening < 0 || buffer < 0} onClick={() => onContinue(opening, buffer)}>Build my 13-week radar <Icon name="arrow" /></button>
      </div>
    </FlowShell>
  )
}

function Radar({ session, scenario, today, onScenario, onReset, onEdit }: { session: SessionData; scenario: Scenario; today: Date; onScenario: (scenario: Scenario) => void; onReset: () => void; onEdit: () => void }) {
  const [selectedFix, setSelectedFix] = useState<Fix | null>(null)
  const [copied, setCopied] = useState(false)
  const result = useMemo(() => forecastCash({ transactions: session.transactions, invoices: session.invoices, openingBalance: session.openingBalance, safetyBuffer: session.safetyBuffer, today }), [session, today])
  const projection = result.scenarios[scenario]
  const headline = buildHeadline(result, scenario, session.safetyBuffer)
  const chartData = projection.weeks.map((week) => ({
    date: format(week.weekStart, 'MMM d'),
    fullDate: format(week.weekStart, 'MMM d, yyyy'),
    inflows: week.inflows,
    outflows: week.outflows,
    balance: week.endBalance,
    isShort: week.endBalance < session.safetyBuffer,
  }))
