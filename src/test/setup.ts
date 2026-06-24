import { configure } from '@testing-library/dom'
import { vi } from 'vitest'

// Lazy-loaded routes + async data mocks can exceed the default 1000ms findBy
// timeout when the machine is under load (dev server, etc.), causing flaky
// timeouts. Give async queries more headroom for reliable runs.
configure({ asyncUtilTimeout: 5000 })

Object.defineProperty(window, 'scrollTo', {
  value: vi.fn(),
  writable: true,
})

// GSAP ScrollTrigger calls window.matchMedia at registration time.
// jsdom doesn't implement it, so we stub it here.
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})
