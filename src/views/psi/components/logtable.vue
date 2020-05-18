<template>
  <div>
    <el-table :data="showLogs" border fit :row-style="rowStyle">
      <el-table-column type="expand">
        <template slot-scope="scope">
          <el-form size="mini" :model="scope.row" label-width="80px">
            <el-form-item label="交易编号">{{ scope.row.id }}</el-form-item>
            <el-form-item label="交易对象">{{ memberMap[scope.row.memberid].name }}</el-form-item>
            <el-form-item v-if="scope.row.type<4" label="仓库">{{ scope.row.storeid | storeFilter(storageMap) }}</el-form-item>
            <el-form-item v-if="scope.row.type<2" label="交易商品">
              <div v-for="item in scope.row.goods" :key="`${item.goodsid}_${item.storeid}`">
                <span>{{ `${goodsMap[item.goodsid].name} × ${item.num}` }}</span>
              </div>
            </el-form-item>
            <el-form-item label="交易金额">{{ scope.row.amount }}元</el-form-item>
            <el-form-item label="商品成本">{{ scope.row.cost }}元</el-form-item>
            <el-form-item label="邮费支出">{{ scope.row.postage }}元</el-form-item>
            <el-form-item v-show="scope.row.info!=''" label="备注">{{ scope.row.info }}</el-form-item>
            <el-form-item class="form-bottom">
              <el-button type="primary" @click="showEditDlg(scope.row)">修改</el-button>
              <el-button @click="delLogDlg(scope.row.id)">删除</el-button>
            </el-form-item>
          </el-form>
        </template>
      </el-table-column>
      <el-table-column label="类型" width="60">
        <template slot-scope="scope">
          {{ logTypes[scope.row.type] }}
        </template>
      </el-table-column>
      <el-table-column label="交易时间">
        <template slot-scope="scope">
          {{ scope.row.logtime | timeFilter }}
        </template>
      </el-table-column>
      <el-table-column label="交易金额" width="120">
        <template slot-scope="scope">
          {{ scope.row | amountFilter }}
        </template>
      </el-table-column>
    </el-table>
    <div style="text-align:right">
      <el-button @click="showEditDlg()">添加记录</el-button>
    </div>
    <el-drawer
      :visible.sync="editMode"
      :with-header="false"
      direction="btt"
      size="100%"
    >
      <log-editor v-model="curLog" :show.sync="editMode" @commit="onCommited" />
    </el-drawer>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { delLog } from '@/api/psi'
import { parseTime } from '@/utils'
import _ from 'lodash'

export default {
  name: 'LogTable',
  filters: {
    timeFilter(time) {
      return parseTime(time)
    },
    amountFilter(row) {
      const isSale = row.type === 1
      const amount = row.amount + row.postage * (isSale ? -1 : 1)
      return `${isSale ? '+' : '-'}${amount.toFixed(2)}元`
    },
    storeFilter(storeid, storageMap) {
      const store = storageMap[storeid]
      if (store) return store.name
      return '-'
    }
  },
  components: {
    LogEditor: () => import('./logeditor')
  },
  props: {
    logs: { type: Array, required: true },
    showLogs: { type: Array, required: true }
  },
  data() {
    return {
      curLog: {
        id: 0,
        type: 1,
        memberid: 1,
        amount: 0,
        postage: 0,
        info: '',
        logtime: new Date(),
        status: 1,
        goods: []
      },
      editMode: false
    }
  },
  computed: {
    ...mapGetters('psi', ['memberMap', 'activeCustomers', 'storageMap', 'goodsMap', 'logTypes'])
  },
  methods: {
    showEditDlg(row) {
      if (row) {
        this.curLog = _.cloneDeep(row)
      } else {
        this.curLog = {
          id: 0,
          type: 1,
          memberid: this.activeCustomers[0].id,
          amount: 0,
          postage: 0,
          info: '',
          logtime: new Date(),
          status: 1,
          goods: []
        }
      }
      this.editMode = true
    },
    onCommited(success) {
      if (success) {
        const cur = this.curLog
        cur.amount = _.toNumber(cur.amount)
        cur.postage = _.toNumber(cur.postage)
        const idx = _.findIndex(this.logs, obj => obj.id === cur.id)
        if (idx >= 0) {
          this.$emit('set-log', { idx, data: cur })
        } else {
          this.$emit('add-log', cur)
        }
      }
      this.editMode = false
    },
    rowStyle(scope) {
      return {
        color: scope.row.type === 0 ? 'darkgreen' : 'brown'
      }
    },
    delLogDlg(id) {
      this.$confirm('此操作将永久删除该记录, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        return delLog(id).then(() => {
          const idx = _.findIndex(this.logs, obj => obj.id === id)
          this.$emit('del-log', idx)
        })
      }).catch(() => { })
    }
  }
}
</script>

<style scoped>
.form-bottom {
  text-align:center;
}
</style>
