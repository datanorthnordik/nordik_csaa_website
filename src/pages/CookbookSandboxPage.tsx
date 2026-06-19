import { useEffect, useMemo, useRef, useState } from 'react'
import { booksApi, type PublicBookDetail, type PublicBookSummary } from '../api/booksApi'
import { DocumentFlipbook } from '../components/flipbook/DocumentFlipbook'
import { usePageBreadcrumbs } from '../components/SiteBreadcrumbs'
import { SITE_NAME, usePageSeo } from '../lib/usePageSeo'
import { RecipeWizard } from './RecipeWizard'
import styles from './CookbookSandboxPage.module.css'

export function CookbookSandboxPage() {
  const [selectedBook, setSelectedBook] = useState<PublicBookDetail | null>(null)
  const [isWizardOpen, setIsWizardOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [loadErrorMessage, setLoadErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const viewerRef = useRef<HTMLElement>(null)

  function scrollToViewer() {
    viewerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  usePageBreadcrumbs([
    { label: 'Community Circle', href: '/community-circle' },
    { label: 'Community Cookbook' },
  ])

  usePageSeo({
    title: `Community Cookbook | ${SITE_NAME}`,
    description:
      'Browse our growing community cookbook and share a family recipe, a place to pass down the food, stories, and traditions that gather us together.',
    canonicalPath: '/community-cookbook',
  })

  useEffect(() => {
    void (async () => {
      try {
        setIsLoading(true)
        setLoadErrorMessage('')
        const books = await booksApi.listPublicBooks()
        const cookbook = pickInitialBook(books)

        if (!cookbook) {
          setSelectedBook(null)
          setLoadErrorMessage('Book is not available right now.')
          return
        }

        const detail = await booksApi.getPublicBook(cookbook.id)
        setSelectedBook(detail)
      } catch (error) {
        setSelectedBook(null)
        setLoadErrorMessage(error instanceof Error ? error.message : 'Unable to load book.')
      } finally {
        setIsLoading(false)
      }
    })()
  }, [])

  const flipbookSource = useMemo(() => {
    if (!selectedBook) {
      return null
    }

    return {
      kind: 'pdf' as const,
      url: booksApi.resolveContentUrl(selectedBook.version.pdfContentUrl),
      fileName: `${selectedBook.title}.pdf`,
    }
  }, [selectedBook])

  function openWizard() {
    setSuccessMessage('')
    setIsWizardOpen(true)
  }

  return (
    <main className={styles.page}>
      {isLoading ? (
        <section className={styles.stateCard}>
          <p>Loading book...</p>
        </section>
      ) : loadErrorMessage ? (
        <section className={styles.stateCard}>
          <p>{loadErrorMessage}</p>
        </section>
      ) : selectedBook && flipbookSource ? (
        <>
          <section className={styles.intro}>
            <CookbookMotifs />
            <div className={styles.introInner}>
              <p className={styles.eyebrow}>Community Cookbook</p>
              <h1 className={styles.introTitle}>{selectedBook.title}</h1>
              <img src="/cookbook/1.png" alt="" aria-hidden="true" className={styles.ruleImg} />
              <p className={styles.introLead}>
                Every recipe here carries a story, a grandmother's bannock, a feast
                shared after a gathering, the dish that tastes like home. Flip through
                the pages, then add your own family recipe so it can be passed on.
              </p>
              <div className={styles.introActions}>
                <button type="button" className={styles.addButton} onClick={openWizard}>
                  Add your recipe
                </button>
                <button type="button" className={styles.viewButton} onClick={scrollToViewer}>
                  View cookbook
                </button>
              </div>
            </div>
          </section>

          <CookbookRibbon />

          {successMessage ? <p className={styles.successBox}>{successMessage}</p> : null}

          <section ref={viewerRef} className={styles.viewerCard}>
            <DocumentFlipbook source={flipbookSource} title={selectedBook.title} theme="cookbook" />
          </section>

          {isWizardOpen ? (
            <RecipeWizard
              book={selectedBook}
              onClose={() => setIsWizardOpen(false)}
              onSubmitted={(message) => {
                setSuccessMessage(message)
                setIsWizardOpen(false)
              }}
            />
          ) : null}
        </>
      ) : (
        <section className={styles.stateCard}>
          <p>Book is not available right now.</p>
        </section>
      )}
    </main>
  )
}

/**
 * Ribbon order — every illustration except #1 (used as the header underline),
 * arranged so no two neighbours repeat the same subject (e.g. the duplicate
 * nut illustrations 15 and 16 are kept apart, and the loop seam never matches).
 */
const RIBBON_ART = [
  2, 8, 11, 14, 3, 17, 6, 20, 9, 15, 4, 18, 7, 21, 10, 16, 5, 23, 12, 24, 13, 19, 22,
].map((n) => `/cookbook/${n}.png`)

/** A few illustrations scattered as soft accents around the hero band. */
const HERO_MOTIFS = [
  { src: '/cookbook/7.png', className: 'motifTopLeft' },
  { src: '/cookbook/2.png', className: 'motifTopLeft2' },
  { src: '/cookbook/11.png', className: 'motifTopRight' },
  { src: '/cookbook/10.png', className: 'motifTopRight2' },
  { src: '/cookbook/22.png', className: 'motifBottomLeft' },
  { src: '/cookbook/20.png', className: 'motifBottomLeft2' },
  { src: '/cookbook/18.png', className: 'motifBottomRight' },
  { src: '/cookbook/8.png', className: 'motifBottomRight2' },
] as const

function CookbookMotifs() {
  return (
    <div className={styles.motifs} aria-hidden="true">
      {HERO_MOTIFS.map((motif) => (
        <img
          key={motif.className}
          src={motif.src}
          alt=""
          loading="lazy"
          className={`${styles.motif} ${styles[motif.className]}`}
        />
      ))}
    </div>
  )
}

/** Full-color marquee that cycles through every illustration. */
function CookbookRibbon() {
  return (
    <div className={styles.ribbon} aria-hidden="true">
      <div className={styles.ribbonTrack}>
        {[...RIBBON_ART, ...RIBBON_ART].map((src, index) => (
          <img
            key={`${src}-${index}`}
            src={src}
            alt=""
            loading="lazy"
            className={styles.ribbonImg}
          />
        ))}
      </div>
    </div>
  )
}

function pickInitialBook(books: PublicBookSummary[]) {
  return books[0] ?? null
}
