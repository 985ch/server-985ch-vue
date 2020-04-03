import { findResources, getResource } from '@/api/resource'
import { unzipBase64 } from '@/utils/unzipbase64'

const state = {
  searchText: '',
  resources: [],
  resData: {}
}

const getters = {}

const mutations = {}

const actions = {
  // 搜索资源
  async findResources({ state }, keyword) {
    keyword = keyword !== '' ? keyword : undefined
    state.resources = await findResources(keyword)
  },
  // 获取资源
  async getResource({ state }, id) {
    if (state.resData[id]) {
      return state.resData[id]
    }
    const raw = await getResource(id)
    raw.info = JSON.parse(unzipBase64(raw.info))
    state.resData[id] = raw
    return raw
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
