import { describe, expect, it } from 'vitest'
import {
  extractNewsletterExcerpt,
  getNewsletterCategoryLabel,
  resolveNewsletterDownload,
  resolveNewsletterFlipbook,
  resolveNewsletterPreview,
} from './newsletterMedia'

describe('newsletterMedia', () => {
  it('prefers an image for preview while keeping the file type label from a previewable document', () => {
    const preview = resolveNewsletterPreview({
      id: 11,
      title: 'Community Reunion Highlights',
      category: 'csaa',
      send_date: '2026-05-01T00:00:00Z',
      content_html: '<p>Returning for reunions and archive stories.</p>',
      status: 'published',
      visibility: 'public',
      publish_at: null,
      created_at: '',
      updated_at: '',
      media: [
        {
          id: 201,
          display_name: 'Display image',
          file_name: 'reunion.jpg',
          gcp_object_key: '',
          file_url: '/api/newsletters/11/media/201/content',
          mime_type: 'image/jpeg',
          file_size: 1,
          media_role: 'attachment',
          sort_order: 0,
          created_at: '',
          updated_at: '',
        },
        {
          id: 202,
          display_name: 'Edition PDF',
          file_name: 'reunion.pdf',
          gcp_object_key: '',
          file_url: '/api/newsletters/11/media/202/content',
          mime_type: 'application/pdf',
          file_size: 1,
          media_role: 'attachment',
          sort_order: 1,
          created_at: '',
          updated_at: '',
        },
      ],
    })

    expect(preview.previewKind).toBe('image')
    expect(preview.previewUrl).toContain('/api/newsletters/11/media/201/content')
    expect(preview.fileTypeLabel).toBe('PDF')
  })

  it('falls back to an iframe preview when the first previewable media is a pdf', () => {
    const preview = resolveNewsletterPreview({
      id: 17,
      title: 'Archive microsite',
      category: 'csaa',
      send_date: '2024-03-02T00:00:00Z',
      content_html: '<p>Archive edition overview.</p>',
      status: 'published',
      visibility: 'public',
      publish_at: null,
      created_at: '',
      updated_at: '',
      media: [
        {
          id: 301,
          display_name: 'Edition PDF',
          file_name: 'archive-2024.pdf',
          gcp_object_key: '',
          file_url: '/api/newsletters/17/media/301/content',
          mime_type: 'application/pdf',
          file_size: 1,
          media_role: 'attachment',
          sort_order: 0,
          created_at: '',
          updated_at: '',
        },
      ],
    })

    expect(preview.previewKind).toBe('iframe')
    expect(preview.previewUrl).toContain('/api/newsletters/17/media/301/content')
    expect(preview.fileTypeLabel).toBe('PDF')
  })

  it('handles empty media collections without throwing', () => {
    const entry = {
      id: 18,
      title: 'Archive microsite',
      category: 'csaa',
      send_date: '2024-03-02T00:00:00Z',
      content_html: '<p>Archive edition overview.</p>',
      status: 'published',
      visibility: 'public',
      publish_at: null,
      created_at: '',
      updated_at: '',
      media: [],
    } as Parameters<typeof resolveNewsletterPreview>[0]

    expect(resolveNewsletterPreview(entry).previewKind).toBe('placeholder')
    expect(resolveNewsletterFlipbook(entry)).toBeNull()
    expect(resolveNewsletterDownload(entry)).toBeNull()
  })

  it('resolves a pdf flipbook source when a pdf attachment exists', () => {
    const flipbook = resolveNewsletterFlipbook({
      id: 22,
      title: 'June edition',
      category: 'cst',
      send_date: '2025-06-01T00:00:00Z',
      content_html: '<p>June highlights.</p>',
      status: 'published',
      visibility: 'public',
      publish_at: null,
      created_at: '',
      updated_at: '',
      media: [
        {
          id: 401,
          display_name: 'June PDF',
          file_name: 'june.pdf',
          gcp_object_key: '',
          file_url: '/api/newsletters/22/media/401/content',
          mime_type: 'application/pdf',
          file_size: 1,
          media_role: 'attachment',
          sort_order: 0,
          created_at: '',
          updated_at: '',
        },
      ],
    })

    expect(flipbook).toEqual({
      kind: 'pdf',
      url: expect.stringContaining('/api/newsletters/22/media/401/content'),
      fileName: 'june.pdf',
    })
  })

  it('resolves image pages for the flipbook when only images are available', () => {
    const flipbook = resolveNewsletterFlipbook({
      id: 23,
      title: 'Photo edition',
      category: 'cst',
      send_date: '2025-07-01T00:00:00Z',
      content_html: '<p>Photo edition.</p>',
      status: 'published',
      visibility: 'public',
      publish_at: null,
      created_at: '',
      updated_at: '',
      media: [
        {
          id: 501,
          display_name: 'Page 1',
          file_name: 'page-1.jpg',
          gcp_object_key: '',
          file_url: '/api/newsletters/23/media/501/content',
          mime_type: 'image/jpeg',
          file_size: 1,
          media_role: 'attachment',
          sort_order: 0,
          created_at: '',
          updated_at: '',
        },
        {
          id: 502,
          display_name: 'Page 2',
          file_name: 'page-2.jpg',
          gcp_object_key: '',
          file_url: '/api/newsletters/23/media/502/content',
          mime_type: 'image/jpeg',
          file_size: 1,
          media_role: 'attachment',
          sort_order: 1,
          created_at: '',
          updated_at: '',
        },
      ],
    })

    expect(flipbook).toEqual({
      kind: 'images',
      pages: [
        {
          id: 501,
          title: 'Page 1',
          altText: 'Page 1',
          imageUrl: expect.stringContaining('/api/newsletters/23/media/501/content'),
        },
        {
          id: 502,
          title: 'Page 2',
          altText: 'Page 2',
          imageUrl: expect.stringContaining('/api/newsletters/23/media/502/content'),
        },
      ],
    })
  })

  it('prefers the pdf as the newsletter download target', () => {
    const downloadTarget = resolveNewsletterDownload({
      id: 31,
      title: 'Downloadable edition',
      category: 'cst',
      send_date: '2025-08-01T00:00:00Z',
      content_html: '<p>Downloadable edition.</p>',
      status: 'published',
      visibility: 'public',
      publish_at: null,
      created_at: '',
      updated_at: '',
      media: [
        {
          id: 701,
          display_name: 'Cover image',
          file_name: 'cover.jpg',
          gcp_object_key: '',
          file_url: '/api/newsletters/31/media/701/content',
          mime_type: 'image/jpeg',
          file_size: 1,
          media_role: 'attachment',
          sort_order: 0,
          created_at: '',
          updated_at: '',
        },
        {
          id: 702,
          display_name: 'Edition PDF',
          file_name: 'edition.pdf',
          gcp_object_key: '',
          file_url: '/api/newsletters/31/media/702/content',
          mime_type: 'application/pdf',
          file_size: 1,
          media_role: 'attachment',
          sort_order: 1,
          created_at: '',
          updated_at: '',
        },
      ],
    })

    expect(downloadTarget).toEqual({
      url: expect.stringContaining('/api/newsletters/31/media/702/content'),
      fileName: 'edition.pdf',
    })
  })

  it('creates readable excerpts from html content and normalizes categories', () => {
    expect(
      extractNewsletterExcerpt(
        '<p>Reflecting on reunion stories, oral histories, and new archive work.</p>',
      ),
    ).toMatch(/reflecting on reunion stories/i)

    expect(getNewsletterCategoryLabel('cst')).toBe('CST')
  })
})