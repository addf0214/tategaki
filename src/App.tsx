import { useEffect, useMemo, useRef, useState } from 'react'
import type { ChangeEvent, CSSProperties, ReactNode } from 'react'
import './App.css'
import { calculateColumnHeight, formatVerticalText, prepareVerticalText } from './lib/tategaki'

const SAMPLE_TEXT =
  '从前的日色变得慢，车、马、邮件都慢，一生只够爱一个人。\n\n从前的锁也好看，钥匙精美有样子，你锁了，人家就懂了。'

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
  const [text, setText] = useState(() => localStorage.getItem('tategaki:text:v2') || SAMPLE_TEXT)
  const [messageWidth, setMessageWidth] = useState(13)
  const [blankColumn, setBlankColumn] = useState(true)
  const [fullWidthAscii, setFullWidthAscii] = useState(true)
  const [fontSize, setFontSize] = useState(24)
  const [columnGap, setColumnGap] = useState(1.15)
  const [convertPunctuation, setConvertPunctuation] = useState(true)
  const [activeView, setActiveView] = useState<'visual' | 'plain'>('plain')
  const [copied, setCopied] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const columnsPerBlock = blankColumn ? (messageWidth + 1) / 2 : messageWidth
  const charactersPerColumn = calculateColumnHeight(text, columnsPerBlock, { convertPunctuation, fullWidthAscii })

  useEffect(() => { localStorage.setItem('tategaki:text:v2', text) }, [text])

  const verticalText = useMemo(
    () => prepareVerticalText(text, { convertPunctuation, fullWidthAscii }),
    [text, convertPunctuation, fullWidthAscii],
  )
  const plainText = useMemo(
    () => formatVerticalText(text, { charactersPerColumn, columnsPerBlock, blankColumn, convertPunctuation, fullWidthAscii }),
    [text, charactersPerColumn, columnsPerBlock, blankColumn, convertPunctuation, fullWidthAscii],
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
    anchor.download = `竖排文本-${new Date().toISOString().slice(0, 10)}.txt`
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
        <a className="brand" href="." aria-label="竖排工房首页">
          <span className="brand-seal">竖</span>
          <span><strong>竖排工房</strong><small>TATEGAKI STUDIO</small></span>
        </a>
        <div className="topbar-note"><span className="status-dot" />文字仅在你的浏览器中处理</div>
      </header>

      <main>
        <section className="intro">
          <div>
            <p className="eyebrow"><Icon name="sparkle" size={15} /> 为中文社交平台而做</p>
            <h1>让文字，<em>竖起来。</em></h1>
          </div>
          <p className="intro-copy">从上到下，从右到左。自动适配微信或 X 的显示宽度，<br />生成后可直接复制粘贴。</p>
        </section>

        <div className="workspace">
          <aside className="editor-panel">
            <div className="panel-heading">
              <div><span className="step">01</span><h2>输入文字</h2></div>
              <div className="text-actions">
                <button className="icon-button" onClick={() => fileInputRef.current?.click()} title="打开文本文件"><Icon name="file" /></button>
                <button className="icon-button" onClick={() => setText('')} title="清空文字"><Icon name="trash" /></button>
                <input ref={fileInputRef} type="file" accept=".txt,text/plain" onChange={importFile} hidden />
              </div>
            </div>

            <div className="textarea-wrap">
              <textarea value={text} onChange={(event) => setText(event.target.value)} placeholder="在这里输入要竖排的文字……" aria-label="要竖排的原文" spellCheck={false} />
              <div className="textarea-footer">
                <button className="sample-button" onClick={() => setText(SAMPLE_TEXT)}><Icon name="rotate" size={14} /> 使用例文</button>
                <span>{characterCount.toLocaleString()} 字</span>
              </div>
            </div>

            <div className="settings-heading"><span className="step">02</span><h2>排版设置</h2></div>
            <div className="settings">
              <div className="platform-presets" aria-label="平台宽度预设">
                <button className={messageWidth === 13 ? 'active' : ''} onClick={() => setMessageWidth(13)}>微信 <span>13 格</span></button>
                <button className={messageWidth === 21 ? 'active' : ''} onClick={() => setMessageWidth(21)}>X <span>21 格</span></button>
              </div>
              <RangeSetting label="输出宽度" value={messageWidth} display={`${messageWidth} 格`} min={7} max={31} step={2} minLabel="7" maxLabel="31" onChange={setMessageWidth} />
              <div className="setting-hint">{columnsPerBlock} 个文字列{blankColumn ? ` + ${columnsPerBlock - 1} 个空列` : ''} · 自动 {charactersPerColumn} 行</div>
              <RangeSetting label="预览字号" value={fontSize} display={`${fontSize}px`} min={16} max={36} minLabel="小" maxLabel="大" onChange={setFontSize} />
              <RangeSetting label="预览列距" value={columnGap} display={`${columnGap.toFixed(2)}em`} min={0.8} max={1.8} step={0.05} minLabel="窄" maxLabel="宽" onChange={setColumnGap} />
              <ToggleSetting label="列间空一格" help="默认开启，关闭后各列紧贴" checked={blankColumn} onChange={setBlankColumn} />
              <ToggleSetting label="英文数字转全角" help="避免微信与 X 中半角字符错位" checked={fullWidthAscii} onChange={setFullWidthAscii} />
              <label className="toggle-setting">
                <span><b>转换竖排标点</b><small>支持中文引号、句号和括号</small></span>
                <input type="checkbox" checked={convertPunctuation} onChange={(event) => setConvertPunctuation(event.target.checked)} />
                <span className="toggle" aria-hidden="true" />
              </label>
            </div>
          </aside>

          <section className="preview-panel">
            <div className="preview-toolbar">
              <div className="view-tabs" role="tablist" aria-label="预览方式">
                <button className={activeView === 'plain' ? 'active' : ''} onClick={() => setActiveView('plain')} role="tab" aria-selected={activeView === 'plain'}>微信 / X 文本</button>
                <button className={activeView === 'visual' ? 'active' : ''} onClick={() => setActiveView('visual')} role="tab" aria-selected={activeView === 'visual'}>阅读预览</button>
              </div>
              <span className="column-count">{columnCount} 个文字列 · {charactersPerColumn} 行</span>
            </div>

            <div className={`paper-stage ${activeView === 'plain' ? 'plain-stage' : ''}`}>
              <div className="paper-corner top-left" /><div className="paper-corner bottom-right" />
              {text ? activeView === 'visual' ? (
                <div className="visual-scroll">
                  <article className="vertical-text" style={{ fontSize: `${fontSize}px`, height: `${charactersPerColumn * fontSize * 1.5}px`, lineHeight: `${columnGap}` }}>{verticalText}</article>
                </div>
              ) : (
                <div className="plain-scroll">
                  <section className="social-block">
                    <header><span>{messageWidth === 13 ? '微信预设' : messageWidth === 21 ? 'X 预设' : '自定义'} · {messageWidth} 格宽</span><span>自动 {charactersPerColumn} 行</span></header>
                    <pre>{plainText}</pre>
                  </section>
                </div>
              ) : (
                <div className="empty-state"><span>竖</span><p>在左侧输入文字<br />这里会生成可粘贴的竖排文本</p></div>
              )}
            </div>

            <footer className="preview-footer">
              <p>{messageWidth === 13 ? '微信安全宽度' : messageWidth === 21 ? 'X 宽屏预设' : '自定义宽度'}，高度随文字量自动增长。</p>
              <div>
                <button className="secondary-button" onClick={downloadResult} disabled={!text}><Icon name="download" /> 保存 .txt</button>
                <button className={`primary-button ${copied ? 'success' : ''}`} onClick={copyResult} disabled={!text}><Icon name={copied ? 'check' : 'copy'} /> {copied ? '已复制' : messageWidth === 13 ? '复制微信文本' : messageWidth === 21 ? '复制 X 文本' : '复制结果'}</button>
              </div>
            </footer>
          </section>
        </div>
      </main>
      <footer className="site-footer"><span>竖排工房</span><span>Made for quiet reading.</span></footer>
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
      <input type="range" min={min} max={max} step={step} value={value} style={{ '--progress': `${progress}%` } as CSSProperties} onChange={(event) => onChange(Number(event.target.value))} />
      <small><span>{minLabel}</span><span>{maxLabel}</span></small>
    </label>
  )
}

function ToggleSetting({ label, help, checked, onChange }: { label: string; help: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="toggle-setting">
      <span><b>{label}</b><small>{help}</small></span>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <span className="toggle" aria-hidden="true" />
    </label>
  )
}

export default App
