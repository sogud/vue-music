import { ipcRenderer } from 'electron'
import type { OtoDeskApi } from '@shared/types'

export const otodeskApi: OtoDeskApi = {
  music: {
    searchTracks: (query) => ipcRenderer.invoke('music:searchTracks', query),
    resolveTrack: (input) => ipcRenderer.invoke('music:resolveTrack', input),
    getLyric: (trackId) => ipcRenderer.invoke('music:getLyric', trackId),
    getPlayableUrl: (trackId) => ipcRenderer.invoke('music:getPlayableUrl', trackId)
  },
  analysis: {
    analyzeTrack: (input) => ipcRenderer.invoke('analysis:analyzeTrack', input),
    getByTrack: (trackId) => ipcRenderer.invoke('analysis:getByTrack', trackId)
  },
  inspiration: {
    save: (input) => ipcRenderer.invoke('inspiration:save', input),
    list: () => ipcRenderer.invoke('inspiration:list'),
    remove: (id) => ipcRenderer.invoke('inspiration:remove', id)
  },
  composition: {
    generateFromIdea: (input) => ipcRenderer.invoke('composition:generateFromIdea', input),
    validate: (composition) => ipcRenderer.invoke('composition:validate', composition)
  },
  project: {
    create: (input) => ipcRenderer.invoke('project:create', input),
    list: () => ipcRenderer.invoke('project:list'),
    get: (id) => ipcRenderer.invoke('project:get', id),
    updateComposition: (projectId, composition) =>
      ipcRenderer.invoke('project:updateComposition', { projectId, composition }),
    remove: (id) => ipcRenderer.invoke('project:remove', id)
  },
  render: {
    checkTools: () => ipcRenderer.invoke('render:checkTools'),
    renderProject: (projectId) => ipcRenderer.invoke('render:renderProject', projectId),
    openOutputFolder: (projectId) => ipcRenderer.invoke('render:openOutputFolder', projectId)
  },
  settings: {
    get: (key) => ipcRenderer.invoke('settings:get', key),
    set: (key, value) => ipcRenderer.invoke('settings:set', { key, value }),
    getAll: () => ipcRenderer.invoke('settings:getAll'),
    testNetease: () => ipcRenderer.invoke('settings:testNetease'),
    testPi: () => ipcRenderer.invoke('settings:testPi'),
    testRenderer: () => ipcRenderer.invoke('settings:testRenderer')
  }
}
