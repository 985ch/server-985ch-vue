import Vue from 'vue'
import { getMembers, getGoods, getStorages } from '@/api/psi'
import _ from 'lodash'

// 保存状态的通用方法
function saveState(state, key, data) {
  const target = state[key]
  if (!target) {
    state[key] = [data]
  } else {
    const idx = _.findIndex(target, obj => obj.id === data.id)
    if (idx >= 0) {
      Vue.set(target, idx, data)
    } else {
      target.push(data)
    }
  }
}
// 从接口获取数据并存储到本地
async function getAndSave(state, key, func, force) {
  if (force || !state[key]) state[key] = await func()
  return state[key]
}

const state = {
  members: null, // 成员列表
  goods: null, // 商品列表
  storages: null // 仓库列表
}

const getters = {
  memberTypes() { return ['客户', '会员', '四级', '三级', '二级', '总代'] },
  storageTypes() { return ['自有', '代持', '寄存'] },
  logTypes() { return ['进货', '出货', '充值', '储值', '支出', '收入'] },
  logStatus() { return ['未完成', '完成'] },
  allMembers(state) { return state.members || [] },
  memberMap(state, getters) { return _.keyBy(getters.allMembers, 'id') },
  activeMembers(state, getters) { return _.filter(getters.allMembers, obj => obj.hide === 0) },
  activeSuppliers(state, getters) { return _.filter(getters.activeMembers, obj => obj.type === 1) },
  activeCustomers(state, getters) { return _.filter(getters.activeMembers, obj => obj.type === 0) },
  allGoods(state) { return state.goods || [] },
  goodsMap(state, getters) { return _.keyBy(getters.allGoods, 'id') },
  activeGoods(state, getters) { return _.filter(getters.allGoods, obj => obj.hide === 0) },
  allStorages(state) { return state.storages || [] },
  storageMap(state, getters) { return _.keyBy(getters.allStorages, 'id') },
  activeStorages(state, getters) { return _.filter(getters.allStorages, obj => obj.hide === 0) }
}

const mutations = {
  // 保存成员数据
  saveMember(state, data) { saveState(state, 'members', data) },
  // 保存商品数据
  saveGoods(state, data) { saveState(state, 'goods', data) },
  // 保存仓库数据
  saveStorage(state, data) { saveState(state, 'storages', data) }
}

const actions = {
  // 获取所有成员
  async getAllMembers({ state }, force) {
    return await getAndSave(state, 'members', getMembers, force)
  },
  // 获取所有商品
  async getAllGoods({ state }, force) {
    return await getAndSave(state, 'goods', getGoods, force)
  },
  // 获取所有仓库
  async getAllStorages({ state }, force) {
    return await getAndSave(state, 'storages', getStorages, force)
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}

