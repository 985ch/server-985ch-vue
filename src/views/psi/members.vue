<template>
  <div>
    <el-table
      :data="allMembers"
      border
      fit
      highlight-current-row
    >
      <el-table-column prop="id" label="ID" width="40" />
      <el-table-column prop="name" label="微信备注" />
      <el-table-column label="级别" width="100">
        <template slot-scope="scope">
          <span>{{ scope.row | levelFilter(memberTypes) }}</span>
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
      <el-button @click="showEditDlg(0)">添加用户</el-button>
    </div>
    <el-drawer
      :title="curMemberName"
      :visible.sync="editMode"
      direction="btt"
      size="100%"
    >
      <el-form ref="form" :model="curMember" :rules="rules" label-width="80px">
        <el-form-item label="微信备注" prop="name">
          <el-input v-model="curMember.name" :readonly="curMember.id===1" />
        </el-form-item>
        <el-form-item label="级别类型">
          <el-select v-model="curMember.level" class="level-select" placeholder="请选择级别">
            <el-option
              v-for="(value, index) in memberTypes"
              :key="value"
              :label="value"
              :value="index"
            />
          </el-select>
          <el-select v-show="curMember.id!==1" v-model="curMember.type" class="level-select" placeholder="请选择类型">
            <el-option label="下级" :value="0" />
            <el-option label="上级" :value="1" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="curMember.info" type="textarea" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onEditMember">{{ curMember.id===0?'添加':'修改' }}</el-button>
          <el-button @click="editMode=false">取消</el-button>
        </el-form-item>
      </el-form>
    </el-drawer>
  </div>
</template>

<script>
import { postMember } from '@/api/psi'
import { mapGetters } from 'vuex'
import _ from 'lodash'

export default {
  name: 'PsiMembers',
  filters: {
    levelFilter(member, memberTypes) {
      const level = memberTypes[member.level]
      return member.type === 2 ? level : `${level}(${member.type === 0 ? '下级' : '上级'})`
    }
  },
  data() {
    const validateName = (rule, value, callback) => {
      if (value.length > 50) {
        callback(new Error('名字太长'))
        return
      }
      const cur = this.curMember
      const idx = _.findIndex(this.allMembers, obj => obj.name === value && obj.id !== cur.id)
      if (idx >= 0) {
        callback(new Error('微信备注不能重名'))
      } else {
        callback()
      }
    }
    return {
      curID: 0,
      curMemberName: '新客户',
      editMode: false,
      curMember: {
        id: 0,
        name: '新客户',
        level: 0,
        type: 0,
        info: '',
        hide: 0
      },
      rules: {
        name: [{ validator: validateName, trigger: 'blur' }]
      }
    }
  },
  computed: {
    ...mapGetters('psi', ['memberTypes', 'allMembers'])
  },
  async created() {
    await this.$store.dispatch('psi/getAllMembers')
  },
  methods: {
    showEditDlg(id) {
      this.curID = id
      const obj = _.find(this.allMembers, obj => obj.id === this.curID) || {
        id: 0,
        name: '新客户',
        level: 0,
        type: 0,
        info: '',
        hide: 0
      }
      this.curMember = _.clone(obj)
      this.curMemberName = this.curMember.name
      this.editMode = true
    },
    onHideRow(data) {
      this.$confirm('确定要隐藏本条目吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info'
      }).then(() => {
        data.hide = 1
        return postMember(data).then(() => {
          this.$store.commit('psi/saveMember', data)
        })
      }).catch(() => {})
    },
    async onShowRow(data) {
      data.hide = 0
      await postMember(data)
      this.$store.commit('psi/saveMember', data)
    },
    onEditMember() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          postMember(this.curMember).then(result => {
            this.$store.commit('psi/saveMember', this.curID === 0 ? result : this.curMember)
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
.level-select {
    display: inline-block;
    width: 100px;
}
</style>
