import request from '@/utils/request'

export function findResources(keyword) {
  return request({
    url: '/resource/list',
    method: 'get',
    params: { keyword }
  })
}

export function getResource(id) {
  return request({
    url: '/resource/info',
    method: 'get',
    params: { id }
  })
}

export function bindTitle(titleid, resid, folder) {
  return request({
    url: '/resource/bind',
    method: 'post',
    data: {
      titleid,
      resid,
      folder
    }
  })
}

export function unbindTitle(id) {
  return request({
    url: '/resource/unbind',
    method: 'post',
    data: { id }
  })
}
