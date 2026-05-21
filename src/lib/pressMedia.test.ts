import { describe, expect, it } from 'vitest'
import {
  extractPressExcerpt,
  resolvePressDownloads,
  resolvePressPreview,
} from './pressMedia'

describe('pressMedia', () => {
  it('prefers the cover image for list previews while preserving document labels', () => {
    const preview = resolvePressPreview({
      id: 11,
      title: 'Press release',
      release_date: '2026-05-01T00:00:00Z',
      category_id: null,
      source_url: 'https://example.com/story',
      content_html: '<p>Community update for the press archive.</p>',
      status: 'published',
      visibility: 'public',
      cover_image_url: '/api/press/11/cover/content',
      cover_image_gcp_key: '',
      publish_at: null,
      media: [
        {
          id: 21,
          display_name: 'Agenda',
          file_name: 'agenda.pdf',
          gcp_object_key: '',
          file_url: '/api/press/11/media/21/content',
          mime_type: 'application/pdf',
          file_size: 10,
          media_role: 'attachment',
          sort_order: 0,
          created_at: '',
          updated_at: '',
        },
      ],
      created_at: '',
      updated_at: '',
    })

    expect(preview.previewKind).toBe('image')
    expect(preview.previewUrl).toContain('/api/press/11/cover/content')
    expect(preview.fileTypeLabel).toBe('PDF')
  })

  it('falls back to the default archive artwork when no image preview exists', () => {
    const preview = resolvePressPreview({
      id: 18,
      title: 'External source only',
      release_date: '2026-04-01T00:00:00Z',
      category_id: null,
      source_url: 'https://example.com/coverage',
      content_html: '<p>External coverage.</p>',
      status: 'published',
      visibility: 'public',
      cover_image_url: '',
      cover_image_gcp_key: '',
      publish_at: null,
      media: [],
      created_at: '',
      updated_at: '',
    })

    expect(preview.previewKind).toBe('placeholder')
    expect(preview.previewUrl).toBeNull()
    expect(preview.fileTypeLabel).toBe('LINK')
  })

  it('builds download targets for press attachments', () => {
    const downloads = resolvePressDownloads({
      id: 24,
      title: 'Press archive entry',
      release_date: '2026-03-01T00:00:00Z',
      category_id: null,
      source_url: '',
      content_html: '<p>Archive entry.</p>',
      status: 'published',
      visibility: 'public',
      cover_image_url: '',
      cover_image_gcp_key: '',
      publish_at: null,
      media: [
        {
          id: 31,
          display_name: 'Press PDF',
          file_name: 'press.pdf',
          gcp_object_key: '',
          file_url: '/api/press/24/media/31/content',
          mime_type: 'application/pdf',
          file_size: 10,
          media_role: 'attachment',
          sort_order: 0,
          created_at: '',
          updated_at: '',
        },
      ],
      created_at: '',
      updated_at: '',
    })

    expect(downloads).toEqual([
      {
        id: 31,
        title: 'Press PDF',
        downloadUrl: expect.stringContaining('/api/press/24/media/31/content'),
        downloadFileName: 'press.pdf',
        badgeLabel: 'PDF',
        mimeType: 'application/pdf',
      },
    ])
  })

  it('extracts readable excerpts from html content', () => {
    expect(
      extractPressExcerpt('<p>Stories, archive work, and published media coverage.</p>'),
    ).toMatch(/stories, archive work/i)
  })

  it('handles missing optional press strings without throwing', () => {
    const preview = resolvePressPreview({
      id: 44,
      title: 'Partial press record',
      release_date: '2026-02-01T00:00:00Z',
      category_id: null,
      source_url: undefined as unknown as string,
      content_html: undefined as unknown as string,
      status: 'published',
      visibility: 'public',
      cover_image_url: undefined as unknown as string,
      cover_image_gcp_key: '',
      publish_at: null,
      media: [
        {
          id: 51,
          display_name: '',
          file_name: undefined as unknown as string,
          gcp_object_key: '',
          file_url: undefined as unknown as string,
          mime_type: undefined as unknown as string,
          file_size: 10,
          media_role: 'attachment',
          sort_order: 0,
          created_at: '',
          updated_at: '',
        },
      ],
      created_at: '',
      updated_at: '',
    })

    const downloads = resolvePressDownloads({
      id: 44,
      title: 'Partial press record',
      release_date: '2026-02-01T00:00:00Z',
      category_id: null,
      source_url: undefined as unknown as string,
      content_html: undefined as unknown as string,
      status: 'published',
      visibility: 'public',
      cover_image_url: undefined as unknown as string,
      cover_image_gcp_key: '',
      publish_at: null,
      media: [
        {
          id: 51,
          display_name: '',
          file_name: undefined as unknown as string,
          gcp_object_key: '',
          file_url: undefined as unknown as string,
          mime_type: undefined as unknown as string,
          file_size: 10,
          media_role: 'attachment',
          sort_order: 0,
          created_at: '',
          updated_at: '',
        },
      ],
      created_at: '',
      updated_at: '',
    })

    expect(preview).toEqual({
      previewKind: 'placeholder',
      previewUrl: null,
      fileTypeLabel: 'PRESS',
      excerpt: '',
    })
    expect(downloads[0]).toMatchObject({
      title: 'Attachment 51',
      downloadFileName: 'attachment-51',
      badgeLabel: 'PRESS',
      mimeType: '',
    })
  })
})
