import { apiClient } from '../api/apiClient'

export async function downloadPublicFile(url: string, fileName: string) {
  const response = await apiClient.get<Blob>(url, {
    responseType: 'blob',
    skipAuth: true,
    skipErrorToast: true,
  })

  const downloadUrl = URL.createObjectURL(response.data)
  const link = document.createElement('a')
  link.href = downloadUrl
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  link.remove()

  window.setTimeout(() => {
    URL.revokeObjectURL(downloadUrl)
  }, 1000)
}
