import { useEffect, useMemo, useRef, useState } from 'react'
import type { ChangeEvent, ReactNode } from 'react'
import './App.css'
import { formatVerticalText, prepareVerticalText } from './lib/tategaki'

const SAMPLE_TEXT =
  'たしかに、縦書きになると「ちゃんと読む意識」というものに、読み手側がちゃんと文章を読むということは、自動的に切り替わるかもしれないな、と思った。\n\nただ、インターネットできちんと文章を読むというのは、そもそも縦書きの文章という習慣がないといった可能性の方が高そうだな、などという本末転倒な可能性にも想いを馳せた。'

type IconName = 'copy' | 'download' | 'file' | 'rotate' | 'sparkle' | 'trash' | 'check'

const iconPaths: Record<IconName, ReactNode> = {
  copy: <><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M15 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h3"/></>,
  download: <><path d="M12 3v12m0 0 5-5m-5 5-5-5"/><path d="M5 21h14"/></>,
  file: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h6"/></>,
  rotate: <><path d="M20 11a8.1 8.1 0 1 0 .2 3"/><path d="M20 4v7h-7"/></>,
  sparkle: <><path d="m12 3-1 3.2a4 4 0 0 1-2.8 2.8L5 10l3.2 1a4 4 0 0 1 2.8 2.8l1 3.2 1-3.2a4 4 0 0 1 2.8-2.8l3.2-1-3.2-1A4 4 0 0 1 13 6.2L12 3Z"/><path d="m19 16-.5 1.5L17 18l1.5.5L19 20l.5-1.5L21 18l-1.5-.5L19 16Z"/></>,
  trash: <><path d="M4 7h16M9 7V4h6v3m3 0-1 14H7L6 7m4 4v6m4-6v6"/></>,
  check: <path d="m5 12 4 4L19 6"/>,
}

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{iconPaths[name]}</svg>
}

function App() {
  const [text, setText] = useState(() => localStorage.getItem('tategaki:text') || SAMPLE_TEXT)
  const [charactersPerColumn, setCharactersPerColumn] = useState(20)
  const [fontSize, setFontSize] = useState(24)
  const [columnGap, setColumnGap] = useState(1.15)
  const [convertPunctuation, setConvertPunctuation] = useState(true)
  const [activeView, setActiveView] = useState<'visual' | 'plain'>('visual')
  const [copied, setCopied] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { localStorage.setItem('tategaki:text', text) }, [text])

  const verticalText = useMemo(
    () => prepareVerticalText(text, { convertPunctuation }),
    [text, convertPunctuation],
  )
  const plainText = useMemo(
    () => formatVerticalText(text, { charactersPerColumn, convertPunctuation }),
    [text, charactersPerColumn, convertPunctuation],
  )
  const characterCount = useMemo(() => Array.from(text.replace(/\s/g, '')).length, [text])
  const columnCount = Math.max(1, Math.ceil(prepareVerticalText(text).replace(/\n/g, '　').length / charactersPerColumn))

  async function copyResult() {
    await navigator.clipboard.writeText(plainText)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  function downloadResult() {
    const blob = new Blob([plainText], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `tategaki-${new Date().toISOString().slice(0, 10)}.txt`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  function importFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setText(String(reader.result ?? ''))
    reader.readAsText(file)
    event.target.value = ''
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="." aria-label="縦組工房 ホーム">
          <span className="brand-seal">縦</span>
          <span><strong>縦組工房</strong><small>TATEGAKI STUDIO</small></span>
        </a>
        <div className="topbar-note"><span className="status-dot" />文字はブラウザ内だけで処理されます</div>
      </header>

      <main>
        <section className="intro">
          <div>
            <p className="eyebrow"><Icon name="sparkle" size={15} /> 日本語のための小さな道具</p>
            <h1>文章を、<em>縦に読む。</em></h1>
          </div>
          <p className="intro-copy">入力した文章を、右から左へ流れる美しい縦組みに。<br />設定を整えて、すぐにコピーできます。</p>
        </section>

        <div className="workspace">
          <aside className="editor-panel">
            <div className="panel-heading">
              <div><span className="step">01</span><h2>原文</h2></div>
              <div className="text-actions">
                <button className="icon-button" onClick={() => fileInputRef.current?.click()} title="テキストファイルを開く"><Icon name="file" /></button>
                <button className="icon-button" onClick={() => setText('')} title="原文を消去"><Icon name="trash" /></button>
                <input ref={fileInputRef} type="file" accept=".txt,text/plain" onChange={importFile} hidden />
              </div>
            </div>

            <div className="textarea-wrap">
              <textarea value={text} onChange={(event) => setText(event.target.value)} placeholder="ここに文章を入力してください…" aria-label="縦書きにする原文" spellCheck={false} />
              <div className="textarea-footer">
                <button className="sample-button" onClick={() => setText(SAMPLE_TEXT)}><Icon name="rotate" size={14} /> 例文を使う</button>
                <span>{characterCount.toLocaleString()} 文字</span>
              </div>
            </div>

            <div className="settings-heading"><span className="step">02</span><h2>組版設定</h2></div>
            <div className="settings">
              <RangeSetting label="一列の文字数" value={charactersPerColumn} display={String(charactersPerColumn)} min={8} max={32} minLabel="8" maxLabel="32" onChange={setCharactersPerColumn} />
              <RangeSetting label="文字サイズ" value={fontSize} display={`${fontSize}px`} min={16} max={36} minLabel="小" maxLabel="大" onChange={setFontSize} />
              <RangeSetting label="列の間隔" value={columnGap} display={`${columnGap.toFixed(2)}em`} min={0.8} max={1.8} step={0.05} minLabel="狭い" maxLabel="広い" onChange={setColumnGap} />
              <label className="toggle-setting">
                <span><b>縦書き約物</b><small>句読点と括弧を縦向きに変換</small></span>
                <input type="checkbox" checked={convertPunctuation} onChange={(event) => setConvertPunctuation(event.target.checked)} />
                <span className="toggle" aria-hidden="true" />
              </label>
            </div>
          </aside>

          <section className="preview-panel">
            <div className="preview-toolbar">
              <div className="view-tabs" role="tablist" aria-label="表示方法">
                <button className={activeView === 'visual' ? 'active' : ''} onClick={() => setActiveView('visual')} role="tab" aria-selected={activeView === 'visual'}>組版プレビュー</button>
                <button className={activeView === 'plain' ? 'active' : ''} onClick={() => setActiveView('plain')} role="tab" aria-selected={activeView === 'plain'}>プレーンテキスト</button>
              </div>
              <span className="column-count">全 {columnCount} 列</span>
            </div>

            <div className={`paper-stage ${activeView === 'plain' ? 'plain-stage' : ''}`}>
              <div className="paper-corner top-left" /><div className="paper-corner bottom-right" />
              {text ? activeView === 'visual' ? (
                <div className="visual-scroll">
                  <article className="vertical-text" style={{ fontSize: `${fontSize}px`, height: `${charactersPerColumn * fontSize * 1.5}px`, lineHeight: `${columnGap}` }}>{verticalText}</article>
                </div>
              ) : (
                <div className="plain-scroll"><pre>{plainText}</pre></div>
              ) : (
                <div className="empty-state"><span>縦</span><p>左側に文章を入力すると<br />ここに縦組みが現れます</p></div>
              )}
            </div>

            <footer className="preview-footer">
              <p>現在の列数で生成し、コピー後も縦組みを保ちます。</p>
              <div>
                <button className="secondary-button" onClick={downloadResult} disabled={!text}><Icon name="download" /> .txt 保存</button>
                <button className={`primary-button ${copied ? 'success' : ''}`} onClick={copyResult} disabled={!text}><Icon name={copied ? 'check' : 'copy'} /> {copied ? 'コピーしました' : '結果をコピー'}</button>
              </div>
            </footer>
          </section>
        </div>
      </main>
      <footer className="site-footer"><span>縦組工房</span><span>Made for quiet reading.</span></footer>
    </div>
  )
}

interface RangeSettingProps {
  label: string; value: number; display: string; min: number; max: number; step?: number
  minLabel: string; maxLabel: string; onChange: (value: number) => void
}

function RangeSetting({ label, value, display, min, max, step, minLabel, maxLabel, onChange }: RangeSettingProps) {
  const progress = ((value - min) / (max - min)) * 100
  return (
    <label className="range-setting">
      <span><b>{label}</b><output>{display}</output></span>
      <input type="range" min={min} max={max} step={step} value={value} style={{ '--progress': `${progress}%` } as React.CSSProperties} onChange={(event) => onChange(Number(event.target.value))} />
      <small><span>{minLabel}</span><span>{maxLabel}</span></small>
    </label>
  )
}

export default App
