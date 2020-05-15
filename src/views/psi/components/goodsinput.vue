<template>
  <div>
    <el-table
      v-show="showGoods.length>0"
      size="small"
      :data="showGoods"
      :show-header="false"
      style="width: 100%"
      @row-click="goodsSelect"
    >
      <el-table-column label="商品">
        <template slot-scope="scope">
          <span>{{ `${goodsMap[scope.row.goodsid].name}(${storageMap[scope.row.storeid].name})` }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="num" label="数量" width="80" />
    </el-table>
    <el-dialog
      :title="editDlgTitle"
      :visible.sync="showDlg"
      :modal="false"
      width="350px"
    >
      <el-form :model="editGoods" label-width="80px">
        <el-form-item label="商品">
          <el-select
            v-model="editGoods.goodsid"
            placeholder="请选择商品"
            :disabled="isEdit"
          >
            <el-option
              v-for="item in activeGoods"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="仓库">
          <el-select
            v-model="editGoods.storeid"
            placeholder="请选择仓库"
            :disabled="isEdit"
          >
            <el-option
              v-for="item in activeStorages"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="数量">
          <el-input-number v-model="editGoods.num" class="number-input" :min="0" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="commitGoods">提交</el-button>
          <el-button @click="showDlg=false">取消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
    <el-button @click="addGoods">添加</el-button>
  </div>

</template>

<script>
import { mapGetters } from 'vuex'
import _ from 'lodash'

export default {
  name: 'GoodsInput',
  props: {
    value: { type: Array, required: true },
    type: { type: Number, default: 0 }
  },
  data() {
    return {
      editGoods: {
        goodsid: '',
        storeid: '',
        num: 0
      },
      isEdit: false,
      showDlg: false
    }
  },
  computed: {
    ...mapGetters('psi', ['activeStorages', 'storageMap', 'allGoods', 'activeGoods', 'goodsMap']),
    newGoods() {
      const goods = this.value
      return _.filter(this.activeGoods, obj => _.every(goods, item => item.goodsid !== obj.id))
    },
    showGoods() {
      return _.sortBy(_.filter(this.list, obj => obj.num > 0), 'goodsid')
    },
    list: {
      get() { return this.value },
      set(val) { this.$emit('input', val) }
    },
    goodsIdx() {
      const edit = this.editGoods
      return _.findIndex(this.list, obj => obj.goodsid === edit.goodsid && obj.storeid === edit.storeid && obj.num > 0)
    },
    editDlgTitle() {
      return this.goodsIdx >= 0 ? '修改商品数量' : '添加商品'
    }
  },
  methods: {
    addGoods() {
      const showGoods = this.showGoods
      const goods = _.find(this.activeGoods, obj => _.every(showGoods, item => item.goodsid !== obj.id))
      this.editGoods = {
        goodsid: this.goodsid = goods ? goods.id : this.activeGoods[0].id,
        storeid: this.storeid = this.activeStorages[0].id,
        num: 0
      }
      this.isEdit = false
      this.showDlg = true
    },
    goodsSelect(row) {
      this.editGoods = _.clone(row)
      this.isEdit = true
      this.showDlg = true
    },
    commitGoods() {
      const cur = this.editGoods
      const idx = this.goodsIdx
      if (idx >= 0) {
        if (cur.num > 0) {
          this.$set(this.list, idx, cur)
        } else {
          this.list.splice(idx, 1)
        }
      } else if (cur.num > 0) {
        this.list.push(cur)
      }
      this.showDlg = false
    }
  }
}
</script>

<style scoped>
</style>
