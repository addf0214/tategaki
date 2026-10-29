import { describe, expect, it } from 'vitest'
import { formatVerticalText, prepareVerticalText } from './tategaki'

describe('prepareVerticalText', () => {
  it('converts punctuation to vertical presentation forms', () => {
    expect(prepareVerticalText('「こんにちは、世界。」')).toBe('﹁こんにちは︑世界︒﹂')
  })

  it('can keep the original punctuation', () => {
    expect(prepareVerticalText('（はい。）', { convertPunctuation: false })).toBe('（はい。）')
  })
})

describe('formatVerticalText', () => {
  it('fills columns top-to-bottom and emits them right-to-left', () => {
    expect(formatVerticalText('abcdef', { charactersPerColumn: 3, convertPunctuation: false })).toBe('d　a\ne　b\nf　c')
  })

  it('pads the final column and preserves grapheme clusters', () => {
    expect(formatVerticalText('A👨‍👩‍👧‍👦B', { charactersPerColumn: 2, convertPunctuation: false })).toBe('B　A\n　　👨‍👩‍👧‍👦')
  })

  it('returns an empty result for empty input', () => {
    expect(formatVerticalText('')).toBe('')
  })
})
