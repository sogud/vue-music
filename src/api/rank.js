import axios from 'axios'

export function getTopList() {
  return axios.get('/api/toplist/detail').then((res) => {
    return Promise.resolve({
      code: 200,
      list: res.data.list || []
    })
  })
}

export function getMusicList(id) {
  return axios.get('/api/playlist/track/all', {
    params: {
      id,
      limit: 80,
      offset: 0
    }
  }).then((res) => {
    return Promise.resolve({
      code: 200,
      songs: res.data.songs || []
    })
  })
}
