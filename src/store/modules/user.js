import { login, logout, getInfo } from '@/api/user'
import { getToken, setToken, removeToken } from '@/utils/auth'
import { resetRouter } from '@/router'

const state = {
  token: getToken(),
  uid: null,
  qq: null,
  nick: null,
  roles: null,
  config: {}
}

const mutations = {
  SET_TOKEN: (state, token) => {
    state.token = token
    if (token !== '') {
      setToken(token)
    } else {
      removeToken()
      state.uid = null
      state.qq = null
      state.nick = null
      state.roles = null
      state.config = {}
    }
  },
  SET_USERINFO: (state, { userid, qq, nick, roles, config }) => {
    state.uid = userid
    state.qq = qq
    state.nick = (nick && nick !== '') ? nick : qq
    state.roles = roles
    state.config = config
  }
}

const actions = {
  // user login
  async login({ commit }, userInfo) {
    const { qq, code } = userInfo
    const token = await login(qq.trim(), code)
    commit('SET_TOKEN', token)
  },

  // get user info
  async getInfo({ commit, state }) {
    const data = await getInfo(state.token)
    commit('SET_USERINFO', data)
    return state
  },

  // user logout
  async logout({ commit, state, dispatch }) {
    await logout(state.token)
    commit('SET_TOKEN', '')
    resetRouter()

    // reset visited views and cached views
    // to fixed https://github.com/PanJiaChen/vue-element-admin/issues/2485
    dispatch('tagsView/delAllViews', null, { root: true })
  },

  // remove token
  async resetToken({ commit }) {
    await commit('SET_TOKEN', '')
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

