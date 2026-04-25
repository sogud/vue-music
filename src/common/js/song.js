import {getLyric} from 'api/song'
import {ERR_OK} from 'api/config'

export default class Song {
  constructor({id, mid, singer, name, album, duration, image, url}) {
    this.id = id
    this.mid = mid
    this.singer = singer
    this.name = name
    this.album = album
    this.duration = duration
    this.image = image
    this.url = url
  }

  getLyric() {
    if (this.lyric) {
      return Promise.resolve(this.lyric)
    }

    return new Promise((resolve, reject) => {
      getLyric(this.id).then((res) => {
        if (res.code === ERR_OK && res.lyric) {
          this.lyric = res.lyric
          resolve(this.lyric)
        } else {
          reject('no lyric')
        }
      })
    })
  }
}

export function createSong(track) {
  return new Song({
    id: track.id,
    mid: String(track.id),
    singer: (track.ar || []).map((item) => item.name).join('/'),
    name: track.name,
    album: track.al ? track.al.name : '',
    duration: Math.floor((track.dt || 0) / 1000),
    image: track.al ? track.al.picUrl : '',
    url: `https://music.163.com/song/media/outer/url?id=${track.id}.mp3`
  })
}
