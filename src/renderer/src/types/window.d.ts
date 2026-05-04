import type { OtoDeskApi } from '@shared/types'

declare global {
  interface Window {
    otodesk: OtoDeskApi
  }
}

export {}
