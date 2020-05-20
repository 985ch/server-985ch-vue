<template>
  <div>
    <el-table
      :data="memberList"
      border
      fit
      :row-style="rowStyle"
      row-key="id"
      :expand-row-keys="expandRow"
      @expand-change="expandChange"
    >
      <el-table-column type="expand">
        <template slot-scope="scope">
          <el-form size="mini" :model="scope.row" label-width="80px">
            <el-form-item label="收入">
              <el-popover
                placement="right"
                trigger="hover"
              >
                <span slot="reference" class="income-box">{{ scope.row.income.toFixed(2) }}元</span>
                <div class="income-box">
                  <div>出货收入{{ scope.row.amount[1].toFixed(2) }}元</div>
                  <div>储值收入{{ scope.row.amount[3].toFixed(2) }}元</div>
                  <div>其他收入{{ scope.row.amount[5].toFixed(2) }}元</div>
                </div>
              </el-popover>
            </el-form-item>
            <el-form-item label="支出">
              <el-popover
                placement="right"
                trigger="hover"
              >
                <span slot="reference" class="pay-box">{{ scope.row.pay.toFixed(2) }}元</span>
                <div class="pay-box">
                  <div>进货支出{{ scope.row.amount[0].toFixed(2) }}元</div>
                  <div>充值支出{{ scope.row.amount[2].toFixed(2) }}元</div>
                  <div>订单支出{{ scope.row.postage.toFixed(2) }}元</div>
                  <div>其他支出{{ scope.row.amount[4].toFixed(2) }}元</div>
                </div>
              </el-popover>
            </el-form-item>
            <el-form-item label="净利润">
              <el-popover
                placement="right"
                trigger="hover"
              >
                <span slot="reference" :class="scope.row.fiexedProfit<0?'pay-box':'income-box'">
                  {{ scope.row.fixedProfit.toFixed(2) }}元
                </span>
                <div>
                  <div class="income-box">销售利润{{ scope.row.profit.toFixed(2) }}元</div>
                  <div class="income-box">其他收入{{ scope.row.amount[5].toFixed(2) }}元</div>
                  <div class="pay-box">订单支出{{ scope.row.postage.toFixed(2) }}元</div>
                  <div class="pay-box">其他支出{{ scope.row.amount[4].toFixed(2) }}元</div>
                </div>
              </el-popover>
            </el-form-item>
            <el-form-item v-if="scope.row.goods.length>0" label="商品变动">
              <el-table :data="scope.row.goods" size="small">
                <el-table-column label="商品">
                  <template slot-scope="item">
                    {{ goodsMap[item.row.id].name }}
                  </template>
                </el-table-column>
                <el-table-column label="购入" width="60px">
                  <template slot-scope="item">
                    {{ item.row.num[0] }}
                  </template>
                </el-table-column>
                <el-table-column label="售出" width="60px">
                  <template slot-scope="item">
                    {{ item.row.num[1] }}
                  </template>
                </el-table-column>
              </el-table>
            </el-form-item>
          </el-form>
        </template>
      </el-table-column>
      <el-table-column label="交易对象">
        <template slot-scope="scope">
          {{ scope.row.id | memberFilter(memberMap, memberTypes) }}
        </template>
      </el-table-column>
      <el-table-column label="结余" width="120">
        <template slot-scope="scope">
          <span :class="scope.row.left>=0?'income-box':'pay-box'">
            {{ scope.row.left.toFixed(2) }}元
          </span>
        </template>
      </el-table-column>
      <el-table-column label="利润" width="100">
        <template slot-scope="scope">
          <span :class="scope.row.fixedProfit>=0?'income-box':'pay-box'">
            {{ scope.row.fixedProfit.toFixed(2) }}元
          </span>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import _ from 'lodash'

export default {
  name: 'MemberChart',
  filters: {
    memberFilter(id, memberMap, memberTypes) {
      const member = memberMap[id]
      return `${member.name}(${memberTypes[member.level]})`
    }
  },
  props: {
    data: { type: Object, required: true }
  },
  data() {
    return {
      expandRow: []
    }
  },
  computed: {
    ...mapGetters('psi', ['memberMap', 'goodsMap', 'memberTypes']),
    memberList() {
      const list = _.map(this.data, obj => {
        const amount = obj.amount
        const income = amount[1] + amount[3] + amount[5]
        const pay = amount[0] + amount[2] + amount[4] + obj.postage
        return {
          id: obj.id,
          amount,
          income,
          pay,
          left: income - pay,
          postage: obj.postage,
          profit: obj.profit,
          fixedProfit: obj.profit + amount[5] - obj.postage - amount[4],
          goods: _.map(obj.goods)
        }
      })
      return _.orderBy(list, ['fixedProfit', 'left', 'income', 'id'], ['desc', 'desc', 'desc', 'asc'])
    }
  },
  methods: {
    rowStyle(scope) {
      return {
        color: (scope.row.left < 0) ? 'darkgreen' : 'brown'
      }
    },
    expandChange({ id }) {
      const expanded = this.expandRow
      if (expanded[0] === id) {
        this.expandRow = []
      } else {
        this.expandRow = [id]
      }
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
