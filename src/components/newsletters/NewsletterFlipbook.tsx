import {
  forwardRef,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
  type ReactNode,
} from 'react'
import HTMLFlipBook from 'react-pageflip'
import { Document, Page, pdfjs } from 'react-pdf'
import { useTranslation } from 'react-i18next'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'
import type { NewsletterFlipbookSource } from '../../lib/newsletterMedia'
import styles from './NewsletterFlipbook.module.css'

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString()

type NewsletterFlipbookProps = {
  source: NewsletterFlipbookSource
  title: string
}

type FlipBookRef = {
  pageFlip: () => {
    flipNext: () => void
    flipPrev: () => void
    flip: (pageNumber: number) => void
  }
}

type PageRenderProps = {
  label: string
  children: ReactNode
}

const FlipPage = forwardRef<HTMLDivElement, PageRenderProps>(function FlipPage(
  { label, children },
  ref,
) {
  return (
    <div ref={ref} className={styles.bookPage}>
      <div className={styles.pageFrame}>
        <div className={styles.pageChrome}>
          <span>{label}</span>
        </div>
        <div className={styles.pageContent}>{children}</div>
      </div>
    </div>
  )
})

export function NewsletterFlipbook({ source, title }: NewsletterFlipbookProps) {
  const { t } = useTranslation()
  const readerRef = useRef<HTMLElement | null>(null)
  const bookRef = useRef<FlipBookRef | null>(null)
  const wheelDeltaRef = useRef(0)
  const wheelResetTimeoutRef = useRef<number | null>(null)
  const wheelCooldownUntilRef = useRef(0)
  const readerHintId = useId()
  const [currentSpreadPage, setCurrentSpreadPage] = useState(0)
  const [pdfPageCount, setPdfPageCount] = useState(0)
  const pageWidth = 500
  const pageHeight = 680

  useEffect(() => {
    setCurrentSpreadPage(0)

    if (source.kind === 'images') {
      setPdfPageCount(0)
    }
  }, [source])

  const totalPages = source.kind === 'images' ? source.pages.length : pdfPageCount
  const currentPage = totalPages ? Math.min(currentSpreadPage + 1, totalPages) : 1
  const pageCountLabel = totalPages ? `${currentPage} / ${totalPages}` : '--'
  const canFlipPrev = currentSpreadPage > 0
  const canFlipNext = totalPages > 0 && currentSpreadPage < totalPages - 1
  const showNavigationControls = source.kind === 'pdf' || totalPages > 1
  const sliderMax = Math.max(totalPages, 1)

  function goToPage(pageNumber: number) {
    if (totalPages <= 0) {
      return
    }

    const clampedPageNumber = Math.min(Math.max(pageNumber, 1), totalPages)
    if (clampedPageNumber === currentPage) {
      return
    }

    bookRef.current?.pageFlip().flip(clampedPageNumber - 1)
  }

  function goToFirstPage() {
    goToPage(1)
  }

  function goToLastPage() {
    goToPage(totalPages)
  }

  function flipPrev() {
    if (!canFlipPrev) {
      return
    }

    bookRef.current?.pageFlip().flipPrev()
  }

  function flipNext() {
    if (!canFlipNext) {
      return
    }

    bookRef.current?.pageFlip().flipNext()
  }

  useEffect(() => {
    const readerElement = readerRef.current
    if (!readerElement) {
      return
    }

    function clearWheelGesture() {
      wheelDeltaRef.current = 0

      if (wheelResetTimeoutRef.current !== null) {
        window.clearTimeout(wheelResetTimeoutRef.current)
        wheelResetTimeoutRef.current = null
      }
    }

    function handleWheel(event: WheelEvent) {
      if (totalPages <= 1 || event.ctrlKey) {
        return
      }

      const shiftedHorizontalDelta =
        event.shiftKey && Math.abs(event.deltaX) < 1 ? event.deltaY : 0
      const horizontalDelta =
        Math.abs(event.deltaX) >= 1 ? event.deltaX : shiftedHorizontalDelta
      const absHorizontalDelta = Math.abs(horizontalDelta)
      const absVerticalDelta = Math.abs(event.deltaY)
      const isHorizontalGesture =
        absHorizontalDelta > 6 && absHorizontalDelta >= absVerticalDelta

      if (!isHorizontalGesture) {
        return
      }

      event.preventDefault()

      const now = typeof performance !== 'undefined' ? performance.now() : Date.now()
      if (now < wheelCooldownUntilRef.current) {
        return
      }

      wheelDeltaRef.current += horizontalDelta

      if (wheelResetTimeoutRef.current !== null) {
        window.clearTimeout(wheelResetTimeoutRef.current)
      }

      wheelResetTimeoutRef.current = window.setTimeout(() => {
        wheelDeltaRef.current = 0
        wheelResetTimeoutRef.current = null
      }, 140)

      if (Math.abs(wheelDeltaRef.current) < 90) {
        return
      }

      if (wheelDeltaRef.current > 0) {
        flipNext()
      } else {
        flipPrev()
      }

      wheelCooldownUntilRef.current = now + 520
      clearWheelGesture()
    }

    readerElement.addEventListener('wheel', handleWheel, { passive: false })
    return () => {
      clearWheelGesture()
      readerElement.removeEventListener('wheel', handleWheel)
    }
  }, [flipNext, flipPrev, totalPages])

  function handleBookKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      flipPrev()
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault()
      flipNext()
    }
  }

  function handleSliderChange(event: ChangeEvent<HTMLInputElement>) {
    goToPage(Number(event.target.value))
  }

  const pageNodes = useMemo(() => {
    if (source.kind === 'images') {
      return source.pages.map((page, index) => (
        <FlipPage key={page.id} label={`Page ${index + 1}`}>
          <img src={page.imageUrl} alt={page.altText} className={styles.pageImage} />
        </FlipPage>
      ))
    }

    return Array.from({ length: pdfPageCount }, (_, index) => (
      <FlipPage key={index + 1} label={`Page ${index + 1}`}>
        <Page
          pageNumber={index + 1}
          width={pageWidth}
          renderAnnotationLayer={false}
          renderTextLayer={false}
          className={styles.pdfPage}
        />
      </FlipPage>
    ))
  }, [pageWidth, pdfPageCount, source])

  return (
    <section
      ref={readerRef}
      className={styles.reader}
      role="region"
      aria-label={t('newslettersPage.detail.readerLabel', { title })}
    >
      <div className={styles.readerHeader}>
        <div className={styles.readerHeaderCopy}>
          <span className={styles.readerCount} aria-live="polite">
            {pageCountLabel}
          </span>
          {showNavigationControls ? (
            <p id={readerHintId} className={styles.readerHint}>
              {t('newslettersPage.detail.readerHint')}
            </p>
          ) : null}
        </div>

        {showNavigationControls ? (
          <div className={styles.readerHeaderDock}>
            <button
              type="button"
              className={styles.readerHeaderDockButton}
              onClick={goToFirstPage}
              aria-label={t('newslettersPage.detail.firstPage')}
              title={t('newslettersPage.detail.firstPage')}
              disabled={!canFlipPrev}
            >
              <ReaderControlIcon name="doubleLeft" />
            </button>

            <input
              type="range"
              className={styles.readerHeaderSlider}
              min="1"
              max={sliderMax}
              step="1"
              value={Math.min(currentPage, sliderMax)}
              onChange={handleSliderChange}
              aria-label={t('newslettersPage.detail.pageSlider')}
              aria-valuetext={
                totalPages
                  ? t('newslettersPage.detail.pageValue', {
                      current: currentPage,
                      total: totalPages,
                    })
                  : undefined
              }
              disabled={totalPages <= 1}
            />

            <button
              type="button"
              className={styles.readerHeaderDockButton}
              onClick={goToLastPage}
              aria-label={t('newslettersPage.detail.lastPage')}
              title={t('newslettersPage.detail.lastPage')}
              disabled={!canFlipNext}
            >
              <ReaderControlIcon name="doubleRight" />
            </button>
          </div>
        ) : null}
      </div>

      <div className={styles.readerStage}>
        {showNavigationControls ? (
          <button
            type="button"
            className={`${styles.readerEdgeButton} ${styles.readerEdgeButtonLeft}`}
            onClick={flipPrev}
            aria-label={t('newslettersPage.detail.previousPage')}
            title={t('newslettersPage.detail.previousPage')}
            disabled={!canFlipPrev}
          >
            <ReaderControlIcon name="chevronLeft" />
          </button>
        ) : null}

        <div
          className={styles.bookShell}
          tabIndex={0}
          onKeyDown={handleBookKeyDown}
          aria-describedby={showNavigationControls ? readerHintId : undefined}
        >
          {source.kind === 'pdf' ? (
            <Document
              file={source.url}
              onLoadSuccess={({ numPages }) => {
                setPdfPageCount(numPages)
                setCurrentSpreadPage(0)
              }}
              loading={<p className={styles.readerState}>Loading newsletter pages...</p>}
              error={
                <p className={styles.readerState}>We could not load this newsletter file.</p>
              }
            >
              {pageNodes.length ? (
                <HTMLFlipBook
                  ref={bookRef}
                  width={pageWidth}
                  height={pageHeight}
                  minWidth={260}
                  maxWidth={pageWidth}
                  minHeight={380}
                  maxHeight={pageHeight}
                  size="stretch"
                  drawShadow
                  flippingTime={900}
                  usePortrait
                  startZIndex={1}
                  autoSize
                  maxShadowOpacity={0.28}
                  showCover
                  mobileScrollSupport
                  clickEventForward
                  useMouseEvents
                  swipeDistance={24}
                  showPageCorners
                  disableFlipByClick={false}
                  className={styles.book}
                  style={{}}
                  startPage={0}
                  onFlip={(event) => setCurrentSpreadPage(event.data ?? 0)}
                >
                  {pageNodes}
                </HTMLFlipBook>
              ) : null}
            </Document>
          ) : (
            <HTMLFlipBook
              ref={bookRef}
              width={pageWidth}
              height={pageHeight}
              minWidth={260}
              maxWidth={pageWidth}
              minHeight={380}
              maxHeight={pageHeight}
              size="stretch"
              drawShadow
              flippingTime={900}
              usePortrait
              startZIndex={1}
              autoSize
              maxShadowOpacity={0.28}
              showCover
              mobileScrollSupport
              clickEventForward
              useMouseEvents
              swipeDistance={24}
              showPageCorners
              disableFlipByClick={false}
              className={styles.book}
              style={{}}
              startPage={0}
              onFlip={(event) => setCurrentSpreadPage(event.data ?? 0)}
            >
              {pageNodes}
            </HTMLFlipBook>
          )}
        </div>

        {showNavigationControls ? (
          <button
            type="button"
            className={`${styles.readerEdgeButton} ${styles.readerEdgeButtonRight}`}
            onClick={flipNext}
            aria-label={t('newslettersPage.detail.nextPage')}
            title={t('newslettersPage.detail.nextPage')}
            disabled={!canFlipNext}
          >
            <ReaderControlIcon name="chevronRight" />
          </button>
        ) : null}
      </div>
    </section>
  )
}

function ReaderControlIcon({
  name,
}: {
  name: 'chevronLeft' | 'chevronRight' | 'doubleLeft' | 'doubleRight'
}) {
  return (
    <svg
      className={styles.readerControlIcon}
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {name === 'chevronLeft' ? (
        <path d="m14.5 6-6 6 6 6" />
      ) : null}
      {name === 'chevronRight' ? (
        <path d="m9.5 6 6 6-6 6" />
      ) : null}
      {name === 'doubleLeft' ? (
        <>
          <path d="m16 6-6 6 6 6" />
          <path d="m10 6-6 6 6 6" />
        </>
      ) : null}
      {name === 'doubleRight' ? (
        <>
          <path d="m8 6 6 6-6 6" />
          <path d="m14 6 6 6-6 6" />
        </>
      ) : null}
    </svg>
  )
}
