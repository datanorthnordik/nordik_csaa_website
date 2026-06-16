import { useEffect, useMemo, useRef } from 'react'
import styles from './SimpleRichTextInput.module.css'

type SimpleRichTextInputProps = {
  label: string
  value: string
  placeholder?: string
  onChange: (html: string) => void
}

const ACTIONS = [
  { command: 'bold', label: 'Bold', icon: 'B' },
  { command: 'italic', label: 'Italic', icon: 'I' },
  { command: 'underline', label: 'Underline', icon: 'U' },
  { command: 'insertUnorderedList', label: 'Bullets', icon: '•' },
] as const

export function SimpleRichTextInput({
  label,
  value,
  placeholder,
  onChange,
}: SimpleRichTextInputProps) {
  const editorRef = useRef<HTMLDivElement | null>(null)
  const describedPlaceholder = useMemo(
    () => placeholder?.trim() || `Write ${label.toLowerCase()} here...`,
    [label, placeholder],
  )

  useEffect(() => {
    const editor = editorRef.current
    if (!editor) {
      return
    }
    if (editor.innerHTML !== value) {
      editor.innerHTML = value
    }
  }, [value])

  function runCommand(command: string) {
    editorRef.current?.focus()
    document.execCommand(command)
    onChange(editorRef.current?.innerHTML ?? '')
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.toolbar} role="toolbar" aria-label={`${label} formatting`}>
        {ACTIONS.map((action) => (
          <button
            key={action.command}
            type="button"
            className={styles.toolbarButton}
            onClick={() => runCommand(action.command)}
          >
            {action.icon}
          </button>
        ))}
      </div>

      <div
        ref={editorRef}
        className={styles.editor}
        contentEditable
        data-placeholder={describedPlaceholder}
        suppressContentEditableWarning
        onInput={() => onChange(editorRef.current?.innerHTML ?? '')}
      />
    </div>
  )
}
