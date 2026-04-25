import { contextBridge, ipcRenderer } from 'electron'
import type { MusedeskApi } from '@shared/types'

const api: MusedeskApi = {
  getHomeSnapshot: () => ipcRenderer.invoke('musedesk:getHomeSnapshot'),
  analyzeCurrentSong: () => ipcRenderer.invoke('musedesk:analyzeCurrentSong'),
  saveInspiration: (note: string) => ipcRenderer.invoke('musedesk:saveInspiration', note),
  generateDirection: () => ipcRenderer.invoke('musedesk:generateDirection')
}

contextBridge.exposeInMainWorld('musedesk', api)
