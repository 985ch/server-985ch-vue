<template>
  <div>
    <el-table
      :data="allStorages"
      border
      fit
      highlight-current-row
    >
      <el-table-column prop="id" label="ID" width="40" />
      <el-table-column prop="name" label="仓库名" />
      <el-table-column prop="type" label="分类" width="70">
        <template slot-scope="scope">
          <span>{{ storageTypes[scope.row.type] }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="balance" label="余额" width="80">
        <template slot-scope="scope">
          <el-popover
            placement="bottom"
            width="200"
            trigger="click"
            :content="`归属：${memberMap[scope.row.memberid].name}`"
          >
            <span slot="reference">{{ scope.row.memberid===1?'-':scope.row.balance }}</span>
          </el-popover>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="100" align="center">
        <template slot-scope="scope">
          <el-popover
            placement="bottom"
            width="350"
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
      <el-button @click="showEditDlg(0)">添加仓库</el-button>
    </div>
    <el-drawer
      :title="curStorageName"
      :visible.sync="editMode"
      direction="btt"
      size="100%"
    >
      <el-form ref="form" :model="curStorage" :rules="rules" label-width="80px">
        <el-form-item label="仓库名" prop="name">
          <el-input v-model="curStorage.name" />
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="curStorage.type" placeholder="请选择分类" @change="onTypeChange">
            <el-option
              v-for="(value,index) in storageTypes"
              :key="value"
              :label="value"
              :value="index"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="归属">
          <el-select v-model="curStorage.memberid" filterable placeholder="请选择成员">
            <el-option
              v-for="obj in optionMembers"
              :key="obj.name"
              :label="obj.name"
              :value="obj.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="余额">
          <el-input v-model="curStorage.balance" :disabled="curStorage.type===0" type="number" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="curStorage.info" type="textarea" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onEditStorage">{{ curStorage.id===0?'添加':'修改' }}</el-button>
          <el-button @click="editMode=false">取消</el-button>
        </el-form-item>
      </el-form>
    </el-drawer>
  </div>
</template>

<script>
import { postStorage } from '@/api/psi'
import { mapGetters } from 'vuex'
import _ from 'lodash'

export default {
  name: 'PsiStorages',
  data() {
    const validateName = (rule, value, callback) => {
      if (value.length > 50) {
        callback(new Error('名字太长'))
        return
      }
      const cur = this.curStorage
      const idx = _.findIndex(this.allStorages, obj => obj.name === value && obj.id !== cur.id)
      if (idx >= 0) {
        callback(new Error('仓库不能重名'))
      } else {
        callback()
      }
    }
    return {
      curID: 0,
      curStorageName: '新仓库',
      editMode: false,
      curStorage: {
        id: 0,
        name: '新仓库',
        type: 0,
        memberid: 1,
        balance: 0,
        info: '',
        hide: 0
      },
      rules: {
        name: [{ validator: validateName, trigger: 'blur' }]
      }
    }
  },
  computed: {
    ...mapGetters('psi', ['storageTypes', 'allStorages', 'memberMap', 'activeMembers']),
    optionMembers() {
      const members = this.activeMembers
      const type = this.curStorage.type
      let result
      if (type === 0) {
        result = this.memberMap[1] ? [this.memberMap[1]] : []
      } else if (type === 1) {
        result = _.filter(members, obj => obj.type === 0)
      } else {
        result = _.filter(members, obj => obj.type === 1)
      }
      return result
    }
  },
  async created() {
    await this.$store.dispatch('psi/getAllMembers')
    await this.$store.dispatch('psi/getAllStorages', true)
  },
  methods: {
    showEditDlg(id) {
      this.curID = id
      const obj = _.find(this.allStorages, obj => obj.id === this.curID) || {
        id: 0,
        name: '新仓库',
        type: 0,
        memberid: 1,
        balance: 0,
        info: '',
        hide: 0
      }
      this.curStorage = _.clone(obj)
      this.curStorageName = this.curStorage.name
      this.editMode = true
    },
    onHideRow(data) {
      this.$confirm('确定要隐藏本条目吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info'
      }).then(() => {
        data.hide = 1
        return postStorage(data).then(() => {
          this.$store.commit('psi/saveStorage', data)
        })
      }).catch(() => {})
    },
    onTypeChange(type) {
      if (type === 0) {
        this.$set(this.curStorage, 'balance', 0)
      }
      this.$set(this.curStorage, 'memberid', this.optionMembers[0].id)
    },
    async onShowRow(data) {
      data.hide = 0
      await postStorage(data)
      this.$store.commit('psi/saveStorage', data)
    },
    onEditStorage() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          postStorage(this.curStorage).then(result => {
            this.$store.commit('psi/saveStorage', this.curID === 0 ? result : this.curStorage)
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
</style>
