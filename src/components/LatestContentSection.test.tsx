import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { latestContentApi } from '../api/latestContentApi'
import i18n from '../i18n'
import { formatLatestContentDate } from '../lib/latestContent'
import { LatestContentSection } from './LatestContentSection'

vi.mock('../api/latestContentApi', () => ({
  latestContentApi: {
    listLatestContent: vi.fn(),
  },
}))

const listLatestContent = vi.mocked(latestContentApi.listLatestContent)

describe('LatestContentSection', () => {
  beforeEach(async () => {
    listLatestContent.mockReset()
    await i18n.changeLanguage('en')
  })

  it('renders only the latest three cards with source-specific links', async () => {
    listLatestContent.mockResolvedValue([
      {
        id: 1,
        sourceType: 'event',
        sourceId: 10,
        title: 'Traditional Storytelling Circle',
        description: 'Join us for an evening of oral traditions.',
        displayDate: '2026-10-24T00:00:00Z',
        publishedAt: '2026-09-25T10:00:00Z',
        detailPath: '/events/10',
      },
      {
        id: 2,
        sourceType: 'newsletter',
        sourceId: 11,
        title: 'Community Newsletter',
        description: 'News from across the territory.',
        displayDate: '2026-09-20T00:00:00Z',
        publishedAt: '2026-09-24T10:00:00Z',
        detailPath: '/news-media/digital-newsletter/11',
      },
      {
        id: 3,
        sourceType: 'press',
        sourceId: 12,
        title: 'Community Statement',
        description: 'A new statement from CSAA.',
        displayDate: '2026-09-19T00:00:00Z',
        publishedAt: '2026-09-23T10:00:00Z',
        detailPath: '/news-media/press-archive/12',
      },
      {
        id: 4,
        sourceType: 'event',
        sourceId: 13,
        title: 'Older event',
        description: 'This card should not render.',
        displayDate: '2026-09-18T00:00:00Z',
        publishedAt: '2026-09-22T10:00:00Z',
        detailPath: '/events/13',
      },
    ])

    render(
      <MemoryRouter>
        <LatestContentSection />
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(listLatestContent).toHaveBeenCalledWith(3)
    })
    expect(await screen.findByText('Traditional Storytelling Circle')).toBeDefined()
    expect(screen.getByText('Community Newsletter')).toBeDefined()
    expect(screen.getByText('Community Statement')).toBeDefined()
    expect(screen.queryByText('Older event')).toBeNull()
    expect(screen.getByRole('link', { name: 'Learn more...' }).getAttribute('href')).toBe(
      '/events/10',
    )
    expect(screen.getAllByRole('link', { name: 'Read More' })).toHaveLength(2)
    expect(screen.getByText('OCTOBER 24, 2026')).toBeDefined()
  })

  it('stays hidden when the feed is unavailable', async () => {
    listLatestContent.mockRejectedValue(new Error('offline'))

    render(
      <MemoryRouter>
        <LatestContentSection />
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(listLatestContent).toHaveBeenCalled()
    })
    expect(screen.queryByRole('region', { name: 'Latest community updates' })).toBeNull()
  })

  it('formats stable uppercase dates', () => {
    expect(formatLatestContentDate('2026-11-15T00:00:00Z', 'en')).toBe(
      'NOVEMBER 15, 2026',
    )
  })
})
