import { getDb } from '../db'

type SettingRow = {
  key: string
  value: string
  updated_at: number
}

export class SettingsRepository {
  get(key: string) {
    const row = getDb().prepare('SELECT value FROM settings WHERE key = ?').get(key) as
      | Pick<SettingRow, 'value'>
      | undefined
    return row?.value ?? null
  }

  set(key: string, value: string) {
    getDb()
      .prepare(
        `INSERT INTO settings (key, value, updated_at)
         VALUES (?, ?, ?)
         ON CONFLICT(key) DO UPDATE SET
           value = excluded.value,
           updated_at = excluded.updated_at`
      )
      .run(key, value, Date.now())
  }

  getAll() {
    const rows = getDb().prepare('SELECT key, value FROM settings ORDER BY key').all() as Array<
      Pick<SettingRow, 'key' | 'value'>
    >
    return Object.fromEntries(rows.map((row) => [row.key, row.value]))
  }
}

export const settingsRepository = new SettingsRepository()
