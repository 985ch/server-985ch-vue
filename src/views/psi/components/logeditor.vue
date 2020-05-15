<template>
  <div>
    <el-form ref="form" size="small" :model="value" :rules="rules" label-width="80px">
      <el-form-item label="类型">
        <el-radio-group v-model="value.type" :disabled="value.id>0">
          <el-radio-button :label="0">购入</el-radio-button>
          <el-radio-button :label="1">售出</el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="交易对象">
        <member-input ref="memberInput" v-model="value.memberid" :type="value.type" prop="member" @level-change="levelChange" />
      </el-form-item>
      <el-form-item label="交易商品">
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
      <el-form-item label="邮费支出" prop="postage">
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
      'memberTypes', 'storageTypes', 'logStatus',
      'activeMembers', 'memberMap',
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
    goodsPriceChange(price) {
      this.$set(this.value, 'amount', price)
    },
    levelChange(level) {
      this.editLevel = level
    },
    async onCommit() {
      const cur = this.value
      if (cur.goods.length === 0) {
        this.$message({ type: 'error', message: '订单货物不能为空' })
        return
      }
      if (cur.memberid === 0) {
        const newMember = await this.addMember()
        if (!newMember) {
          this.$message({ type: 'error', message: '必须选择一个有效的交易对象' })
          return
        }
        cur.memberid = newMember.id
      }
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
