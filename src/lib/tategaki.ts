export interface TategakiOptions {
  charactersPerColumn?: number
  convertPunctuation?: boolean
}

const VERTICAL_PUNCTUATION: Record<string, string> = {
  '、': '︑', ',': '︐', '，': '︐', '。': '︒', '.': '︒', '．': '︒',
  '：': '︓', ':': '︓', '；': '︔', ';': '︔', '！': '︕', '!': '︕',
  '？': '︖', '?': '︖', '「': '﹁', '」': '﹂', '『': '﹃', '』': '﹄',
  '（': '︵', '）': '︶', '(': '︵', ')': '︶', '【': '︻', '】': '︼',
  '〔': '︹', '〕': '︺', '《': '︽', '》': '︾', '〈': '︿', '〉': '﹀',
  '［': '﹇', '］': '﹈', '[': '﹇', ']': '﹈', '…': '︙', '—': '︱',
  '―': '︱', '–': '︲', '-': '︲', '〜': '｜', '~': '｜',
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
  { convertPunctuation = true }: TategakiOptions = {},
): string {
  const normalized = input.replace(/\r\n?/g, '\n').replace(/\t/g, '　　')
  if (!convertPunctuation) return normalized
  return splitGraphemes(normalized).map((char) => VERTICAL_PUNCTUATION[char] ?? char).join('')
}

export function formatVerticalText(
  input: string,
  { charactersPerColumn = 20, convertPunctuation = true }: TategakiOptions = {},
): string {
  if (!input) return ''

  const safeColumnLength = Math.max(1, Math.floor(charactersPerColumn))
  const prepared = prepareVerticalText(input, { convertPunctuation })
    .replace(/\n/g, '　')
    .replace(/ /g, '　')
  const characters = splitGraphemes(prepared)
  const columns: string[][] = []

  for (let index = 0; index < characters.length; index += safeColumnLength) {
    columns.push(characters.slice(index, index + safeColumnLength))
  }

  const rowCount = Math.min(safeColumnLength, characters.length)
  const rightToLeftColumns = columns.reverse()
  return Array.from({ length: rowCount }, (_, row) =>
    rightToLeftColumns.map((column) => column[row] ?? '　').join('　'),
  ).join('\n')
}
