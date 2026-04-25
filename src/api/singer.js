import axios from 'axios'

export function getSingerList() {
  return axios.get('/api/artist/list', {
    params: {
      type: -1,
      area: -1,
      initial: -1,
      limit: 100
    }
  }).then((res) => {
    return Promise.resolve({
      code: 200,
      artists: res.data.artists || []
    })
  })
}

export function getSingerDetail(id) {
  return axios.get('/api/artist/songs', {
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
