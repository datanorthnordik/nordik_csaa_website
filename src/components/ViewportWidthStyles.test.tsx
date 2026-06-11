import { act, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { ViewportWidthStyles } from './ViewportWidthStyles'

describe('ViewportWidthStyles', () => {
  const originalInnerWidth = window.innerWidth

  beforeEach(() => {
    document.documentElement.style.removeProperty('--viewport-width')
    document.documentElement.style.removeProperty('--viewport-half-width')
  })

  afterEach(() => {
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: originalInnerWidth,
      writable: true,
    })
    document.documentElement.style.removeProperty('--viewport-width')
    document.documentElement.style.removeProperty('--viewport-half-width')
  })

  it('keeps viewport width CSS variables in sync with the window width', () => {
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: 1440,
      writable: true,
    })

    render(<ViewportWidthStyles />)

    expect(document.documentElement.style.getPropertyValue('--viewport-width')).toBe('1440px')
    expect(document.documentElement.style.getPropertyValue('--viewport-half-width')).toBe('720px')

    act(() => {
      Object.defineProperty(window, 'innerWidth', {
        configurable: true,
        value: 1280,
        writable: true,
      })
      window.dispatchEvent(new Event('resize'))
    })

    expect(document.documentElement.style.getPropertyValue('--viewport-width')).toBe('1280px')
    expect(document.documentElement.style.getPropertyValue('--viewport-half-width')).toBe('640px')
  })
})
