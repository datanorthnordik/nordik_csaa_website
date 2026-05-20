import { forwardRef, useMemo, useRef, useState } from 'react'
import HTMLFlipBook from 'react-pageflip'
import { Document, Page, pdfjs } from 'react-pdf'
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
  children: React.ReactNode
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
  const bookRef = useRef<FlipBookRef | null>(null)
  const [currentSpreadPage, setCurrentSpreadPage] = useState(0)
  const [pdfPageCount, setPdfPageCount] = useState(0)
  const pageWidth = 500
  const pageHeight = 680

  const totalPages = source.kind === 'images' ? source.pages.length : pdfPageCount
  const pageCountLabel = totalPages
    ? `${Math.min(currentSpreadPage + 1, totalPages)} / ${totalPages}`
    : '--'

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
      className={styles.reader}
      aria-label={`Newsletter reader for ${title}`}
    >
      <div className={styles.readerToolbar}>
        <div className={styles.readerActions}>
          <span className={styles.readerCount}>{pageCountLabel}</span>
          <button
            type="button"
            className={styles.readerButton}
            onClick={() => bookRef.current?.pageFlip().flipPrev()}
            aria-label="Previous page"
          >
            Prev
          </button>
          <button
            type="button"
            className={styles.readerButton}
            onClick={() => bookRef.current?.pageFlip().flipNext()}
            aria-label="Next page"
          >
            Next
          </button>
        </div>
      </div>

      <div className={styles.bookShell}>
        {source.kind === 'pdf' ? (
          <Document
            file={source.url}
            onLoadSuccess={({ numPages }) => {
              setPdfPageCount(numPages)
              setCurrentSpreadPage(0)
            }}
            loading={<p className={styles.readerState}>Loading newsletter pages...</p>}
            error={<p className={styles.readerState}>We could not load this newsletter file.</p>}
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
    </section>
  )
}
