import axios from 'axios'
import { apiClient } from './apiClient'
import { API_BASE_URL, API_ROUTES } from '../constants/api'
import type { BookFieldInputType, BookFieldPlacement } from './booksShared'

export type PublicBookSummary = {
  id: number
  title: string
  description: string
  activeVersionId?: number
}

export type PublicBookSection = {
  id: number
  name: string
  sourceStartPage?: number
  sourceEndPage?: number
  currentStartPage: number
  currentEndPage: number
  sortOrder: number
}

export type PublicBookField = {
  id: number
  label: string
  inputType: BookFieldInputType
  placement: BookFieldPlacement
  showLabel: boolean
  isRequired: boolean
  isEmailField: boolean
  sortOrder: number
}

export type PublicBookDetail = {
  id: number
  title: string
  description: string
  version: {
    id: number
    versionNumber: number
    pdfContentUrl: string
    allowPageImage: boolean
    allowNewSections: boolean
    sections: PublicBookSection[]
    fields: PublicBookField[]
  }
}

export type PublicBookSubmissionInput = {
  targetSectionId?: number
  newSectionName: string
  fieldValues: Array<{
    fieldId: number
    value: string
  }>
}

type ApiBookFieldInputType = 'single_line' | 'rich_text'
type ApiBookFieldPlacement = 'heading' | 'body'

type ApiListBooksResponse = {
  books: Array<{
    id: number
    title: string
    description: string
    active_version_id?: number
  }>
}

type ApiBookDetailResponse = {
  book: {
    id: number
    title: string
    description: string
    version: {
      id: number
      version_number: number
      pdf_content_url: string
      allow_page_image: boolean
      allow_new_sections: boolean
      sections: Array<{
        id: number
        name: string
        source_start_page?: number
        source_end_page?: number
        current_start_page: number
        current_end_page: number
        sort_order: number
      }>
      fields: Array<{
        id: number
        label: string
        input_type: ApiBookFieldInputType
        placement: ApiBookFieldPlacement
        show_label: boolean
        is_required: boolean
        is_email_field: boolean
        sort_order: number
      }>
    }
  }
}

type ApiSubmissionMutationResponse = {
  submission: {
    id: number
    status: string
    updated_at: string
  }
}

export const booksApi = {
  async listPublicBooks() {
    const response = await apiClient.get<ApiListBooksResponse>(API_ROUTES.publicBooks, {
      skipAuth: true,
      skipErrorToast: true,
    })

    return (response.data.books ?? []).map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      activeVersionId: item.active_version_id,
    }))
  },

  async getPublicBook(bookId: number) {
    const response = await apiClient.get<ApiBookDetailResponse>(API_ROUTES.publicBookById(bookId), {
      skipAuth: true,
      skipErrorToast: true,
    })
    const { book } = response.data

    return {
      id: book.id,
      title: book.title,
      description: book.description,
      version: {
        id: book.version.id,
        versionNumber: book.version.version_number,
        pdfContentUrl: book.version.pdf_content_url,
        allowPageImage: book.version.allow_page_image,
        allowNewSections: book.version.allow_new_sections,
        sections: (book.version.sections ?? []).map((section) => ({
          id: section.id,
          name: section.name,
          sourceStartPage: section.source_start_page,
          sourceEndPage: section.source_end_page,
          currentStartPage: section.current_start_page,
          currentEndPage: section.current_end_page,
          sortOrder: section.sort_order,
        })),
        fields: (book.version.fields ?? []).map((field) => ({
          id: field.id,
          label: field.label,
          inputType: field.input_type,
          placement: field.placement,
          showLabel: field.show_label,
          isRequired: field.is_required,
          isEmailField: field.is_email_field,
          sortOrder: field.sort_order,
        })),
      },
    } satisfies PublicBookDetail
  },

  async submitToBook(bookId: number, input: PublicBookSubmissionInput, imageFile?: File | null) {
    const payload = {
      target_section_id: input.targetSectionId,
      new_section_name: input.newSectionName,
      field_values: input.fieldValues.map((value) => ({
        field_id: value.fieldId,
        value: value.value,
      })),
      image: imageFile
        ? {
            file_name: imageFile.name,
            mime_type: imageFile.type,
            file_size: imageFile.size,
          }
        : undefined,
    }

    const requestBody =
      imageFile
        ? (() => {
            const form = new FormData()
            form.append('payload', JSON.stringify(payload))
            form.append('image_file', imageFile, imageFile.name)
            return form
          })()
        : payload

    const response = await apiClient.post<ApiSubmissionMutationResponse>(
      API_ROUTES.publicBookSubmissionById(bookId),
      requestBody,
      {
        skipAuth: true,
        skipErrorToast: true,
      },
    )

    return response.data.submission
  },

  resolveContentUrl(pathname: string) {
    const trimmed = pathname.trim()
    if (!trimmed) {
      return trimmed
    }
    if (/^https?:\/\//i.test(trimmed)) {
      return trimmed
    }
    if (trimmed.startsWith('/api/')) {
      return `${API_BASE_URL}${trimmed}`
    }
    return `${API_BASE_URL}/${trimmed.replace(/^\/+/, '')}`
  },

  async fetchBinary(pathname: string) {
    const response = await axios.get<ArrayBuffer>(booksApi.resolveContentUrl(pathname), {
      responseType: 'arraybuffer',
    })
    return new Uint8Array(response.data)
  },
}
