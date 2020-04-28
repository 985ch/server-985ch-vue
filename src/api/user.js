import request from '@/utils/request'

export function login(qq, code) {
  return request({
    url: '/user/login',
    method: 'post',
    data: { code: `${qq}#${code}` }
  })
}

export function getInfo() {
  return request({
    url: '/user/info',
    method: 'get'
  })
}

export function logout() {
  return request({
    url: '/user/logout',
    method: 'post'
  })
}

export function getGroups() {
  return request({
    url: '/user/groups',
    method: 'get'
  })
}
