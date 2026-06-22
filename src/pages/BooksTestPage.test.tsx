import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { booksApi } from '../api/booksApi'
import { BooksTestPage } from './BooksTestPage'

vi.mock('../api/booksApi', () => ({
  booksApi: {
    listPublicBooks: vi.fn(),
    getPublicBook: vi.fn(),
    submitToBook: vi.fn(),
    resolveContentUrl: vi.fn((value: string) => value),
  },
}))

vi.mock('../components/flipbook/DocumentFlipbook', () => ({
  DocumentFlipbook: ({ title }: { title: string }) => <div>Flipbook for {title}</div>,
}))

vi.mock('../components/cms/RichTextEditor', () => ({
  RichTextEditor: ({
    label,
    value,
    onChange,
  }: {
    label: string
    value: string
    onChange: (value: string) => void
  }) => (
    <textarea
      aria-label={label}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  ),
}))

const listPublicBooks = vi.mocked(booksApi.listPublicBooks)
const getPublicBook = vi.mocked(booksApi.getPublicBook)
const submitToBook = vi.mocked(booksApi.submitToBook)

describe('BooksTestPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    listPublicBooks.mockResolvedValue([
      {
        id: 1,
        title: 'Featured Family Book',
        description: '',
        activeVersionId: 1,
      },
      {
        id: 2,
        title: 'Cookbook',
        description: '',
        activeVersionId: 4,
      },
    ])

    getPublicBook.mockResolvedValue({
      id: 1,
      title: 'Featured Family Book',
      description: '',
      version: {
        id: 1,
        versionNumber: 1,
        pdfContentUrl: '/api/books/public/1/pdf/content',
        allowPageImage: false,
        allowNewSections: true,
        sections: [
          {
            id: 11,
            name: 'Main Recipes',
            sourceStartPage: undefined,
            sourceEndPage: undefined,
            currentStartPage: 1,
            currentEndPage: 8,
            sortOrder: 1,
          },
        ],
        fields: [
          {
            id: 21,
            label: 'Story',
            inputType: 'rich_text',
            placement: 'body',
            showLabel: true,
            isRequired: true,
            isEmailField: false,
            sortOrder: 1,
          },
        ],
      },
    })

    submitToBook.mockResolvedValue({
      id: 90,
      status: 'pending',
      updated_at: '2026-06-17T12:00:00Z',
    })
  })

  it('loads the first public book without the selector and opens the add recipe modal', async () => {
    render(<BooksTestPage />)

    expect(await screen.findByRole('heading', { level: 1, name: 'Featured Family Book' })).toBeDefined()
    expect(getPublicBook).toHaveBeenCalledWith(1)
    expect(screen.getByText('Flipbook for Featured Family Book')).toBeDefined()
    expect(screen.getByRole('button', { name: /add your recipe/i })).toBeDefined()
    expect(screen.queryByRole('combobox')).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: /add your recipe/i }))

    const dialog = screen.getByRole('dialog', { name: /add your recipe/i })
    expect(dialog).toBeDefined()
    expect(within(dialog).getByRole('combobox')).toBeDefined()
    expect(within(dialog).getByRole('textbox', { name: 'Story' })).toBeDefined()
  })

  it('submits the modal form through the public book API', async () => {
    render(<BooksTestPage />)

    fireEvent.click(await screen.findByRole('button', { name: /add your recipe/i }))

    const dialog = screen.getByRole('dialog', { name: /add your recipe/i })
    fireEvent.change(within(dialog).getByRole('textbox', { name: 'Story' }), {
      target: { value: 'Family soup recipe' },
    })
    fireEvent.click(within(dialog).getByRole('button', { name: 'Submit' }))

    await waitFor(() => {
      expect(submitToBook).toHaveBeenCalledWith(
        1,
        {
          targetSectionId: 11,
          newSectionName: '',
          fieldValues: [
            {
              fieldId: 21,
              value: 'Family soup recipe',
            },
          ],
        },
        null,
      )
    })

    expect(screen.queryByRole('dialog', { name: /add your recipe/i })).toBeNull()
    expect(screen.getByText('Your submission has been sent for review.')).toBeDefined()
  })

  it('clears a previously selected image when the modal is closed and reopened', async () => {
    getPublicBook.mockResolvedValueOnce({
      id: 1,
      title: 'Featured Family Book',
      description: '',
      version: {
        id: 1,
        versionNumber: 1,
        pdfContentUrl: '/api/books/public/1/pdf/content',
        allowPageImage: true,
        allowNewSections: true,
        sections: [
          {
            id: 11,
            name: 'Main Recipes',
            sourceStartPage: undefined,
            sourceEndPage: undefined,
            currentStartPage: 1,
            currentEndPage: 8,
            sortOrder: 1,
          },
        ],
        fields: [
          {
            id: 21,
            label: 'Story',
            inputType: 'rich_text',
            placement: 'body',
            showLabel: true,
            isRequired: true,
            isEmailField: false,
            sortOrder: 1,
          },
        ],
      },
    })

    render(<BooksTestPage />)

    fireEvent.click(await screen.findByRole('button', { name: /add your recipe/i }))

    let dialog = screen.getByRole('dialog', { name: /add your recipe/i })
    const imageInput = within(dialog).getByLabelText('Optional image') as HTMLInputElement
    const file = new File(['image-bytes'], 'bannock.png', { type: 'image/png' })
    fireEvent.change(imageInput, {
      target: { files: [file] },
    })

    expect(within(dialog).getByText('bannock.png')).toBeDefined()
    fireEvent.click(within(dialog).getByRole('button', { name: 'Close' }))

    fireEvent.click(screen.getByRole('button', { name: /add your recipe/i }))

    dialog = screen.getByRole('dialog', { name: /add your recipe/i })
    expect(within(dialog).queryByText('bannock.png')).toBeNull()
    fireEvent.change(within(dialog).getByRole('textbox', { name: 'Story' }), {
      target: { value: 'Family soup recipe' },
    })
    fireEvent.click(within(dialog).getByRole('button', { name: 'Submit' }))

    await waitFor(() => {
      expect(submitToBook).toHaveBeenCalledWith(
        1,
        {
          targetSectionId: 11,
          newSectionName: '',
          fieldValues: [
            {
              fieldId: 21,
              value: 'Family soup recipe',
            },
          ],
        },
        null,
      )
    })
  })
})
