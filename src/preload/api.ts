import { ipcRenderer } from 'electron'
import type { OtoDeskApi } from '@shared/types'

export const otodeskApi: OtoDeskApi = {
  music: {
    searchTracks: (query) => ipcRenderer.invoke('music:searchTracks', query),
    getDiscovery: () => ipcRenderer.invoke('music:getDiscovery'),
    getPlaylistTracks: (input) => ipcRenderer.invoke('music:getPlaylistTracks', input),
    resolveTrack: (input) => ipcRenderer.invoke('music:resolveTrack', input),
    getLyric: (trackId) => ipcRenderer.invoke('music:getLyric', trackId),
    getPlayableUrl: (trackId) => ipcRenderer.invoke('music:getPlayableUrl', trackId)
  },
  musicGeneration: {
    listProviders: () => ipcRenderer.invoke('musicGeneration:listProviders'),
    generate: (input) => ipcRenderer.invoke('musicGeneration:generate', input),
    testAll: (input) => ipcRenderer.invoke('musicGeneration:testAll', input)
  },
  pattern: {
    generate: (input) => ipcRenderer.invoke('pattern:generate', input)
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
    configureAi: (input) => ipcRenderer.invoke('settings:configureAi', input),
    exchangeOpenRouterCode: (input) => ipcRenderer.invoke('settings:exchangeOpenRouterCode', input),
    listOpenRouterFreeModels: () => ipcRenderer.invoke('settings:listOpenRouterFreeModels'),
    getAll: () => ipcRenderer.invoke('settings:getAll'),
    testNetease: () => ipcRenderer.invoke('settings:testNetease'),
    testAi: () => ipcRenderer.invoke('settings:testAi'),
    testPi: () => ipcRenderer.invoke('settings:testPi'),
    testRenderer: () => ipcRenderer.invoke('settings:testRenderer')
  }
}
