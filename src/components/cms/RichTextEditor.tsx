import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from 'react'
import { useTranslation } from 'react-i18next'
import styles from './RichTextEditor.module.css'

type RichTextEditorProps = {
  value: string
  onChange: (html: string) => void
  label?: string
  placeholder?: string
  disabled?: boolean
  className?: string
  allowImages?: boolean
}

const FONT_SIZE_OPTIONS = [
  { value: '', label: 'Default' },
  { value: '8pt', label: '8' },
  { value: '9pt', label: '9' },
  { value: '10pt', label: '10' },
  { value: '11pt', label: '11' },
  { value: '12pt', label: '12' },
  { value: '14pt', label: '14' },
  { value: '16pt', label: '16' },
  { value: '18pt', label: '18' },
  { value: '20pt', label: '20' },
  { value: '22pt', label: '22' },
  { value: '24pt', label: '24' },
  { value: '26pt', label: '26' },
  { value: '28pt', label: '28' },
  { value: '32pt', label: '32' },
  { value: '36pt', label: '36' },
  { value: '40pt', label: '40' },
  { value: '44pt', label: '44' },
  { value: '48pt', label: '48' },
  { value: '54pt', label: '54' },
  { value: '60pt', label: '60' },
  { value: '66pt', label: '66' },
  { value: '72pt', label: '72' },
] as const

type FormatState = {
  bold: boolean
  italic: boolean
  underline: boolean
  bulletList: boolean
  orderedList: boolean
  link: boolean
  quote: boolean
  fontSize: string
}

const DEFAULT_FORMAT_STATE: FormatState = {
  bold: false,
  italic: false,
  underline: false,
  bulletList: false,
  orderedList: false,
  link: false,
  quote: false,
  fontSize: '',
}

export function createRichTextEditorExtensions() {
  return []
}

export function RichTextEditor({
  value,
  onChange,
  label,
  placeholder,
  disabled = false,
  className,
}: RichTextEditorProps) {
  const { t } = useTranslation()
  const editorRef = useRef<HTMLDivElement | null>(null)
  const savedRangeRef = useRef<Range | null>(null)
  const [isFocused, setIsFocused] = useState(false)
  const [isLinkEditorOpen, setIsLinkEditorOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [formatState, setFormatState] = useState<FormatState>(DEFAULT_FORMAT_STATE)
  const resolvedPlaceholder = placeholder ?? t('richText.placeholder')

  useEffect(() => {
    const editor = editorRef.current
    if (!editor) {
      return
    }

    if (editor.innerHTML !== value) {
      editor.innerHTML = value
    }

    syncEditorState()
  }, [value])

  useEffect(() => {
    function handleSelectionChange() {
      if (isSelectionInsideEditor(editorRef.current)) {
        captureSelection()
        syncFormatState()
      }
    }

    document.addEventListener('selectionchange', handleSelectionChange)
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange)
    }
  }, [])

  function syncEditorState() {
    syncEmptyState()
    syncFormatState()
  }

  function syncEmptyState() {
    const editor = editorRef.current
    if (!editor) {
      return
    }

    editor.dataset.empty = stripHtml(editor.innerHTML).trim() ? 'false' : 'true'
  }

  function syncFormatState() {
    const editor = editorRef.current
    if (!editor || !isSelectionInsideEditor(editor)) {
      setFormatState((current) => ({
        ...current,
        fontSize: findCurrentFontSize(editorRef.current),
        link: Boolean(findClosestTagFromCurrentSelection(editorRef.current, 'A')),
        quote: Boolean(findClosestTagFromCurrentSelection(editorRef.current, 'BLOCKQUOTE')),
      }))
      return
    }

    setFormatState({
      bold: queryCommandState('bold'),
      italic: queryCommandState('italic'),
      underline: queryCommandState('underline'),
      bulletList: queryCommandState('insertUnorderedList'),
      orderedList: queryCommandState('insertOrderedList'),
      link: Boolean(findClosestTagFromCurrentSelection(editor, 'A')),
      quote: Boolean(findClosestTagFromCurrentSelection(editor, 'BLOCKQUOTE')),
      fontSize: findCurrentFontSize(editor),
    })
  }

  function captureSelection() {
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) {
      return
    }

    const editor = editorRef.current
    const range = selection.getRangeAt(0)
    if (!editor || !editor.contains(range.commonAncestorContainer)) {
      return
    }

    savedRangeRef.current = range.cloneRange()
  }

  function restoreSelection() {
    const selection = window.getSelection()
    if (!selection || !savedRangeRef.current) {
      return
    }

    selection.removeAllRanges()
    selection.addRange(savedRangeRef.current)
  }

  function focusEditor() {
    editorRef.current?.focus()
    restoreSelection()
  }

  function emitChange() {
    const editor = editorRef.current
    if (!editor) {
      return
    }

    syncEditorState()
    captureSelection()
    onChange(editor.innerHTML)
  }

  function runCommand(command: string, commandValue?: string) {
    if (disabled) {
      return
    }

    focusEditor()
    document.execCommand('styleWithCSS', false, 'true')
    document.execCommand(command, false, commandValue)
    emitChange()
  }

  function handleEditorInput() {
    emitChange()
  }

  function handleToggleLinkEditor() {
    if (disabled) {
      return
    }

    captureSelection()
    setLinkUrl(findCurrentLinkUrl(editorRef.current) ?? '')
    setIsLinkEditorOpen((current) => !current)
  }

  function handleApplyLink(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (disabled) {
      return
    }

    focusEditor()
    const trimmedUrl = linkUrl.trim()

    if (!trimmedUrl) {
      document.execCommand('unlink')
    } else {
      const selection = window.getSelection()
      const hasSelection = selection && !selection.isCollapsed

      if (hasSelection) {
        document.execCommand('createLink', false, trimmedUrl)
      } else {
        document.execCommand(
          'insertHTML',
          false,
          `<a href="${escapeAttribute(trimmedUrl)}">${escapeHtml(trimmedUrl)}</a>`,
        )
      }
    }

    setIsLinkEditorOpen(false)
    emitChange()
  }

  function handleRemoveLink() {
    if (disabled) {
      return
    }

    focusEditor()
    document.execCommand('unlink')
    setLinkUrl('')
    setIsLinkEditorOpen(false)
    emitChange()
  }

  function handleSelectFontSize(fontSize: string) {
    if (disabled) {
      return
    }

    focusEditor()

    if (!fontSize) {
      document.execCommand('removeFormat')
      emitChange()
      return
    }

    document.execCommand('styleWithCSS', false, 'true')
    document.execCommand('fontSize', false, '7')
    normalizeLegacyFontTags(editorRef.current, fontSize)
    emitChange()
  }

  const classes = [
    styles.wrapper,
    isFocused ? styles.focused : '',
    disabled ? styles.disabled : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={classes}>
      <div className={styles.toolbar} role="toolbar" aria-label={t('richText.toolbar')}>
        <div className={styles.toolbarGroup}>
          <ToolbarButton
            label={t('richText.bold')}
            isActive={formatState.bold}
            disabled={disabled}
            onClick={() => runCommand('bold')}
          >
            <strong>B</strong>
          </ToolbarButton>
          <ToolbarButton
            label={t('richText.italic')}
            isActive={formatState.italic}
            disabled={disabled}
            onClick={() => runCommand('italic')}
          >
            <span className={styles.italic}>I</span>
          </ToolbarButton>
          <ToolbarButton
            label={t('richText.underline')}
            isActive={formatState.underline}
            disabled={disabled}
            onClick={() => runCommand('underline')}
          >
            <span className={styles.underline}>U</span>
          </ToolbarButton>
        </div>

        <div className={styles.toolbarGroup}>
          <ToolbarButton
            label={t('richText.bulletList')}
            isActive={formatState.bulletList}
            disabled={disabled}
            onClick={() => runCommand('insertUnorderedList')}
          >
            <BulletListIcon />
          </ToolbarButton>
          <ToolbarButton
            label={t('richText.orderedList')}
            isActive={formatState.orderedList}
            disabled={disabled}
            onClick={() => runCommand('insertOrderedList')}
          >
            <OrderedListIcon />
          </ToolbarButton>
        </div>

        <div className={styles.toolbarGroup}>
          <ToolbarButton
            label={t('richText.link')}
            isActive={formatState.link || isLinkEditorOpen}
            disabled={disabled}
            onClick={handleToggleLinkEditor}
          >
            <LinkIcon />
          </ToolbarButton>
          <ToolbarButton
            label={t('richText.quote')}
            isActive={formatState.quote}
            disabled={disabled}
            onClick={() => runCommand('formatBlock', 'blockquote')}
          >
            <QuoteIcon />
          </ToolbarButton>
        </div>

        <div className={styles.toolbarGroup}>
          <FontSizeSelector
            currentSize={formatState.fontSize}
            disabled={disabled}
            onSelectSize={handleSelectFontSize}
            t={t}
          />
        </div>
      </div>

      {isLinkEditorOpen ? (
        <form className={styles.linkEditor} onSubmit={handleApplyLink}>
          <label className={styles.linkField}>
            <span>{t('richText.linkUrl')}</span>
            <input
              type="url"
              value={linkUrl}
              disabled={disabled}
              placeholder={t('richText.linkUrlPlaceholder')}
              onChange={(event) => setLinkUrl(event.target.value)}
            />
          </label>
          <div className={styles.linkActions}>
            <button type="submit" className={styles.linkActionButton} disabled={disabled}>
              {t('richText.applyLink')}
            </button>
            <button
              type="button"
              className={styles.linkActionButtonSecondary}
              disabled={disabled}
              onClick={handleRemoveLink}
            >
              {t('richText.removeLink')}
            </button>
          </div>
        </form>
      ) : null}

      <div
        ref={editorRef}
        className={styles.editor}
        contentEditable={!disabled}
        suppressContentEditableWarning
        role="textbox"
        aria-label={label ?? resolvedPlaceholder}
        aria-multiline="true"
        data-placeholder={resolvedPlaceholder}
        data-empty="true"
        onFocus={() => {
          setIsFocused(true)
          captureSelection()
          syncFormatState()
        }}
        onBlur={() => {
          setIsFocused(false)
        }}
        onInput={handleEditorInput}
        onMouseUp={() => {
          captureSelection()
          syncFormatState()
        }}
        onKeyUp={() => {
          captureSelection()
          syncFormatState()
        }}
      />
    </div>
  )
}

type ToolbarButtonProps = {
  label: string
  isActive: boolean
  disabled: boolean
  onClick: () => void
  children: ReactNode
}

function ToolbarButton({
  label,
  isActive,
  disabled,
  onClick,
  children,
}: ToolbarButtonProps) {
  const didHandleMouseDownRef = useRef(false)

  function handleMouseDown(event: ReactMouseEvent<HTMLButtonElement>) {
    if (event.button !== 0 || disabled) {
      return
    }

    event.preventDefault()
    didHandleMouseDownRef.current = true
    onClick()
  }

  function handleClick(event: ReactMouseEvent<HTMLButtonElement>) {
    if (didHandleMouseDownRef.current) {
      didHandleMouseDownRef.current = false
      return
    }

    event.preventDefault()
    if (!disabled) {
      onClick()
    }
  }

  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={isActive}
      title={label}
      disabled={disabled}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      className={[styles.toolbarButton, isActive ? styles.toolbarButtonActive : '']
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </button>
  )
}

type FontSizeSelectorProps = {
  currentSize: string
  disabled: boolean
  onSelectSize: (value: string) => void
  t: ReturnType<typeof useTranslation>['t']
}

function FontSizeSelector({
  currentSize,
  disabled,
  onSelectSize,
  t,
}: FontSizeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const displaySize = currentSize || t('richText.fontSizeDefault')

  return (
    <div className={styles.fontSizeContainer}>
      <button
        type="button"
        aria-label={t('richText.fontSize')}
        disabled={disabled}
        onClick={() => setIsOpen((current) => !current)}
        className={styles.fontSizeButton}
        title={`${t('richText.fontSize')}: ${displaySize}`}
      >
        <span className={styles.fontSizeDisplay}>{displaySize}</span>
        <svg
          viewBox="0 0 12 8"
          width="10"
          height="8"
          className={styles.fontSizeDropdownIcon}
          aria-hidden="true"
        >
          <path
            d="M1 1l5 5 5-5"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {isOpen ? (
        <div className={styles.fontSizeDropdown}>
          {FONT_SIZE_OPTIONS.map(({ value, label }) => (
            <button
              key={value || 'default'}
              type="button"
              className={[
                styles.fontSizeOption,
                currentSize === value ? styles.fontSizeOptionActive : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => {
                onSelectSize(value)
                setIsOpen(false)
              }}
              title={label}
            >
              <span className={styles.fontSizeOptionLabel}>{label}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}

function queryCommandState(command: string) {
  try {
    return document.queryCommandState(command)
  } catch {
    return false
  }
}

function isSelectionInsideEditor(editor: HTMLDivElement | null) {
  const selection = window.getSelection()
  if (!editor || !selection || selection.rangeCount === 0) {
    return false
  }

  return editor.contains(selection.getRangeAt(0).commonAncestorContainer)
}

function findClosestTagFromCurrentSelection(editor: HTMLDivElement | null, tagName: string) {
  const selection = window.getSelection()
  if (!editor || !selection || selection.rangeCount === 0) {
    return null
  }

  let node: Node | null = selection.anchorNode
  while (node && node !== editor) {
    if (node instanceof HTMLElement && node.tagName === tagName) {
      return node
    }

    node = node.parentNode
  }

  return null
}

function findCurrentLinkUrl(editor: HTMLDivElement | null) {
  const link = findClosestTagFromCurrentSelection(editor, 'A')
  return link instanceof HTMLAnchorElement ? link.getAttribute('href') ?? '' : ''
}

function findCurrentFontSize(editor: HTMLDivElement | null) {
  const selection = window.getSelection()
  if (!editor || !selection || selection.rangeCount === 0) {
    return ''
  }

  let node: Node | null = selection.anchorNode
  while (node && node !== editor) {
    if (node instanceof HTMLElement && node.style.fontSize) {
      return node.style.fontSize
    }

    node = node.parentNode
  }

  return ''
}

function normalizeLegacyFontTags(editor: HTMLDivElement | null, fontSize: string) {
  if (!editor) {
    return
  }

  editor.querySelectorAll('font[size]').forEach((fontNode) => {
    const span = document.createElement('span')
    span.style.fontSize = fontSize
    span.innerHTML = fontNode.innerHTML
    fontNode.replaceWith(span)
  })
}

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/gi, ' ')
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function escapeAttribute(value: string) {
  return escapeHtml(value)
}

function BulletListIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" aria-hidden="true">
      <circle cx="2.5" cy="4" r="1" fill="currentColor" />
      <circle cx="2.5" cy="8" r="1" fill="currentColor" />
      <circle cx="2.5" cy="12" r="1" fill="currentColor" />
      <path
        d="M5.5 4h8M5.5 8h8M5.5 12h8"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  )
}

function OrderedListIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" aria-hidden="true">
      <text x="1" y="6" fontSize="5" fill="currentColor" fontWeight="700">
        1
      </text>
      <text x="1" y="11" fontSize="5" fill="currentColor" fontWeight="700">
        2
      </text>
      <text x="1" y="16" fontSize="5" fill="currentColor" fontWeight="700">
        3
      </text>
      <path
        d="M6 4h8M6 9h8M6 14h8"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  )
}

function LinkIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" aria-hidden="true">
      <path
        d="M6.5 9.5a3 3 0 0 0 4.24 0l1.76-1.76a3 3 0 0 0-4.24-4.24l-1 1M9.5 6.5a3 3 0 0 0-4.24 0L3.5 8.26a3 3 0 0 0 4.24 4.24l1-1"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function QuoteIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" aria-hidden="true">
      <path
        d="M4 5c-1.2 0-2 .9-2 2 0 1.2.8 2 2 2 .4 0 .6-.1.6-.1-.1 1-.7 1.7-1.6 2l.6 1c1.8-.5 2.9-2 2.9-4 0-1.7-.9-2.9-2.5-2.9Zm6.5 0c-1.2 0-2 .9-2 2 0 1.2.8 2 2 2 .4 0 .6-.1.6-.1-.1 1-.7 1.7-1.6 2l.6 1c1.8-.5 2.9-2 2.9-4 0-1.7-.9-2.9-2.5-2.9Z"
        fill="currentColor"
      />
    </svg>
  )
}
