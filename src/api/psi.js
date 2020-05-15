import request from '@/utils/request'

export function getMembers() {
  return request({
    url: '/psi/members',
    method: 'get'
  })
}

export function getGoods() {
  return request({
    url: '/psi/goods',
    method: 'get'
  })
}

export function getStorages() {
  return request({
    url: '/psi/storages',
    method: 'get'
  })
}

export function getStore() {
  return request({
    url: '/psi/store',
    method: 'get'
  })
}

export function getLogs() {
  return request({
    url: '/psi/logs',
    method: 'get'
  })
}

export function postMember(data) {
  return request({
    url: '/psi/member',
    method: 'post',
    data
  })
}

export function postGoods(data) {
  return request({
    url: '/psi/goods',
    method: 'post',
    data
  })
}

export function postStorage(data) {
  return request({
    url: '/psi/storage',
    method: 'post',
    data
  })
}

export function postStore(data) {
  return request({
    url: '/psi/setStore',
    method: 'post',
    data
  })
}

export function newLog(data) {
  return request({
    url: '/psi/newLog',
    method: 'post',
    data
  })
}

export function editLog(data) {
  return request({
    url: '/psi/editLog',
    method: 'post',
    data
  })
}

export function delLog(id) {
  return request({
    url: '/psi/delLog',
    method: 'post',
    data: { id }
  })
}
