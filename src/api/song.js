import axios from 'axios'

export function getLyric(id) {
  return axios.get('/api/lyric', {
    params: {
      id
    }
  }).then((res) => {
    return Promise.resolve({
      code: 200,
      lyric: ((res.data.lrc || {}).lyric) || ''
    })
  })
}
