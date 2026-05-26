import { useEffect, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import styles from './DocumentViewerModal.module.css'

type DocumentViewerModalProps = {
  title: string
  previewUrl: string
  mimeType: string
  onClose: () => void
  controls?: ReactNode
}

export function DocumentViewerModal({
  title,
  previewUrl,
  mimeType,
  onClose,
  controls,
}: DocumentViewerModalProps) {
  const { t } = useTranslation()

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  return (
    <div
      className={styles.viewerOverlay}
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose()
        }
      }}
    >
      <section className={styles.viewerPanel} role="dialog" aria-modal="true" aria-label={title}>
        <div className={styles.viewerHeader}>
          <strong>{title}</strong>
          <button type="button" onClick={onClose}>
            {t('common.close')}
          </button>
        </div>

        <div className={styles.viewerStage}>
          {isImageDocument(mimeType) ? (
            <img src={previewUrl} alt={title} />
          ) : (
            <iframe title={title} src={previewUrl} />
          )}
        </div>

        {controls ? <div className={styles.viewerControls}>{controls}</div> : null}
      </section>
    </div>
  )
}

function isImageDocument(mimeType: string) {
  return mimeType.toLowerCase().startsWith('image/')
}
