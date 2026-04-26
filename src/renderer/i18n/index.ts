import { computed, ref } from 'vue'
import { messages, type Locale } from './messages'

const STORAGE_KEY = 'musedesk.locale'
export const locale = ref<Locale>('zh-CN')

function normalizeLocale(input?: string | null): Locale {
  if (!input) return 'zh-CN'
  const lower = input.toLowerCase()
  if (lower.startsWith('zh')) return 'zh-CN'
  if (lower.startsWith('ja')) return 'ja-JP'
  if (lower.startsWith('ko')) return 'ko-KR'
  if (lower.startsWith('en')) return 'en-US'
  return 'zh-CN'
}

export async function initLocale() {
  const fromLocalStorage = localStorage.getItem(STORAGE_KEY)
  const fromSettings = await window.musedesk.settings.get('app.locale')
  locale.value = normalizeLocale(fromSettings ?? fromLocalStorage ?? navigator.language)
  document.documentElement.lang = locale.value
}

export async function setLocale(next: Locale) {
  locale.value = next
  document.documentElement.lang = next
  localStorage.setItem(STORAGE_KEY, next)
  await window.musedesk.settings.set('app.locale', next)
}

export function useI18nText() {
  const t = (key: string) => messages[locale.value][key] ?? messages['zh-CN'][key] ?? key
  return {
    locale: computed(() => locale.value),
    t
  }
}

export const supportedLocales: Array<{ value: Locale; label: string }> = [
  { value: 'zh-CN', label: '中文' },
  { value: 'en-US', label: 'English' },
  { value: 'ja-JP', label: '日本語' },
  { value: 'ko-KR', label: '한국어' }
]
