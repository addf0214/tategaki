export interface TategakiOptions {
  charactersPerColumn?: number
  convertPunctuation?: boolean
  columnsPerBlock?: number
  blankColumn?: boolean
  fullWidthAscii?: boolean
}

const VERTICAL_PUNCTUATION: Record<string, string> = {
  '、': '︑', ',': '︐', '，': '︐', '。': '︒', '.': '︒', '．': '︒',
  '：': '︓', ':': '︓', '；': '︔', ';': '︔', '！': '︕', '!': '︕',
  '？': '︖', '?': '︖', '「': '﹁', '」': '﹂', '『': '﹃', '』': '﹄',
  '（': '︵', '）': '︶', '(': '︵', ')': '︶', '【': '︻', '】': '︼',
  '〔': '︹', '〕': '︺', '《': '︽', '》': '︾', '〈': '︿', '〉': '﹀',
  '［': '﹇', '］': '﹈', '[': '﹇', ']': '﹈', '…': '︙', '—': '︱',
  '―': '︱', '–': '︲', '-': '︲', '〜': '｜', '~': '｜',
  '“': '﹃', '”': '﹄', '‘': '﹁', '’': '﹂',
}

function splitGraphemes(text: string): string[] {
  if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
    const segmenter = new Intl.Segmenter('ja', { granularity: 'grapheme' })
    return Array.from(segmenter.segment(text), ({ segment }) => segment)
  }
  return Array.from(text)
}

export function prepareVerticalText(
  input: string,
  { convertPunctuation = true, fullWidthAscii = true }: TategakiOptions = {},
): string {
  const normalized = input.replace(/\r\n?/g, '\n').replace(/\t/g, '　　')
  return splitGraphemes(normalized).map((char) => {
    if (convertPunctuation && VERTICAL_PUNCTUATION[char]) return VERTICAL_PUNCTUATION[char]
    if (fullWidthAscii && char === ' ') return '　'
    if (fullWidthAscii && /^[!-~]$/.test(char)) {
      return String.fromCodePoint(char.codePointAt(0)! + 0xfee0)
    }
    return char
  }).join('')
}

export function formatVerticalText(
  input: string,
  options: TategakiOptions = {},
): string {
  return formatVerticalBlocks(input, options).join('\n\n')
}

export function formatVerticalBlocks(
  input: string,
  {
    charactersPerColumn = 15,
    convertPunctuation = true,
    columnsPerBlock = 4,
    blankColumn = true,
    fullWidthAscii = true,
  }: TategakiOptions = {},
): string[] {
  if (!input) return []

  const safeColumnLength = Math.max(1, Math.floor(charactersPerColumn))
  const safeBlockWidth = Math.max(1, Math.floor(columnsPerBlock))
  const prepared = prepareVerticalText(input, { convertPunctuation, fullWidthAscii })
    .replace(/\n/g, '　')
    .replace(/ /g, '　')
  const characters = splitGraphemes(prepared)
  const columns: string[][] = []

  for (let index = 0; index < characters.length; index += safeColumnLength) {
    columns.push(characters.slice(index, index + safeColumnLength))
  }

  const blocks: string[] = []
  const separator = blankColumn ? '　' : ''

  for (let index = 0; index < columns.length; index += safeBlockWidth) {
    const block = columns.slice(index, index + safeBlockWidth)
    const rowCount = Math.max(...block.map((column) => column.length))
    const rightToLeftColumns = block.reverse()
    blocks.push(Array.from({ length: rowCount }, (_, row) =>
      rightToLeftColumns.map((column) => column[row] ?? '　').join(separator),
    ).join('\n'))
  }

  return blocks
}
