import type { OtoDeskApi } from '@shared/types'

async function call<T>(domain: string, method: string, body?: unknown): Promise<T> {
  const response = await fetch(`/api/${domain}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body ?? null)
  })
  const payload = await response.json().catch(() => null)
  if (!response.ok) {
    const message =
      payload && typeof payload === 'object' && 'error' in payload ? String(payload.error) : response.statusText
    throw new Error(message)
  }
  return payload as T
}

const webApi: OtoDeskApi = {
  music: {
    searchTracks: (query) => call('music', 'searchTracks', query),
    getDiscovery: () => call('music', 'getDiscovery'),
    getPlaylistTracks: (input) => call('music', 'getPlaylistTracks', input),
    resolveTrack: (input) => call('music', 'resolveTrack', input),
    getLyric: (trackId) => call('music', 'getLyric', trackId),
    getPlayableUrl: (trackId) => call('music', 'getPlayableUrl', trackId)
  },
  musicGeneration: {
    listProviders: () => call('musicGeneration', 'listProviders'),
    generate: (input) => call('musicGeneration', 'generate', input),
    testAll: (input) => call('musicGeneration', 'testAll', input)
  },
  pattern: {
    generate: (input) => call('pattern', 'generate', input)
  },
  analysis: {
    analyzeTrack: (input) => call('analysis', 'analyzeTrack', input),
    getByTrack: (trackId) => call('analysis', 'getByTrack', trackId)
  },
  inspiration: {
    save: (input) => call('inspiration', 'save', input),
    list: () => call('inspiration', 'list'),
    remove: (id) => call('inspiration', 'remove', id)
  },
  composition: {
    generateFromIdea: (input) => call('composition', 'generateFromIdea', input),
    validate: (composition) => call('composition', 'validate', composition)
  },
  project: {
    create: (input) => call('project', 'create', input),
    list: () => call('project', 'list'),
    get: (id) => call('project', 'get', id),
    updateComposition: (projectId, composition) =>
      call('project', 'updateComposition', { projectId, composition }),
    remove: (id) => call('project', 'remove', id)
  },
  render: {
    checkTools: () => call('render', 'checkTools'),
    renderProject: (projectId) => call('render', 'renderProject', projectId),
    openOutputFolder: (projectId) => call('render', 'openOutputFolder', projectId)
  },
  settings: {
    get: (key) => call('settings', 'get', key),
    set: (key, value) => call('settings', 'set', { key, value }),
    configureAi: (input) => call('settings', 'configureAi', input),
    exchangeOpenRouterCode: (input) => call('settings', 'exchangeOpenRouterCode', input),
    listOpenRouterFreeModels: () => call('settings', 'listOpenRouterFreeModels'),
    getAll: () => call('settings', 'getAll'),
    testNetease: () => call('settings', 'testNetease'),
    testAi: () => call('settings', 'testAi'),
    testPi: () => call('settings', 'testPi'),
    testRenderer: () => call('settings', 'testRenderer')
  }
}

export const otoApi = window.otodesk ?? webApi
