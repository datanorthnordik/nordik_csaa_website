import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiClient } from '../api/apiClient'
import { downloadPublicFile } from './fileDownload'

vi.mock('../api/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
  },
}))

describe('downloadPublicFile', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('downloads a public file through the browser', async () => {
    const blob = new Blob(['agenda'])
    vi.mocked(apiClient.get).mockResolvedValue({ data: blob })

    Object.defineProperty(URL, 'createObjectURL', {
      writable: true,
      value: vi.fn(() => 'blob:agenda'),
    })
    Object.defineProperty(URL, 'revokeObjectURL', {
      writable: true,
      value: vi.fn(),
    })

    const originalCreateElement = document.createElement.bind(document)
    const anchor = originalCreateElement('a')
    const clickSpy = vi.spyOn(anchor, 'click').mockImplementation(() => {})
    const removeSpy = vi.spyOn(anchor, 'remove')
    const createElementSpy = vi
      .spyOn(document, 'createElement')
      .mockImplementation(((tagName: string) =>
        tagName.toLowerCase() === 'a' ? anchor : originalCreateElement(tagName)) as typeof document.createElement)
    const appendSpy = vi.spyOn(document.body, 'appendChild')
    const createObjectUrlSpy = vi.mocked(URL.createObjectURL)
    const revokeObjectUrlSpy = vi.mocked(URL.revokeObjectURL)
    const setTimeoutSpy = vi
      .spyOn(window, 'setTimeout')
      .mockImplementation(((callback: TimerHandler) => {
        if (typeof callback === 'function') {
          callback()
        }

        return 0 as unknown as number
      }) as typeof window.setTimeout)

    await downloadPublicFile('/api/files/agenda', 'agenda.pdf')

    expect(apiClient.get).toHaveBeenCalledWith('/api/files/agenda', {
      responseType: 'blob',
      skipAuth: true,
      skipErrorToast: true,
    })
    expect(anchor.href).toBe('blob:agenda')
    expect(anchor.download).toBe('agenda.pdf')
    expect(appendSpy).toHaveBeenCalledWith(anchor)
    expect(clickSpy).toHaveBeenCalled()
    expect(removeSpy).toHaveBeenCalled()
    expect(createObjectUrlSpy).toHaveBeenCalledWith(blob)
    expect(revokeObjectUrlSpy).toHaveBeenCalledWith('blob:agenda')
    expect(setTimeoutSpy).toHaveBeenCalled()

    createElementSpy.mockRestore()
  })
})
