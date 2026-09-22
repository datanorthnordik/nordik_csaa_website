import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { RecordingsPage } from './RecordingsPage'

const { listCollections, getCollection } = vi.hoisted(() => ({
  listCollections: vi.fn(),
  getCollection: vi.fn(),
}))

vi.mock('../api/recordingsApi', () => ({
  recordingsApi: {
    listCollections,
    getCollection,
  },
}))

const sampleCollections = [
  {
    id: 1,
    name: 'Elders Oral Histories',
    item_count: 1,
    created_at: '',
    updated_at: '',
  },
]

const sampleDetail = {
  id: 1,
  name: 'Elders Oral Histories',
  item_count: 1,
  created_at: '',
  updated_at: '',
  items: [
    {
      id: 10,
      recording_collection_id: 1,
      title: 'Grandmother tells the story of the river',
      description: 'Recorded at the 2025 gathering.',
      recording_url: '/api/recordings/1/items/10/content',
      created_at: '',
      updated_at: '',
    },
  ],
}

const renderPage = () =>
  render(
    <MemoryRouter>
      <RecordingsPage />
    </MemoryRouter>,
  )

describe('RecordingsPage', () => {
  beforeEach(() => {
    listCollections.mockReset()
    getCollection.mockReset()
  })

  it('lists collections and lazily loads items when expanded', async () => {
    listCollections.mockResolvedValue({ items: sampleCollections })
    getCollection.mockResolvedValue(sampleDetail)

    renderPage()

    const button = await screen.findByRole('button', { name: /Elders Oral Histories/i })
    expect(getCollection).not.toHaveBeenCalled()

    fireEvent.click(button)

    expect(
      await screen.findByText('Grandmother tells the story of the river'),
    ).toBeTruthy()
    await waitFor(() => expect(getCollection).toHaveBeenCalledWith(1))
  })

  it('shows an empty state when there are no collections', async () => {
    listCollections.mockResolvedValue({ items: [] })

    renderPage()

    expect(
      await screen.findByText('No recordings have been published yet.'),
    ).toBeTruthy()
  })

  it('shows an error state when the list fails to load', async () => {
    listCollections.mockRejectedValue(new Error('network error'))

    renderPage()

    expect((await screen.findByRole('alert')).textContent).toBe(
      'We could not load the recordings right now. Please try again later.',
    )
  })
})
