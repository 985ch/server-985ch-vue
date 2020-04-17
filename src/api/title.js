import request from '@/utils/request'

export function getTitleTypes() {
  return request({
    url: '/resource/titletype',
    method: 'get'
  })
}

export function findTitles(params) {
  return request({
    url: '/resource/titles',
    method: 'get',
    params
  })
}

export function getTitleData(id) {
  return request({
    url: '/resource/title',
    method: 'get',
    params: { id }
  })
}

export function saveTitle(data) {
  return request({
    url: '/title/save',
    method: 'post',
    data
  })
}

export function concernTitle(id, concern) {
  return request({
    url: '/title/concern',
    method: 'post',
    data: { id, concern }
  })
}

export function likeTitle(id, like) {
  return request({
    url: '/title/like',
    method: 'post',
    data: { id, like }
  })
}

export function noteTitle(id, note) {
  return request({
    url: '/title/note',
    method: 'post',
    data: { id, note }
  })
}
