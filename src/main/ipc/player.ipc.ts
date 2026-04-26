import { ipcMain } from 'electron'
import type { PlayerState, Track } from '@shared/types'

// In-memory player state managed by main
const state: PlayerState = {
  currentTrack: null,
  playableUrl: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 0.8
}

export function registerPlayerIpc() {
  ipcMain.handle('musedesk:player:playTrack', async (_event, track: Track) => {
    state.currentTrack = track
    state.isPlaying = true
    state.playableUrl = null
    state.duration = track.duration
    state.currentTime = 0
  })

  ipcMain.handle('musedesk:player:pause', async () => {
    state.isPlaying = false
  })

  ipcMain.handle('musedesk:player:resume', async () => {
    state.isPlaying = true
  })

  ipcMain.handle('musedesk:player:seek', async (_event, time: number) => {
    state.currentTime = time
  })

  ipcMain.handle('musedesk:player:setVolume', async (_event, volume: number) => {
    state.volume = volume
  })

  ipcMain.handle('musedesk:player:getState', async () => {
    return { ...state }
  })
}
