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
