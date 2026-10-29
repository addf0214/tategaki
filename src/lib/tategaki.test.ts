import { describe, expect, it } from 'vitest'
import { calculateColumnHeight, formatVerticalBlocks, formatVerticalText, prepareVerticalText } from './tategaki'

describe('prepareVerticalText', () => {
  it('converts punctuation to vertical presentation forms', () => {
    expect(prepareVerticalText('「こんにちは、世界。」')).toBe('﹁こんにちは︑世界︒﹂')
  })

  it('supports Chinese quotes and full-width Latin characters', () => {
    expect(prepareVerticalText('“微信 X 2026”')).toBe('﹃微信　Ｘ　２０２６﹄')
  })

  it('can keep the original punctuation', () => {
    expect(prepareVerticalText('（はい。）', { convertPunctuation: false })).toBe('（はい。）')
  })
})

describe('formatVerticalText', () => {
  it('calculates height from text length and available text columns', () => {
    expect(calculateColumnHeight('文'.repeat(190), 8)).toBe(24)
    expect(calculateColumnHeight('文'.repeat(160), 8)).toBe(20)
  })

  it('fills columns top-to-bottom and emits them right-to-left', () => {
    expect(formatVerticalText('abcdef', { charactersPerColumn: 3, convertPunctuation: false, fullWidthAscii: false })).toBe('d　a\ne　b\nf　c')
  })

  it('pads the final column and preserves grapheme clusters', () => {
    expect(formatVerticalText('A👨‍👩‍👧‍👦B', { charactersPerColumn: 2, convertPunctuation: false, fullWidthAscii: false })).toBe('B　A\n　　👨‍👩‍👧‍👦')
  })

  it('can remove the empty column between text columns', () => {
    expect(formatVerticalText('甲乙丙丁', { charactersPerColumn: 2, blankColumn: false }))
      .toBe('丙甲\n丁乙')
  })

  it('splits long text into phone-width blocks', () => {
    expect(formatVerticalText('甲乙丙丁戊己庚辛壬癸子丑寅卯辰巳午未', {
      charactersPerColumn: 3,
      columnsPerBlock: 2,
    })).toBe(
      '丁　甲\n戊　乙\n己　丙\n\n' +
      '癸　庚\n子　辛\n丑　壬\n\n' +
      '巳　寅\n午　卯\n未　辰',
    )
  })

  it('uses a 15-cell WeChat width by default', () => {
    const blocks = formatVerticalBlocks('文'.repeat(161))
    expect(blocks).toHaveLength(2)
    expect(blocks[0].split('\n')).toHaveLength(20)
    expect(Array.from(blocks[0].split('\n')[0])).toHaveLength(15)
  })

  it('keeps the same 15-cell width when column gaps are disabled', () => {
    const [block] = formatVerticalBlocks('文'.repeat(300), {
      charactersPerColumn: 20,
      columnsPerBlock: 15,
      blankColumn: false,
    })
    expect(Array.from(block.split('\n')[0])).toHaveLength(15)
  })

  it('returns an empty result for empty input', () => {
    expect(formatVerticalText('')).toBe('')
  })
})
