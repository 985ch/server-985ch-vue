<template>
  <div>
    <el-table
      :data="storeGoods"
      border
      fit
      highlight-current-row
    >
      <el-table-column type="expand">
        <template slot-scope="scope">
          <el-table :data="scope.row.stores" :show-header="false" :border="false" stripe>
            <el-table-column label="ID" width="40">
              <template slot-scope="item">
                <span>{{ storageMap[item.row.storeid].id }}</span>
              </template>
            </el-table-column>
            <el-table-column label="仓库">
              <template slot-scope="item">
                <span>{{ storageMap[item.row.storeid].name }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="num" label="数量" width="70" />
            <el-table-column label="操作" width="70">
              <template slot-scope="item">
                <el-button
                  size="small"
                  type="text"
                  @click="showEditDlg(item.row.goodsid, item.row.storeid, item.row.num)"
                >修改</el-button>
              </template>
            </el-table-column>
          </el-table>
        </template>
      </el-table-column>
      <el-table-column prop="id" label="ID" width="40" />
      <el-table-column prop="name" label="商品名" />
      <el-table-column prop="count" label="总库存" width="70" />
    </el-table>
    <div style="text-align:right">
      <el-button @click="showEditDlg(0,0,0)">设置库存</el-button>
    </div>
    <el-drawer
      title="设置库存"
      :visible.sync="editMode"
      direction="btt"
      size="100%"
    >
      <div>
        <span>商品</span>
        <el-select v-model="curStore.goodsid" placeholder="请选择商品">
          <el-option
            v-for="item in storeGoods"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </div>
      <div>
        <span>仓库</span>
        <el-select v-model="curStore.storeid" placeholder="请选择仓库">
          <el-option
            v-for="item in activeStorages"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </div>
      <div>
        <span>数量</span>
        <el-input-number v-model="curStore.num" :min="0" />
      </div>
      <div style="text-align:center">
        <el-button type="primary" @click="onEditStore">提交</el-button>
        <el-button @click="editMode=false">取消</el-button>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { getStore, postStore } from '@/api/psi'
import _ from 'lodash'

export default {
  name: 'PsiStore',
  data() {
    return {
      storeList: null,
      editMode: false,
      curStore: {
        storeid: 1,
        goodsid: 1,
        num: 0
      }
    }
  },
  computed: {
    ...mapGetters('psi', ['allGoods', 'goodsMap', 'activeStorages', 'storageMap']),
    storeGoods() {
      const result = []
      const goods = this.allGoods
      const storageMap = this.storageMap
      const store = _.filter(this.storeList, obj => obj.num > 0 || storageMap[obj.storeid].hide === 0)
      const storeGroup = _.groupBy(store, 'goodsid')
      for (const item of goods) {
        const goodsStore = storeGroup[item.id] || []
        const count = _.reduce(goodsStore, (sum, obj) => sum + obj.num, 0)
        if (item.hide === 0 || count > 0) {
          result.push({
            id: item.id,
            name: item.name,
            prices: item.prices,
            stores: goodsStore,
            count
          })
        }
      }
      return result
    }
  },
  async created() {
    await this.$store.dispatch('psi/getAllGoods')
    await this.$store.dispatch('psi/getAllStorages')
    this.storeList = await getStore()
  },
  methods: {
    showEditDlg(goodsid, storeid, num) {
      if (goodsid && storeid) {
        this.curStore = { storeid, goodsid, num }
      } else {
        this.curStore = _.clone(this.storeList[0])
      }
      this.editMode = true
    },
    async onEditStore() {
      const data = this.curStore
      const list = this.storeList
      await postStore(data)
      const idx = _.findIndex(list, obj => obj.storeid === data.storeid && obj.goodsid === data.goodsid)
      if (idx > 0) {
        this.$set(list, idx, data)
      } else {
        list.push(data)
      }
      this.editMode = false
    }
  }
}
</script>

<style scoped>
.table-icon{
  color:crimson;
}
</style>
