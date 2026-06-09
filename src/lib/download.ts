import { api } from './axios'

type DownloadFormat = 'pdf' | 'xlsx' | 'csv'

function getMimeType(format: DownloadFormat): string {
  const mimeTypes: Record<DownloadFormat, string> = {
    pdf: 'application/pdf',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    csv: 'text/csv',
  }
  return mimeTypes[format]
}

function getExtension(format: DownloadFormat): string {
  return format
}

export async function downloadFromApi(
  url: string,
  filename: string,
  format: DownloadFormat,
  params?: Record<string, string | number | undefined>
): Promise<void> {
  const response = await api.get(url, {
    params,
    responseType: 'blob',
  })

  const blob = new Blob([response.data], { type: getMimeType(format) })
  const objectUrl = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = objectUrl
  link.download = `${filename}.${getExtension(format)}`
  document.body.appendChild(link)
  link.click()

  document.body.removeChild(link)
  URL.revokeObjectURL(objectUrl)
}
