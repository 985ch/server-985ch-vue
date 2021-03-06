<template>
  <div>
    <el-form ref="form" size="small" :model="value" :rules="rules" label-width="80px">
      <el-form-item label="类型">
        <el-radio-group v-model="value.type" :disabled="value.id>0">
          <el-radio-button v-for="(type, index) in logTypes" :key="index" :label="index">{{ type }}</el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="交易对象">
        <member-input
          ref="memberInput"
          v-model="value.memberid"
          :type="value.type"
          prop="member"
          @level-change="levelChange"
        />
      </el-form-item>
      <el-form-item v-if="value.type<4" label="仓库">
        <el-select v-model="value.storeid" placeholder="请选择仓库">
          <el-option
            v-for="item in activeStorages"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item v-if="value.type<2" label="交易商品">
        <goods-input
          v-model="value.goods"
          :type="value.type"
          :level="memberLevel"
          prop="goods"
          @price-change="goodsPriceChange"
        />
      </el-form-item>
      <el-form-item label="交易金额" prop="amount">
        <el-input v-model="value.amount" type="number" />
      </el-form-item>
      <el-form-item v-show="value.type===1" label="商品成本" prop="cost">
        <el-input v-model="value.cost" type="number" />
      </el-form-item>
      <el-form-item v-show="value.type<2" label="订单支出" prop="postage">
        <el-input v-model="value.postage" type="number" />
      </el-form-item>
      <el-form-item label="交易时间" prop="logtime">
        <el-date-picker v-model="value.logtime" type="datetime" placeholder="选择日期时间" />
      </el-form-item>
      <el-form-item label="备注">
        <el-input v-model="value.info" type="textarea" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onCommit">提交</el-button>
        <el-button @click="onCancel">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { postMember, newLog, editLog } from '@/api/psi'

export default {
  name: 'LogEditor',
  components: {
    MemberInput: () => import('./memberinput'),
    GoodsInput: () => import('./goodsinput')
  },
  props: {
    value: { type: Object, required: true }
  },
  data() {
    return {
      rules: {},
      editLevel: 0
    }
  },
  computed: {
    ...mapGetters('psi', [
      'memberTypes', 'storageTypes', 'logTypes', 'logStatus',
      'memberMap',
      'activeSuppliers', 'activeCustomers',
      'activeGoods', 'goodsMap',
      'activeStorages', 'storageMap'
    ]),
    memberLevel() {
      const memberMap = this.memberMap
      const member = memberMap[this.value.type === 0 ? 1 : this.value.memberid]
      if (!member) return this.editLevel
      return member.level
    }
  },
  mounted() {
    this.editLevel = this.memberMap[this.value.memberid].level
  },
  methods: {
    goodsPriceChange({ price, cost }) {
      this.$set(this.value, 'amount', price)
      this.$set(this.value, 'cost', cost)
    },
    levelChange(level) {
      this.editLevel = level
    },
    async onCommit() {
      const cur = this.value
      if (cur.type < 2 && cur.goods.length === 0) {
        this.$message({ type: 'error', message: '订单货物不能为空' })
        return
      }
      if (cur.type >= 2) cur.goods = []
      if (cur.type !== 1) cur.cost = 0
      if (cur.type >= 2) cur.postage = 0
      if (cur.type >= 4) cur.storeid = 0
      if (cur.memberid === 0) {
        const newMember = await this.addMember()
        if (!newMember) {
          this.$message({ type: 'error', message: '必须选择一个有效的交易对象' })
          return
        }
        cur.memberid = newMember.id
      }
      if (cur.logtime instanceof Date)cur.logtime = cur.logtime.toString()
      if (cur.id === 0) {
        const result = await newLog(cur)
        cur.id = result.id
      } else {
        await editLog(cur)
      }
      this.$emit('commit', true)
    },
    addMember() {
      const newMember = this.$refs.memberInput.newMember()
      if (newMember.name === '') return
      return this.$confirm(`即将添加新的交易对象[${newMember.name}], 确定吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        return postMember(newMember).then(result => {
          this.$store.commit('psi/saveMember', result)
          newMember.id = result.id
          return result
        })
      }).catch(() => {
        return
      })
    },
    onCancel() {
      this.$emit('commit', false)
    }
  }
}
</script>

<style scoped>
</style>
