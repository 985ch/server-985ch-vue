import { getTitleTypes, findTitles } from '@/api/title'

const state = {
  pageSize: 20,
  selectTypes: [],
  titleTypes: null
}

const mutations = {
  selectAll(state) {
    const selected = []
    for (const cur of state.titleTypes) {
      selected.push(cur)
    }
    state.selectTypes = selected
  },
  selectTypes(state, types) {
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
    return await findTitles(keyword !== '' ? keyword : undefined, JSON.stringify(types), nsfw)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
