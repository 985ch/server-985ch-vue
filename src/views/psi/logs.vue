<template>
  <div>
    <span>统计时间</span>
    <el-select v-model="curYear" style="width:100px" size="small">
      <el-option v-for="val in allYears" :key="val" :value="val" />
    </el-select>
    <el-select v-model="curMonth" style="width:100px" size="small">
      <el-option v-for="val in allMonth" :key="val" :value="val" />
    </el-select>
    <span :class="showData.profit | moneyStyleFilter">
      {{ `${showData.profit>0?'+':''}${showData.profit.toFixed(2)}元` }}
    </span>
    <div>
      <span class="income-box">收入{{ showData.income.toFixed(2) }}元</span>
      <span class="pay-box">支出{{ showData.pay.toFixed(2) }}元</span>
      <span :class="showData.saleProfit | moneyStyleFilter">利润{{ showData.saleProfit.toFixed(2) }}元</span>
    </div>
    <log-table
      :logs="logs"
      :show-logs="showLogs"
      @add-log="addLog"
      @set-log="setLog"
      @del-log="delLog"
    />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { getLogs } from '@/api/psi'
import _ from 'lodash'

export default {
  name: 'PsiLogs',
  filters: {
    moneyStyleFilter(money) {
      return money > 0 ? 'income-box' : 'pay-box'
    }
  },
  components: {
    LogTable: () => import('./components/logtable')
  },
  data() {
    return {
      logs: [],
      curYear: '',
      curMonth: '全年'
    }
  },
  computed: {
    ...mapGetters('psi', [
      'memberTypes', 'storageTypes', 'logStatus',
      'memberMap',
      'activeSuppliers', 'activeCustomers',
      'activeGoods', 'goodsMap',
      'activeStorages', 'storageMap'
    ]),
    groupLogs() {
      const now = new Date()
      const raw = this.logs
      const groupLogs = {
        [now.getFullYear()]: {
          [now.getMonth() + 1]: []
        }
      }

      for (const log of raw) {
        const logtime = new Date(log.logtime)
        const year = logtime.getFullYear()
        const month = logtime.getMonth() + 1
        const yearLogs = groupLogs[year] || {}
        groupLogs[year] = yearLogs
        if (yearLogs[month]) {
          yearLogs[month].push(log)
        } else {
          yearLogs[month] = [log]
        }
      }
      return groupLogs
    },
    allYears() {
      const years = _.keys(this.groupLogs)
      return years.sort((a, b) => a === b ? 0 : a > b ? -1 : 1)
    },
    allMonth() {
      const month = (_.keys(this.groupLogs[this.curYear])).sort((a, b) => a === b ? 0 : a > b ? -1 : 1)
      month.unshift('全年')
      return month
    },
    showLogs() {
      let logs
      const year = this.curYear
      const month = this.curMonth
      if (this.curMonth === '全年') {
        logs = _.concat(..._.values(this.groupLogs[year]))
      } else {
        logs = this.groupLogs[year][month]
      }
      return _.orderBy(logs, ['logtime'], ['desc']) || []
    },
    showData() {
      const logs = this.showLogs
      const amount = [0, 0, 0, 0, 0, 0]
      let postage = 0
      let saleProfit = 0
      const goods = {}
      const members = {}
      _.forEach(logs, log => {
        if (!log) return
        amount[log.type] += log.amount
        postage += log.postage
        if (log.type === 1) {
          saleProfit += log.amount - log.cost
        }

        const member = _.get(members, [log.memberid], { amount: [0, 0, 0, 0, 0, 0], postage: 0, goods: {}})
        member.amount[log.type] += log.amount
        member.postage += log.postage
        _.set(members, [log.memberid], member)

        _.forEach(log.goods, item => {
          const goodsData = _.get(goods, item.goodsid, { count: [0, 0, 0, 0, 0, 0], members: {}})
          goodsData.count[log.type] += item.num
          _.set(goods, item.goodsid, goodsData)

          const goodsMember = _.get(goodsData.members, log.memberid, [0, 0, 0, 0, 0, 0])
          goodsMember[log.type] += item.num
          _.set(goodsData.members, log.memberid, goodsMember)

          const memberGoods = _.get(member.goods, item.goodsid, [0, 0, 0, 0, 0, 0])
          memberGoods[log.type] += item.num
          _.set(member.goods, item.goodsid, memberGoods)
        })
      })
      const pay = amount[0] + amount[2] + amount[4] + postage
      const income = amount[1] + amount[3] + amount[5]
      return {
        amount,
        pay,
        income,
        profit: income - pay,
        saleProfit: saleProfit + amount[5] - postage - amount[4],
        postage,
        goods,
        members
      }
    }
  },
  async created() {
    await this.$store.dispatch('psi/getAllMembers')
    await this.$store.dispatch('psi/getAllGoods')
    await this.$store.dispatch('psi/getAllStorages')
    this.logs = await getLogs()
    this.curYear = (new Date()).getFullYear()
  },
  methods: {
    addLog(data) {
      this.logs.push(data)
    },
    setLog({ idx, data }) {
      this.$set(this.logs, idx, data)
    },
    delLog(idx) {
      this.logs.splice(idx, 1)
    }
  }
}
</script>

<style scoped>
.income-box {
  color:brown;
  margin-right: 20px;
}
.pay-box {
  color:darkgreen;
  margin-right: 20px;
}
</style>
