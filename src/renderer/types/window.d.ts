import type { MusedeskApi } from '@shared/types'

declare global {
  interface Window {
    musedesk: MusedeskApi
    otodesk: MusedeskApi
  }
}

export {}
