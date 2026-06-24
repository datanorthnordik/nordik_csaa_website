import { useEffect, useMemo, useState } from 'react'
import {
  booksApi,
  type PublicBookDetail,
  type PublicBookField,
  type PublicBookSection,
} from '../api/booksApi'
import { RichTextEditor } from '../components/cms/RichTextEditor'
import styles from './RecipeWizard.module.css'

type RecipeWizardProps = {
  book: PublicBookDetail
  onClose: () => void
  onSubmitted: (message: string) => void
}

type WizardStep = 'intro' | 'meal' | 'details'

const STEP_ORDER: WizardStep[] = ['intro', 'meal', 'details']

/** Pick a tile illustration for a section based on its name. */
const TILE_FALLBACKS = ['/cookbook/recipe/dinner1.png', '/cookbook/recipe/dinner2.png']

function pickTileImage(name: string, index: number) {
  const value = name.toLowerCase()
  if (/soup|stew|broth|chowder/.test(value)) return '/cookbook/recipe/soups.png'
  if (/dessert|sweet|cake|bake|pie|cookie/.test(value)) return '/cookbook/recipe/dessert.png'
  if (/bread|bannock|loaf|bun/.test(value)) return '/cookbook/recipe/bannock.png'
  if (/salad|side|veg|greens/.test(value)) return '/cookbook/recipe/new-recipe.png'
  if (/dinner|main|supper|feast|entr/.test(value)) return '/cookbook/recipe/dinner1.png'
  return TILE_FALLBACKS[index % TILE_FALLBACKS.length]
}

export function RecipeWizard({ book, onClose, onSubmitted }: RecipeWizardProps) {
  const sections = book.version.sections
  const startInNewMode = sections.length === 0 && book.version.allowNewSections

  const [step, setStep] = useState<WizardStep>('intro')
  const [targetMode, setTargetMode] = useState<'existing' | 'new'>(
    startInNewMode ? 'new' : 'existing',
  )
  const [targetSectionId, setTargetSectionId] = useState<number | ''>(
    startInNewMode ? '' : sections[0]?.id ?? '',
  )
  const [newSectionName, setNewSectionName] = useState('')
  const [values, setValues] = useState<Record<number, string>>(() =>
    buildInitialValues(book.version.fields),
  )
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imageInputKey, setImageInputKey] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  const stepIndex = STEP_ORDER.indexOf(step)

  // Lock body scroll + close on Escape while the wizard is open.
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && !isSubmitting) {
        onClose()
      }
    }

    const previousBodyOverflow = document.body.style.overflow
    const previousHtmlOverflow = document.documentElement.style.overflow
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousBodyOverflow
      document.documentElement.style.overflow = previousHtmlOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isSubmitting, onClose])

  const mealIsValid = useMemo(() => {
    if (targetMode === 'new') {
      return newSectionName.trim().length > 0
    }
    return typeof targetSectionId === 'number'
  }, [targetMode, targetSectionId, newSectionName])

  function clearSelectedImage() {
    setImageFile(null)
    setImageInputKey((current) => current + 1)
  }

  function goNext() {
    setFormError('')
    if (step === 'meal' && !mealIsValid) {
      setFormError('Choose what you are cooking, or add your own to continue.')
      return
    }
    const next = STEP_ORDER[Math.min(stepIndex + 1, STEP_ORDER.length - 1)]
    setStep(next)
  }

  function goBack() {
    setFormError('')
    setStep(STEP_ORDER[Math.max(stepIndex - 1, 0)])
  }

  async function handleSubmit() {
    const missingField = book.version.fields.find(
      (field) => field.isRequired && !stripHtml(values[field.id] ?? '').trim(),
    )
    if (missingField) {
      setFormError(`${missingField.label} is required.`)
      return
    }

    try {
      setIsSubmitting(true)
      setFormError('')

      await booksApi.submitToBook(
        book.id,
        {
          targetSectionId:
            targetMode === 'existing' && typeof targetSectionId === 'number'
              ? targetSectionId
              : undefined,
          newSectionName: targetMode === 'new' ? newSectionName.trim() : '',
          fieldValues: book.version.fields.map((field) => ({
            fieldId: field.id,
            value: values[field.id] ?? '',
          })),
        },
        imageFile,
      )

      onSubmitted('Your recipe has been sent for review. Thank you for sharing.')
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : 'Unable to submit your recipe right now.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      className={styles.overlay}
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSubmitting) {
          onClose()
        }
      }}
    >
      <section
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-label="Add your recipe"
      >
        <header className={styles.head}>
          <div className={styles.progress} aria-hidden="true">
            {STEP_ORDER.map((value, index) => (
              <span
                key={value}
                className={`${styles.dot} ${index <= stepIndex ? styles.dotActive : ''}`}
              />
            ))}
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close"
          >
            ✕
          </button>
        </header>

        <div className={styles.body}>
          {/* key={step} re-mounts the content so each step fades in */}
          <div key={step} className={styles.stepFade}>
            {step === 'intro' ? (
              <IntroStep title={book.title} />
            ) : step === 'meal' ? (
              <MealStep
                sections={sections}
                allowNewSections={book.version.allowNewSections}
                targetMode={targetMode}
                targetSectionId={targetSectionId}
                newSectionName={newSectionName}
                onChooseSection={(id) => {
                  setTargetMode('existing')
                  setTargetSectionId(id)
                  setFormError('')
                }}
                onChooseNew={() => {
                  setTargetMode('new')
                  setFormError('')
                }}
                onNewNameChange={setNewSectionName}
              />
            ) : (
              <DetailsStep
                fields={book.version.fields}
                values={values}
                onValueChange={(id, value) =>
                  setValues((current) => ({ ...current, [id]: value }))
                }
                allowPageImage={book.version.allowPageImage}
                imageFile={imageFile}
                imageInputKey={imageInputKey}
                onImageChange={setImageFile}
                onImageClear={clearSelectedImage}
              />
            )}
          </div>
        </div>

        {formError ? <p className={styles.errorBox}>{formError}</p> : null}

        <footer className={styles.foot}>
          {step === 'intro' ? (
            <button type="button" className={styles.ghostBtn} onClick={onClose}>
              Maybe later
            </button>
          ) : (
            <button
              type="button"
              className={styles.ghostBtn}
              onClick={goBack}
              disabled={isSubmitting}
            >
              Back
            </button>
          )}

          {step === 'details' ? (
            <button
              type="button"
              className={styles.primaryBtn}
              onClick={() => void handleSubmit()}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Sharing…' : 'Share recipe'}
            </button>
          ) : (
            <button type="button" className={styles.primaryBtn} onClick={goNext}>
              {step === 'intro' ? 'Get started' : 'Continue'}
            </button>
          )}
        </footer>
      </section>
    </div>
  )
}

function IntroStep({ title }: { title: string }) {
  return (
    <div className={styles.intro}>
      <img
        src="/cookbook/recipe/new-recipe.png"
        alt=""
        aria-hidden="true"
        className={styles.introArt}
      />
      <p className={styles.eyebrow}>{title}</p>
      <h2 className={styles.stepTitle}>Add your recipe</h2>
      <p className={styles.stepLead}>
        Share a dish that means something to you, a recipe handed down, a comfort
        food, or a feast you love to make. It only takes a few minutes.
      </p>
      <div className={styles.tipBox}>
        <span className={styles.tipLabel}>A small tip</span>
        <p>
          Write it the way you'd tell a friend. Little notes like who taught you,
          when you make it, and what to watch for are what make a recipe come alive.
        </p>
      </div>
    </div>
  )
}

function MealStep({
  sections,
  allowNewSections,
  targetMode,
  targetSectionId,
  newSectionName,
  onChooseSection,
  onChooseNew,
  onNewNameChange,
}: {
  sections: PublicBookSection[]
  allowNewSections: boolean
  targetMode: 'existing' | 'new'
  targetSectionId: number | ''
  newSectionName: string
  onChooseSection: (id: number) => void
  onChooseNew: () => void
  onNewNameChange: (value: string) => void
}) {
  return (
    <div className={styles.meal}>
      <h2 className={styles.stepTitle}>What are you cooking?</h2>
      <p className={styles.stepLead}>
        Pick where your recipe belongs in the book, or add your own.
      </p>

      <div className={styles.tileGrid}>
        {sections.map((section, index) => {
          const isActive = targetMode === 'existing' && targetSectionId === section.id
          return (
            <button
              key={section.id}
              type="button"
              className={`${styles.tile} ${isActive ? styles.tileActive : ''}`}
              onClick={() => onChooseSection(section.id)}
              aria-pressed={isActive}
            >
              <span className={styles.tileImgWrap}>
                <img
                  src={pickTileImage(section.name, index)}
                  alt=""
                  className={styles.tileImg}
                  loading="lazy"
                />
              </span>
              <span className={styles.tileLabel}>{section.name}</span>
            </button>
          )
        })}

        {allowNewSections ? (
          <button
            type="button"
            className={`${styles.tile} ${styles.tileAddOwn} ${
              targetMode === 'new' ? styles.tileActive : ''
            }`}
            onClick={onChooseNew}
            aria-pressed={targetMode === 'new'}
          >
            <span className={styles.tileImgWrap}>
              <img
                src="/cookbook/recipe/new-recipe.png"
                alt=""
                className={styles.tileImg}
                loading="lazy"
              />
              <span className={styles.tilePlus} aria-hidden="true">
                +
              </span>
            </span>
            <span className={styles.tileLabel}>Add your own</span>
          </button>
        ) : null}
      </div>

      {targetMode === 'new' && allowNewSections ? (
        <label className={styles.newNameField}>
          <span>Name your section</span>
          <input
            type="text"
            value={newSectionName}
            onChange={(event) => onNewNameChange(event.target.value)}
            placeholder="e.g. Sunday breakfasts, Aunties' soups…"
            autoFocus
          />
        </label>
      ) : null}
    </div>
  )
}

function DetailsStep({
  fields,
  values,
  onValueChange,
  allowPageImage,
  imageFile,
  imageInputKey,
  onImageChange,
  onImageClear,
}: {
  fields: PublicBookField[]
  values: Record<number, string>
  onValueChange: (id: number, value: string) => void
  allowPageImage: boolean
  imageFile: File | null
  imageInputKey: number
  onImageChange: (file: File | null) => void
  onImageClear: () => void
}) {
  return (
    <div className={styles.details}>
      <h2 className={styles.stepTitle}>Tell us about it</h2>
      <p className={styles.stepLead}>Add your recipe details below.</p>

      <div className={styles.fields}>
        {fields.map((field) => (
          <div key={field.id} className={styles.field}>
            <span className={styles.fieldLabel}>
              {field.label}
              {field.isRequired ? ' *' : ''}
            </span>
            {field.inputType === 'rich_text' ? (
              <RichTextEditor
                label={field.label}
                value={values[field.id] ?? ''}
                onChange={(value) => onValueChange(field.id, value)}
                placeholder={`Write ${field.label.toLowerCase()} here…`}
              />
            ) : (
              <input
                type="text"
                value={values[field.id] ?? ''}
                onChange={(event) => onValueChange(field.id, event.target.value)}
              />
            )}
          </div>
        ))}

        {allowPageImage ? (
          <div className={`${styles.field} ${styles.fileField}`}>
            <span className={styles.fieldLabel}>Add a photo (optional)</span>
            <input
              key={imageInputKey}
              type="file"
              accept="image/*"
              onChange={(event) => onImageChange(event.target.files?.[0] ?? null)}
            />
            {imageFile ? (
              <div className={styles.fileMetaRow}>
                <span className={styles.fileMetaName}>{imageFile.name}</span>
                <button type="button" className={styles.ghostBtn} onClick={onImageClear}>
                  Remove
                </button>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  )
}

function buildInitialValues(fields: PublicBookField[]) {
  return Object.fromEntries(fields.map((field) => [field.id, '']))
}

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, ' ')
}
