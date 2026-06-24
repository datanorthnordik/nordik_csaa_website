import { useEffect, useMemo, useRef, useState } from 'react'
import { booksApi, type PublicBookDetail, type PublicBookField, type PublicBookSummary } from '../api/booksApi'
import { RichTextEditor } from '../components/cms/RichTextEditor'
import { DocumentFlipbook } from '../components/flipbook/DocumentFlipbook'
import { usePageBreadcrumbs } from '../components/SiteBreadcrumbs'
import { SITE_NAME, usePageSeo } from '../lib/usePageSeo'
import styles from './BooksTestPage.module.css'

type SubmissionValuesState = Record<number, string>

export function BooksTestPage() {
  const [selectedBook, setSelectedBook] = useState<PublicBookDetail | null>(null)
  const [values, setValues] = useState<SubmissionValuesState>({})
  const [targetMode, setTargetMode] = useState<'existing' | 'new'>('existing')
  const [targetSectionId, setTargetSectionId] = useState<number | ''>('')
  const [newSectionName, setNewSectionName] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imageInputKey, setImageInputKey] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loadErrorMessage, setLoadErrorMessage] = useState('')
  const [formErrorMessage, setFormErrorMessage] = useState('')
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
      'Browse our growing community cookbook and share a family recipe — a place to pass down the food, stories, and traditions that gather us together.',
    canonicalPath: '/test-book',
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
        resetForm(detail)
      } catch (error) {
        setSelectedBook(null)
        setLoadErrorMessage(error instanceof Error ? error.message : 'Unable to load book.')
      } finally {
        setIsLoading(false)
      }
    })()
  }, [])

  useEffect(() => {
    if (!isModalOpen) {
      return
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsModalOpen(false)
        setFormErrorMessage('')
      }
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isModalOpen])

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

  function clearSelectedImage() {
    setImageFile(null)
    setImageInputKey((current) => current + 1)
  }

  function resetForm(book: PublicBookDetail) {
    const shouldStartInNewSectionMode =
      book.version.sections.length === 0 && book.version.allowNewSections

    setTargetMode(shouldStartInNewSectionMode ? 'new' : 'existing')
    setTargetSectionId(shouldStartInNewSectionMode ? '' : book.version.sections[0]?.id ?? '')
    setNewSectionName('')
    setValues(buildInitialValues(book.version.fields))
    clearSelectedImage()
    setFormErrorMessage('')
  }

  function openModal() {
    setFormErrorMessage('')
    setIsModalOpen(true)
  }

  function closeModal() {
    if (isSubmitting) {
      return
    }

    setIsModalOpen(false)
    setFormErrorMessage('')
    clearSelectedImage()
  }

  async function handleSubmit() {
    if (!selectedBook) {
      return
    }

    const missingField = selectedBook.version.fields.find(
      (field) => field.isRequired && !stripHtml(values[field.id] ?? '').trim(),
    )
    if (missingField) {
      setFormErrorMessage(`${missingField.label} is required.`)
      return
    }

    if (targetMode === 'new' && !newSectionName.trim()) {
      setFormErrorMessage('Please enter the new section name.')
      return
    }

    if (targetMode === 'existing' && typeof targetSectionId !== 'number') {
      setFormErrorMessage('Please choose the section that should receive this page.')
      return
    }

    try {
      setIsSubmitting(true)
      setFormErrorMessage('')
      setSuccessMessage('')

      await booksApi.submitToBook(
        selectedBook.id,
        {
          targetSectionId:
            targetMode === 'existing' && typeof targetSectionId === 'number'
              ? targetSectionId
              : undefined,
          newSectionName: targetMode === 'new' ? newSectionName.trim() : '',
          fieldValues: selectedBook.version.fields.map((field) => ({
            fieldId: field.id,
            value: values[field.id] ?? '',
          })),
        },
        imageFile,
      )

      resetForm(selectedBook)
      setSuccessMessage('Your submission has been sent for review.')
      setIsModalOpen(false)
    } catch (error) {
      setFormErrorMessage(
        error instanceof Error ? error.message : 'Unable to submit this page right now.',
      )
    } finally {
      setIsSubmitting(false)
    }
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
                Every recipe here carries a story — a grandmother's bannock, a feast
                shared after a gathering, the dish that tastes like home. Flip through
                the pages, then add your own family recipe so it can be passed on.
              </p>
              <div className={styles.introActions}>
                <button type="button" className={styles.addButton} onClick={openModal}>
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
            <DocumentFlipbook source={flipbookSource} title={selectedBook.title} />
          </section>

          {isModalOpen ? (
            <div
              className={styles.modalOverlay}
              role="presentation"
              onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                  closeModal()
                }
              }}
            >
              <section
                className={styles.modalPanel}
                role="dialog"
                aria-modal="true"
                aria-label="Add your recipe"
              >
                <div className={styles.modalHeader}>
                  <div className={styles.modalHeading}>
                    <h2>Add your recipe</h2>
                  </div>
                  <button
                    type="button"
                    className={styles.secondaryButton}
                    disabled={isSubmitting}
                    onClick={closeModal}
                  >
                    Close
                  </button>
                </div>

                <div className={styles.modalContent}>
                  {formErrorMessage ? <p className={styles.errorBox}>{formErrorMessage}</p> : null}

                  <div className={styles.formGrid}>
                    <div className={styles.formSidebar}>
                      <section className={`${styles.formCard} ${styles.sidebarIntro}`}>
                        <p className={styles.sidebarLabel}>{selectedBook.title}</p>
                        <h3>Add your recipe</h3>
                        <p className={styles.sidebarText}>
                          Choose where it should go, then add your story and details on the right.
                        </p>
                        <div className={styles.sidebarBadges}>
                          <span className={styles.sidebarBadge}>
                            {selectedBook.version.sections.length} section
                            {selectedBook.version.sections.length === 1 ? '' : 's'}
                          </span>
                          {selectedBook.version.allowNewSections ? (
                            <span className={styles.sidebarBadge}>New section allowed</span>
                          ) : null}
                          {selectedBook.version.allowPageImage ? (
                            <span className={styles.sidebarBadge}>Image optional</span>
                          ) : null}
                        </div>
                      </section>

                      <section className={styles.formCard}>
                        <div className={styles.cardHeader}>
                          <h3>Placement</h3>
                          <p>Choose where this recipe should appear in the book.</p>
                        </div>

                        <div className={styles.toggleRow}>
                          <label className={styles.radioLabel}>
                            <input
                              type="radio"
                              checked={targetMode === 'existing'}
                              onChange={() => setTargetMode('existing')}
                            />
                            <span className={styles.radioText}>
                              <span className={styles.radioTitle}>Existing section</span>
                              <span className={styles.radioHint}>
                                Add it inside a section that already exists in this book.
                              </span>
                            </span>
                          </label>

                          {selectedBook.version.allowNewSections ? (
                            <label className={styles.radioLabel}>
                              <input
                                type="radio"
                                checked={targetMode === 'new'}
                                onChange={() => setTargetMode('new')}
                              />
                              <span className={styles.radioText}>
                                <span className={styles.radioTitle}>New section</span>
                                <span className={styles.radioHint}>
                                  Create a fresh section name for this recipe.
                                </span>
                              </span>
                            </label>
                          ) : null}
                        </div>

                        {targetMode === 'existing' ? (
                          <label className={styles.field}>
                            <span>Choose section</span>
                            <select
                              value={typeof targetSectionId === 'number' ? String(targetSectionId) : ''}
                              onChange={(event) =>
                                setTargetSectionId(
                                  event.target.value ? Number.parseInt(event.target.value, 10) : '',
                                )
                              }
                            >
                              <option value="">Select a section</option>
                              {selectedBook.version.sections.map((section) => (
                                <option key={section.id} value={section.id}>
                                  {section.name}
                                </option>
                              ))}
                            </select>
                          </label>
                        ) : (
                          <label className={styles.field}>
                            <span>New section name</span>
                            <input
                              type="text"
                              value={newSectionName}
                              onChange={(event) => setNewSectionName(event.target.value)}
                            />
                          </label>
                        )}
                      </section>

                      {selectedBook.version.allowPageImage ? (
                        <section className={styles.formCard}>
                          <div className={styles.cardHeader}>
                            <h3>Image</h3>
                            <p>Add a photo if you want this recipe to include an image.</p>
                          </div>

                          <label className={`${styles.field} ${styles.fileField}`}>
                            <span>Optional image</span>
                            <input
                              key={imageInputKey}
                              type="file"
                              accept="image/*"
                              onChange={(event) => setImageFile(event.target.files?.[0] ?? null)}
                            />
                          </label>

                          {imageFile ? (
                            <div className={styles.fileMetaRow}>
                              <span className={styles.fileMetaName}>{imageFile.name}</span>
                              <button
                                type="button"
                                className={styles.secondaryButton}
                                onClick={clearSelectedImage}
                              >
                                Remove image
                              </button>
                            </div>
                          ) : null}
                        </section>
                      ) : null}
                    </div>

                    <div className={styles.formMain}>
                      <section className={styles.formCard}>
                        <div className={styles.cardHeader}>
                          <h3>Your recipe</h3>
                          <p>Write your recipe details here.</p>
                        </div>

                        <div className={styles.dynamicFields}>
                          {selectedBook.version.fields.map((field) => (
                            <DynamicField
                              key={field.id}
                              field={field}
                              value={values[field.id] ?? ''}
                              onChange={(value) =>
                                setValues((current) => ({ ...current, [field.id]: value }))
                              }
                            />
                          ))}
                        </div>
                      </section>
                    </div>
                  </div>
                </div>

                <div className={styles.modalActions}>
                  <button
                    type="button"
                    className={styles.secondaryButton}
                    disabled={isSubmitting}
                    onClick={closeModal}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className={styles.submitButton}
                    disabled={isSubmitting}
                    onClick={() => void handleSubmit()}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit'}
                  </button>
                </div>
              </section>
            </div>
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

function buildInitialValues(fields: PublicBookField[]) {
  return Object.fromEntries(fields.map((field) => [field.id, '']))
}

function DynamicField({
  field,
  value,
  onChange,
}: {
  field: PublicBookField
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className={styles.field}>
      <span>
        {field.label}
        {field.isRequired ? ' *' : ''}
      </span>
      {field.inputType === 'rich_text' ? (
        <RichTextEditor
          label={field.label}
          value={value}
          onChange={onChange}
          placeholder={`Write ${field.label.toLowerCase()} here...`}
        />
      ) : (
        <input type="text" value={value} onChange={(event) => onChange(event.target.value)} />
      )}
    </div>
  )
}

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, ' ')
}
