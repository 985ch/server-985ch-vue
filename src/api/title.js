import request from '@/utils/request'

export function getTitleTypes() {
  return request({
    url: '/resource/titletype',
    method: 'get'
  })
}

export function findTitles(keyword, types, nsfw) {
  return request({
    url: '/resource/titles',
    method: 'get',
    params: { keyword, types, nsfw }
  })
}

export function getTitleData(id) {
  return request({
    url: '/resource/title',
    method: 'get',
    params: { id }
  })
}

export function saveTitle({ id, typeid, names, releaseTime, pic, info, nsfw }) {
  return request({
    url: '/title/save',
    method: 'post',
    data: {
      id,
      typeid,
      names: names.join('\n'),
      releaseTime: releaseTime.toString(),
      pic,
      info,
      nsfw
    }
  })
}
