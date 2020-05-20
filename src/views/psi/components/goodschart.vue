<template>
  <div>
    <el-table
      :data="goodsList"
      border
      fit
    >
      <el-table-column label="商品">
        <template slot-scope="scope">
          {{ goodsMap[scope.row.id].name }}
        </template>
      </el-table-column>
      <el-table-column label="购入" width="80px">
        <template slot-scope="scope">
          <el-popover
            v-if="scope.row.buy>0"
            placement="bottom"
            trigger="hover"
          >
            <span slot="reference">{{ scope.row.buy }}</span>
            <div v-for="member in scope.row.memberBuy" v-show="member.count>0" :key="member.id">
              {{ member.id | memberFilter(memberMap, memberTypes) }}:{{ member.count }}
            </div>
          </el-popover>
          <div v-else>{{ scope.row.buy }}</div>
        </template>
      </el-table-column>
      <el-table-column label="售出" width="80px">
        <template slot-scope="scope">
          <el-popover
            v-if="scope.row.sale>0"
            placement="bottom"
            trigger="hover"
          >
            <span slot="reference">{{ scope.row.sale }}</span>
            <div v-for="member in scope.row.memberSale" v-show="member.count>0" :key="member.id">
              {{ member.id | memberFilter(memberMap, memberTypes) }}:{{ member.count }}
            </div>
          </el-popover>
          <div v-else>{{ scope.row.sale }}</div>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import _ from 'lodash'

export default {
  name: 'GoodsChart',
  filters: {
    memberFilter(id, memberMap, memberTypes) {
      const member = memberMap[id]
      return `${member.name}(${memberTypes[member.level]})`
    }
  },
  props: {
    data: { type: Object, required: true }
  },
  computed: {
    ...mapGetters('psi', ['memberMap', 'goodsMap', 'memberTypes']),
    goodsList() {
      const list = _.map(this.data, obj => {
        return {
          id: obj.id,
          sale: obj.count[1],
          buy: obj.count[0],
          memberBuy: _.filter(_.map(obj.members, obj => { return { id: obj.id, count: obj.num[0] } }), obj => obj.count > 0),
          memberSale: _.filter(_.map(obj.members, obj => { return { id: obj.id, count: obj.num[1] } }), obj => obj.count > 0)
        }
      })
      return _.orderBy(list, ['sale', 'id'], ['desc', 'asc'])
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
