import axios from 'axios'

export function getHotKey() {
  return axios.get('/api/search/hot').then((res) => {
    const hots = (((res.data || {}).result) || {}).hots || []
    return Promise.resolve({
      code: 200,
      hots: hots.map((item) => item.first)
    })
  })
}

export function search(query, page, perpage) {
  const offset = (page - 1) * perpage
  return axios.get('/api/cloudsearch', {
    params: {
      keywords: query,
      limit: perpage,
      offset,
      type: 1
    }
  }).then((res) => {
    const result = res.data.result || {}
    return Promise.resolve({
      code: 200,
      songs: result.songs || [],
      total: result.songCount || 0,
      page,
      perpage
    })
  })
}
