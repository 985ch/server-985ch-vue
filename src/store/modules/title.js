import Vue from 'vue'
import { getTitleTypes, findTitles } from '@/api/title'
import _ from 'lodash'

const state = {
  curPage: 1, // 当前页
  searchText: '', // 搜索字符串
  nsfw: false,
  concern: 0, // 是否仅搜索关注作品
  pageSize: 15, // 每页条目数
  selectTypes: null, // 选中的作品类型
  titleTypes: null, // 所有作品类型
  imageLoaded: {} // 记录所有已加载的图片
}

const getters = {
  typeMap(state) { // 作品类型映射数据
    return _.keyBy(state.titleTypes || [], 'id')
  },
  types(state) {
    const list = _.map(state.selectTypes || [], (obj) => obj.id)
    return JSON.stringify(list)
  }
}

const mutations = {
  selectAll(state) { // 选中所有类型
    const selected = []
    for (const cur of state.titleTypes) {
      selected.push(cur)
    }
    state.selectTypes = selected
  },
  setState(state, { key, val }) { // 设置选中类型
    state[key] = val
  },
  loadImage(state, { id, pic }) {
    if (state.imageLoaded[id] !== pic) {
      Vue.set(state.imageLoaded, id, pic)
    }
  }
}

const actions = {
  // 获取作品类型表
  async getTitleTypes({ state, commit }) {
    if (!state.titleTypes) {
      state.titleTypes = await getTitleTypes()
      commit('selectAll')
    }
  },
  // 搜索作品
  async search({ state, getters }, { keyword, reset }) {
    if (reset || keyword !== state.searchText) {
      state.searchText = keyword
      state.curPage = 1
    }
    keyword = keyword !== '' ? keyword : undefined
    const offset = (state.curPage - 1) * state.pageSize
    const titles = await findTitles({
      keyword,
      types: getters.types,
      nsfw: state.nsfw ? 1 : 0,
      concern: state.concern,
      offset,
      limit: state.pageSize
    })
    return titles
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
