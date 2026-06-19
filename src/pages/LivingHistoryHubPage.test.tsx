import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { LivingHistoryHubPage } from './LivingHistoryHubPage'

const {
  submitContribution,
  getVideoPackage,
  toastSuccess,
  toastError,
  usePageBreadcrumbs,
} = vi.hoisted(() => ({
  submitContribution: vi.fn(),
  getVideoPackage: vi.fn(),
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
  usePageBreadcrumbs: vi.fn(),
}))

vi.mock('../api/knowledgeCenterApi', () => ({
  knowledgeCenterApi: {
    submitContribution,
  },
}))

vi.mock('../api/videosApi', () => ({
  getVideoTeaserUrl: vi.fn(() => ''),
  videosApi: {
    getVideoPackage,
  },
}))

vi.mock('../components/SiteBreadcrumbs', () => ({
  usePageBreadcrumbs,
}))

vi.mock('../components/SharedImageHero', () => ({
  SharedImageHero: ({ title }: { title: string }) => <div>{title}</div>,
}))

vi.mock('react-hot-toast', () => ({
  default: {
    success: toastSuccess,
    error: toastError,
  },
}))

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (value: string) => value,
  }),
}))

describe('LivingHistoryHubPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    submitContribution.mockResolvedValue({
      message: 'Knowledge center submission created successfully',
      submission: {
        id: 12,
        submitter_name: 'Alice Walker',
        submitter_email: 'alice@example.com',
        submitter_phone: '555-0100',
        submission_type: 'both',
        message: 'I have a story to share.',
        status: 'open',
        completion_notes: '',
        created_at: '2026-06-18T12:00:00Z',
        updated_at: '2026-06-18T12:00:00Z',
      },
    })

    getVideoPackage.mockResolvedValue({
      videos: [],
    })

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(() => ({
        matches: false,
        media: '',
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })

    Object.defineProperty(window, 'IntersectionObserver', {
      writable: true,
      value: class MockIntersectionObserver {
        private readonly callback: IntersectionObserverCallback

        constructor(callback: IntersectionObserverCallback) {
          this.callback = callback
        }

        observe(target: Element) {
          this.callback(
            [
              {
                isIntersecting: true,
                target,
              } as IntersectionObserverEntry,
            ],
            this as unknown as IntersectionObserver,
          )
        }

        disconnect() {}

        unobserve() {}

        takeRecords() {
          return []
        }

        root = null
        rootMargin = ''
        thresholds = []
      },
    })

    vi.stubGlobal('requestAnimationFrame', vi.fn(() => 1))
    vi.stubGlobal('cancelAnimationFrame', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('submits the contribution, shows a toast, resets the form, and keeps the form available', async () => {
    render(
      <MemoryRouter>
        <LivingHistoryHubPage />
      </MemoryRouter>,
    )

    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: 'Alice Walker' },
    })
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'alice@example.com' },
    })
    fireEvent.change(screen.getByLabelText('Phone (optional)'), {
      target: { value: '555-0100' },
    })
    fireEvent.change(screen.getByLabelText("I'd like to submit"), {
      target: { value: 'both' },
    })
    fireEvent.change(screen.getByLabelText('Tell us about it'), {
      target: { value: 'I have a story to share.' },
    })

    const submitButton = screen.getByRole('button', { name: /^Submit$/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(submitContribution).toHaveBeenCalledWith({
        name: 'Alice Walker',
        email: 'alice@example.com',
        phone: '555-0100',
        type: 'both',
        message: 'I have a story to share.',
      })
    })

    await waitFor(() => {
      expect(toastSuccess).toHaveBeenCalledWith(
        'Your Living History submission for a story and a video has been received. Our team will be reaching out to you shortly for further details.',
      )
    })

    expect(toastError).not.toHaveBeenCalled()
    expect((screen.getByLabelText('Name') as HTMLInputElement).value).toBe('')
    expect((screen.getByLabelText('Email') as HTMLInputElement).value).toBe('')
    expect((screen.getByLabelText('Phone (optional)') as HTMLInputElement).value).toBe(
      '',
    )
    expect(
      (screen.getByLabelText("I'd like to submit") as HTMLSelectElement).value,
    ).toBe('post')
    expect((screen.getByLabelText('Tell us about it') as HTMLTextAreaElement).value).toBe(
      '',
    )
    expect(
      (screen.getByRole('button', { name: /^Submit$/i }) as HTMLButtonElement).disabled,
    ).toBe(false)
  })
})
