import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { PlayerState, Track } from '@shared/types'

export const usePlayerStore = defineStore('player', () => {
  const currentTrack = ref<Track | null>(null)
  const isPlaying = ref(false)
  const currentTime = ref(0)
  const duration = ref(0)
  const volume = ref(0.8)
  const canPlay = ref(true)
  const playableUrl = ref<string | null>(null)

  let audio: HTMLAudioElement | null = null

  function getAudio(): HTMLAudioElement {
    if (!audio) {
      audio = new Audio()
      audio.volume = volume.value

      audio.addEventListener('timeupdate', () => {
        currentTime.value = audio?.currentTime ?? 0
      })

      audio.addEventListener('ended', () => {
        isPlaying.value = false
        currentTime.value = 0
      })

      audio.addEventListener('error', () => {
        isPlaying.value = false
        canPlay.value = false
      })
    }
    return audio
  }

  async function playTrack(track: Track) {
    // Sync state with main process
    await window.musedesk.player.playTrack(track)
    currentTrack.value = track
    duration.value = track.duration
    canPlay.value = true

    // Try to get a playable URL
    try {
      const url = await window.musedesk.tracks.getPlayableUrl(track.id)
      if (url) {
        const a = getAudio()
        a.src = url
        await a.play()
        playableUrl.value = url
        isPlaying.value = true
      } else {
        // URL not available — track can't play but state is still set
        playableUrl.value = null
        canPlay.value = false
        isPlaying.value = false
      }
    } catch {
      playableUrl.value = null
      canPlay.value = false
      isPlaying.value = false
    }
  }

  async function pause() {
    await window.musedesk.player.pause()
    audio?.pause()
    isPlaying.value = false
  }

  async function resume() {
    await window.musedesk.player.resume()
    if (audio?.src) {
      await audio.play()
      isPlaying.value = true
    } else {
      // Can't resume without a source
      isPlaying.value = false
    }
  }

  async function seek(time: number) {
    await window.musedesk.player.seek(time)
    if (audio) {
      audio.currentTime = time
    }
    currentTime.value = time
  }

  async function setVolume(vol: number) {
    await window.musedesk.player.setVolume(vol)
    volume.value = vol
    if (audio) {
      audio.volume = vol
    }
  }

  async function getState(): Promise<PlayerState> {
    const state = await window.musedesk.player.getState()
    currentTrack.value = state.currentTrack
    playableUrl.value = state.playableUrl
    isPlaying.value = state.isPlaying
    currentTime.value = state.currentTime
    duration.value = state.duration
    volume.value = state.volume
    return state
  }

  return {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    canPlay,
    playableUrl,
    playTrack,
    pause,
    resume,
    seek,
    setVolume,
    getState
  }
})
