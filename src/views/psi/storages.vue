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
      <el-table-column prop="type" label="归属" width="100">
        <template slot-scope="scope">
          <span>{{ memberMap[scope.row.memberid].name }}</span>
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
          <el-select v-model="curStorage.type" placeholder="请选择分类">
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
              v-for="obj in activeMembers"
              :key="obj.name"
              :label="obj.name"
              :value="obj.id"
            />
          </el-select>
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
        info: '',
        hide: 0
      },
      rules: {
        name: [{ validator: validateName, trigger: 'blur' }]
      }
    }
  },
  computed: {
    ...mapGetters('psi', ['storageTypes', 'allStorages', 'memberMap', 'activeMembers'])
  },
  async created() {
    await this.$store.dispatch('psi/getAllMembers')
    await this.$store.dispatch('psi/getAllStorages')
  },
  methods: {
    showEditDlg(id) {
      this.curID = id
      const obj = _.find(this.allStorages, obj => obj.id === this.curID) || {
        id: 0,
        name: '新仓库',
        type: 0,
        memberid: 1,
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
