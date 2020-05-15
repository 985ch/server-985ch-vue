<template>
  <div>
    <el-table
      :data="allGoods"
      border
      fit
      highlight-current-row
    >
      <el-table-column prop="id" label="ID" width="40" />
      <el-table-column prop="name" label="商品名" />
      <el-table-column label="价格" width="80">
        <template slot-scope="scope">
          <el-popover
            placement="bottom"
            width="150"
            trigger="click"
          >
            <span slot="reference">{{ scope.row.prices[0] }}</span>
            <div v-for="(value, index) in scope.row.prices" :key="index">
              {{ `${memberTypes[index]}:${value}元` }}
            </div>
          </el-popover>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="100" align="center">
        <template slot-scope="scope">
          <el-popover
            placement="bottom"
            width="400"
            trigger="click"
            :content="scope.row.info"
          >
            <i slot="reference" class="el-icon-view table-icon" />
          </el-popover>
          <i class="el-icon-edit table-icon" @click="showEditDlg(scope.row.id)" />
          <i v-if="scope.row.hide==0" class="el-icon-delete table-icon" @click="onHideRow(scope.row)" />
          <i v-else class="el-icon-document-add table-icon" @click="onShowRow(scope.row)" />
        </template>
      </el-table-column>
    </el-table>
    <div style="text-align:right">
      <el-button @click="showEditDlg(0)">添加商品</el-button>
    </div>
    <el-drawer
      :title="curGoodsName"
      :visible.sync="editMode"
      direction="btt"
      size="100%"
    >
      <el-form ref="form" status-icon :model="curGoods" :rules="rules" label-width="80px">
        <el-form-item label="商品名" prop="name">
          <el-input v-model="curGoods.name" />
        </el-form-item>
        <el-form-item label="价格" prop="prices">
          <div v-for="(value, index) in curGoods.prices" :key="index">
            <span>{{ memberTypes[index] }}</span>
            <el-input v-model="curGoods.prices[index]" class="price-input" />
          </div>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="curGoods.info" type="textarea" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onEditGoods">{{ curGoods.id===0?'添加':'修改' }}</el-button>
          <el-button @click="editMode=false">取消</el-button>
        </el-form-item>
      </el-form>
    </el-drawer>
  </div>
</template>

<script>
import { postGoods } from '@/api/psi'
import { mapGetters } from 'vuex'
import _ from 'lodash'

export default {
  name: 'PsiGoods',
  data() {
    const validatePrices = (rule, list, callback) => {
      for (const value of list) {
        const success = /^(([1-9][0-9]*)|(([0]\.\d{0,2}|[1-9][0-9]*\.\d{0,2})))$/.test(value)
        if (!success) {
          callback(new Error('所有金额必须是有效的数字'))
          return
        }
      }
      callback()
    }
    const validateName = (rule, value, callback) => {
      if (value.length > 50) {
        callback(new Error('名字太长'))
        return
      }
      const cur = this.curGoods
      const idx = _.findIndex(this.allGoods, obj => obj.name === value && obj.id !== cur.id)
      if (idx >= 0) {
        callback(new Error('名字不能和其他商品重复'))
      } else {
        callback()
      }
    }
    return {
      curID: 0,
      curGoodsName: '商品名字',
      editMode: false,
      curGoods: {
        id: 0,
        name: '新商品',
        info: '',
        hide: 0,
        prices: [888, 888, 888, 888, 888]
      },
      rules: {
        name: [{ validator: validateName, trigger: 'blur' }],
        prices: [{ validator: validatePrices, trigger: 'blur' }]
      }
    }
  },
  computed: {
    ...mapGetters('psi', ['allGoods', 'memberTypes'])
  },
  async created() {
    await this.$store.dispatch('psi/getAllGoods')
  },
  methods: {
    showEditDlg(id) {
      this.curID = id
      const obj = _.find(this.allGoods, obj => obj.id === this.curID) || {
        id: 0,
        name: '新商品',
        info: '',
        hide: 0,
        prices: [888, 888, 888, 888, 888]
      }
      this.curGoods = _.clone(obj)
      this.curGoodsName = `[${id === 0 ? '?' : id}]${this.curGoods.name}`
      this.editMode = true
    },
    onHideRow(data) {
      this.$confirm('确定要隐藏本条目吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info'
      }).then(() => {
        data.hide = 1
        return postGoods(data).then(() => {
          this.$store.commit('psi/saveGoods', data)
        })
      }).catch(() => {})
    },
    async onShowRow(data) {
      data.hide = 0
      await postGoods(data)
      this.$store.commit('psi/saveGoods', data)
    },
    onEditGoods() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          postGoods(this.curGoods).then(result => {
            this.$store.commit('psi/saveGoods', this.curID === 0 ? result : this.curGoods)
            this.editMode = false
          })
        }
      })
    }
  }
}
</script>

<style scoped>
.table-icon {
  font-size:20px;
}
.price-input {
  display:inline-block;
  width:100px;
}
</style>
