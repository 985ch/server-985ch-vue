import { getTitleTypes, findTitles } from '@/api/title'
import _ from 'lodash'

const state = {
  total: 0, // 总条目
  curPage: 1, // 当前页
  searchText: '', // 搜索字符串
  titles: [], // 作品列表
  nsfw: false,
  pageSize: 20, // 每页条目数
  selectTypes: [], // 选中的作品类型
  titleTypes: null // 所有作品类型
}

const getters = {
  typeMap(state) { // 作品类型映射数据
    return _.keyBy(state.titleTypes || [], 'id')
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
  selectTypes(state, types) { // 设置选中类型
    state.selectTypes = types
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
  async findTitles({ state }, { keyword, types, nsfw }) {
    keyword = keyword !== '' ? keyword : undefined
    const titles = await findTitles(keyword, JSON.stringify(types), nsfw)

    state.total = titles.length
    state.titles = titles
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
