import { useEffect, useMemo, useState } from 'react'
import { booksApi, type PublicBookDetail, type PublicBookField, type PublicBookSummary } from '../api/booksApi'
import { DocumentFlipbook } from '../components/flipbook/DocumentFlipbook'
import { SimpleRichTextInput } from '../components/books/SimpleRichTextInput'
import styles from './BooksTestPage.module.css'

type SubmissionValuesState = Record<number, string>

export function BooksTestPage() {
  const [books, setBooks] = useState<PublicBookSummary[]>([])
  const [selectedBookId, setSelectedBookId] = useState<number | null>(null)
  const [selectedBook, setSelectedBook] = useState<PublicBookDetail | null>(null)
  const [values, setValues] = useState<SubmissionValuesState>({})
  const [targetMode, setTargetMode] = useState<'existing' | 'new'>('existing')
  const [targetSectionId, setTargetSectionId] = useState<number | ''>('')
  const [newSectionName, setNewSectionName] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    void (async () => {
      try {
        setIsLoading(true)
        const response = await booksApi.listPublicBooks()
        setBooks(response)
        setSelectedBookId(response[0]?.id ?? null)
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : 'Unable to load books.')
      } finally {
        setIsLoading(false)
      }
    })()
  }, [])

  useEffect(() => {
    if (!selectedBookId) {
      setSelectedBook(null)
      return
    }

    void (async () => {
      try {
        setErrorMessage('')
        const detail = await booksApi.getPublicBook(selectedBookId)
        setSelectedBook(detail)
        setTargetSectionId(detail.version.sections[0]?.id ?? '')
        setTargetMode('existing')
        setNewSectionName('')
        setValues(Object.fromEntries(detail.version.fields.map((field) => [field.id, ''])))
        setImageFile(null)
        setSuccessMessage('')
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : 'Unable to load the selected book.')
      }
    })()
  }, [selectedBookId])

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

  async function handleSubmit() {
    if (!selectedBook) {
      return
    }

    const missingField = selectedBook.version.fields.find(
      (field) => field.isRequired && !stripHtml(values[field.id] ?? '').trim(),
    )
    if (missingField) {
      setErrorMessage(`${missingField.label} is required.`)
      return
    }

    if (targetMode === 'new' && !newSectionName.trim()) {
      setErrorMessage('Please enter the new section name.')
      return
    }

    if (targetMode === 'existing' && typeof targetSectionId !== 'number') {
      setErrorMessage('Please choose the section that should receive this page.')
      return
    }

    try {
      setIsSubmitting(true)
      setErrorMessage('')
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

      setSuccessMessage(
        'Your page has been submitted for review. An editor can adjust it before it is approved and added to the book.',
      )
      setValues(Object.fromEntries(selectedBook.version.fields.map((field) => [field.id, ''])))
      setImageFile(null)
      setNewSectionName('')
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to submit this page right now.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <span className={styles.eyebrow}>Book Test Page</span>
          <h1>Active book viewing and survivor submissions</h1>
          <p>
            This route is wired to the public book API. It reads the active version, renders
            the current PDF in a flipbook, and sends configurable section requests back to the CMS review queue.
          </p>
        </div>

        <div className={styles.selectorCard}>
          <label className={styles.selectorField}>
            <span>Select a book</span>
            <select
              value={selectedBookId ?? ''}
              onChange={(event) => setSelectedBookId(Number.parseInt(event.target.value, 10))}
            >
              {books.map((book) => (
                <option key={book.id} value={book.id}>
                  {book.title}
                </option>
              ))}
            </select>
          </label>

          {selectedBook ? (
            <div className={styles.selectorMeta}>
              <strong>{selectedBook.title}</strong>
              <p>{selectedBook.description}</p>
              <span>Version {selectedBook.version.versionNumber}</span>
            </div>
          ) : null}
        </div>
      </section>

      {isLoading ? (
        <section className={styles.placeholderCard}>
          <p>Loading books...</p>
        </section>
      ) : errorMessage ? (
        <section className={styles.messageCard}>
          <p>{errorMessage}</p>
        </section>
      ) : selectedBook && flipbookSource ? (
        <div className={styles.layout}>
          <section className={styles.viewerCard}>
            <div className={styles.viewerHeader}>
              <div>
                <h2>{selectedBook.title}</h2>
                <p>The website only exposes the active version.</p>
              </div>
              <a
                className={styles.downloadLink}
                href={flipbookSource.url}
                target="_blank"
                rel="noreferrer"
              >
                Open PDF
              </a>
            </div>

            <DocumentFlipbook source={flipbookSource} title={selectedBook.title} />
          </section>

          <section className={styles.formCard}>
            <div className={styles.formHeader}>
              <h2>Request a page addition</h2>
              <p>
                Pick an existing section or request a new section at the end of the book.
                Your submission goes to the CMS for editing and approval before it becomes public.
              </p>
            </div>

            {successMessage ? (
              <div className={styles.successBox}>{successMessage}</div>
            ) : null}

            <div className={styles.toggleRow}>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  checked={targetMode === 'existing'}
                  onChange={() => setTargetMode('existing')}
                />
                Existing section
              </label>

              {selectedBook.version.allowNewSections ? (
                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    checked={targetMode === 'new'}
                    onChange={() => setTargetMode('new')}
                  />
                  New section
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

            {selectedBook.version.allowPageImage ? (
              <label className={styles.field}>
                <span>Optional image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => setImageFile(event.target.files?.[0] ?? null)}
                />
              </label>
            ) : null}

            <button
              type="button"
              className={styles.submitButton}
              disabled={isSubmitting}
              onClick={() => void handleSubmit()}
            >
              {isSubmitting ? 'Submitting...' : 'Submit for Review'}
            </button>
          </section>
        </div>
      ) : (
        <section className={styles.placeholderCard}>
          <p>No public book is active yet.</p>
        </section>
      )}
    </main>
  )
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
        <SimpleRichTextInput
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
