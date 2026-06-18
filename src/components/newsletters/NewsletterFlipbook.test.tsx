import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import i18n from '../../i18n'
import { NewsletterFlipbook } from './NewsletterFlipbook'

vi.mock('react-pageflip', async () => {
  const React = await import('react')

  const MockFlipBook = React.forwardRef(function MockFlipBook(
    {
      children,
      onFlip,
      startPage = 0,
    }: {
      children: React.ReactNode
      onFlip?: (event: {
        data: number
      }) => void
      startPage?: number
    },
    ref: React.ForwardedRef<{
      pageFlip: () => {
        flipNext: () => void
        flipPrev: () => void
        flip: (pageNumber: number) => void
      }
    }>,
  ) {
    const pageRef = React.useRef(startPage)
    const totalPages = React.Children.count(children)

    React.useImperativeHandle(ref, () => ({
      pageFlip: () => ({
        flipNext() {
          pageRef.current = Math.min(pageRef.current + 1, Math.max(totalPages - 1, 0))
          onFlip?.({
            data: pageRef.current,
          })
        },
        flipPrev() {
          pageRef.current = Math.max(pageRef.current - 1, 0)
          onFlip?.({
            data: pageRef.current,
          })
        },
        flip(pageNumber: number) {
          pageRef.current = Math.min(Math.max(pageNumber, 0), Math.max(totalPages - 1, 0))
          onFlip?.({
            data: pageRef.current,
          })
        },
      }),
    }))

    return <div data-testid="mock-flipbook">{children}</div>
  })

  return {
    default: MockFlipBook,
  }
})

vi.mock('react-pdf', async () => {
  const React = await import('react')

  return {
    Document: ({
      children,
      onLoadSuccess,
    }: {
      children: React.ReactNode
      onLoadSuccess?: ({
        numPages,
      }: {
        numPages: number
      }) => void
    }) => {
      React.useEffect(() => {
        onLoadSuccess?.({
          numPages: 4,
        })
      }, [onLoadSuccess])

      return <div>{children}</div>
    },
    Page: ({
      pageNumber,
      className,
    }: {
      pageNumber: number
      className?: string
    }) => <div className={className}>PDF page {pageNumber}</div>,
    pdfjs: {
      GlobalWorkerOptions: {
        workerSrc: '',
      },
    },
  }
})

const imageSource = {
  kind: 'images' as const,
  pages: [
    {
      id: 1,
      title: 'Cover',
      altText: 'Cover',
      imageUrl: 'https://example.com/cover.jpg',
    },
    {
      id: 2,
      title: 'Page 2',
      altText: 'Page 2',
      imageUrl: 'https://example.com/page-2.jpg',
    },
    {
      id: 3,
      title: 'Page 3',
      altText: 'Page 3',
      imageUrl: 'https://example.com/page-3.jpg',
    },
  ],
}

const pdfSource = {
  kind: 'pdf' as const,
  url: 'https://example.com/cookbook.pdf',
  fileName: 'cookbook.pdf',
}

describe('NewsletterFlipbook', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('en')
  })

  function expectPageCount(value: string) {
    expect(screen.getAllByText(value).length).toBeGreaterThan(0)
  }

  it('uses the slider and jump controls to move through pages quickly', () => {
    const { container } = render(
      <NewsletterFlipbook source={imageSource} title="Community Reunion Highlights" />,
    )

    expectPageCount('1 / 3')

    const slider = container.querySelector('input[type="range"]')
    const firstPageButton = container.querySelector('button[aria-label="First page"]')
    const nextPageButtons = container.querySelectorAll('button[aria-label="Next page"]')

    expect(slider).not.toBeNull()
    expect(firstPageButton).not.toBeNull()
    expect(nextPageButtons.length).toBeGreaterThan(0)

    fireEvent.change(slider!, {
      target: {
        value: '3',
      },
    })
    expectPageCount('3 / 3')

    fireEvent.click(firstPageButton!)
    expectPageCount('1 / 3')

    fireEvent.click(nextPageButtons[0])
    expectPageCount('2 / 3')
  })

  it('turns pages with a horizontal touchpad-style wheel gesture but ignores vertical scrolling', () => {
    render(<NewsletterFlipbook source={imageSource} title="Community Reunion Highlights" />)

    const readerRegion = screen.getByRole('region', {
      name: /newsletter reader for community reunion highlights/i,
    })

    fireEvent.wheel(readerRegion, {
      deltaX: 0,
      deltaY: 120,
    })
    expectPageCount('1 / 3')

    fireEvent.wheel(readerRegion, {
      deltaX: 120,
      deltaY: 12,
    })
    expectPageCount('2 / 3')
  })

  it('renders pdf pages after the document loads so pdf-based flipbooks stay covered', async () => {
    render(<NewsletterFlipbook source={pdfSource} title="Community Cookbook" />)

    expect(await screen.findByText('PDF page 1')).toBeDefined()
    expectPageCount('1 / 4')
    expect(screen.getByText('PDF page 4')).toBeDefined()
  })
})
