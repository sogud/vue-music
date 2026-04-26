import { contextBridge, ipcRenderer } from 'electron'
import type { MusedeskApi } from '@shared/types'

const api: MusedeskApi = {
  player: {
    playTrack: (track) => ipcRenderer.invoke('musedesk:player:playTrack', track),
    pause: () => ipcRenderer.invoke('musedesk:player:pause'),
    resume: () => ipcRenderer.invoke('musedesk:player:resume'),
    seek: (time) => ipcRenderer.invoke('musedesk:player:seek', time),
    setVolume: (volume) => ipcRenderer.invoke('musedesk:player:setVolume', volume),
    getState: () => ipcRenderer.invoke('musedesk:player:getState')
  },
  tracks: {
    searchTracks: (query) => ipcRenderer.invoke('musedesk:tracks:searchTracks', query),
    resolveTrack: (input) => ipcRenderer.invoke('musedesk:tracks:resolveTrack', input),
    getLyric: (trackId) => ipcRenderer.invoke('musedesk:tracks:getLyric', trackId),
    getPlayableUrl: (trackId) => ipcRenderer.invoke('musedesk:tracks:getPlayableUrl', trackId)
  },
  analysis: {
    analyzeTrack: (input) => ipcRenderer.invoke('musedesk:analysis:analyzeTrack', input),
    getByTrack: (trackId) => ipcRenderer.invoke('musedesk:analysis:getByTrack', trackId)
  },
  inspiration: {
    save: (input) => ipcRenderer.invoke('musedesk:inspiration:save', input),
    list: () => ipcRenderer.invoke('musedesk:inspiration:list'),
    remove: (id) => ipcRenderer.invoke('musedesk:inspiration:remove', id)
  },
  creation: {
    createFromInspiration: (input) => ipcRenderer.invoke('musedesk:creation:createFromInspiration', input),
    createFromIdea: (input) => ipcRenderer.invoke('musedesk:creation:createFromIdea', input),
    list: () => ipcRenderer.invoke('musedesk:creation:list'),
    get: (id) => ipcRenderer.invoke('musedesk:creation:get', id)
  },
  settings: {
    get: (key) => ipcRenderer.invoke('musedesk:settings:get', key),
    set: (key, value) => ipcRenderer.invoke('musedesk:settings:set', key, value)
  }
}

contextBridge.exposeInMainWorld('musedesk', api)
