import { useEffect } from 'react'

const APP_NAME = 'Leaving Cert Study Space'

export function useDocumentTitle(page?: string) {
  useEffect(() => {
    document.title = page ? `${page} · ${APP_NAME}` : APP_NAME
  }, [page])
}
