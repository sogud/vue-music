import type { MusedeskApi } from '@shared/types'

declare global {
  interface Window {
    musedesk: MusedeskApi
  }
}

export {}
