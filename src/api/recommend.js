import axios from 'axios'

export function getRecommend() {
  return axios.get('/api/banner').then((res) => {
    return Promise.resolve({
      code: 200,
      banners: res.data.banners || []
    })
  })
}

export function getDiscList() {
  return axios.get('/api/top/playlist/highquality', {
    params: {
      limit: 30
    }
  }).then((res) => {
    return Promise.resolve({
      code: 200,
      playlists: res.data.playlists || []
    })
  })
}

export function getSongList(id) {
  return axios.get('/api/playlist/detail', {
    params: {
      id
    }
  }).then((res) => {
    const playlist = res.data.playlist || {}
    return Promise.resolve({
      code: 200,
      playlist,
      tracks: playlist.tracks || []
    })
  })
}
