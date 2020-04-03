<template>
  <div>
    <search-input
      ckey="ResSearchHistory"
      name="resSearchInput"
      :value="searchText"
      :max="10"
      @input="updateSearchText"
      @search="search"
    />
    <el-table
      v-loading="listLoading"
      :data="resources"
      element-loading-text="Loading"
      height="400px"
      border
      fit
      highlight-current-row
      @row-click="selected"
    >
      <el-table-column align="center" label="源" width="95">
        <template slot-scope="scope">
          {{ scope.row.source }}
        </template>
      </el-table-column>
      <el-table-column label="路径">
        <template slot-scope="scope">
          {{ scope.row.path }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="已绑定" width="100">
        <template slot-scope="scope">
          {{ scope.row.bind }}
        </template>
      </el-table-column>
    </el-table>
    <div>
      {{ resName }}
      <el-select v-show="cur.id!==0" v-model="selectedPath" placeholder="选择子路径">
        <el-option
          v-for="item in pathList"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
      <el-button v-show="cur.id!==0" @click="bind">绑定</el-button>
    </div>
    <div class="file-list">
      <p v-for="file in files" :key="file">{{ file }}</p>
    </div>
  </div>
</template>
<script>
import { mapState, mapGetters } from 'vuex'
import _ from 'lodash'

export default {
  name: 'ResourcesList',
  components: {
    SearchInput: () => import('@/components/SearchInput')
  },
  data() {
    return {
      listLoading: false,
      cur: {
        id: 0,
        path: '',
        source: '',
        info: {}
      },
      selectedPath: ''
    }
  },
  computed: {
    ...mapState('resource', [
      'searchText',
      'resources'
    ]),
    ...mapGetters('resource', [
      'searchHistory'
    ]),
    resName() {
      const cur = this.cur
      if (cur.id === 0) return '请选择资源路径'
      return `${cur.path}(${cur.source})`
    },
    pathList() {
      const result = [{ label: '[不使用子目录]', value: '' }]
      if (this.cur.id === 0) return result
      const info = this.cur.info
      for (const key in info) {
        if (info[key].files) {
          result.push({ label: key, value: key })
        }
      }
      return result
    },
    files() {
      let info = this.cur.info
      if (this.selectedPath !== '') {
        info = info[this.selectedPath].files
      }
      return _.keys(info)
    }
  },
  methods: {
    async selected(row) {
      this.cur = await this.$store.dispatch('resource/getResource', row.id)
      this.selectedPath = ''
    },
    async search() {
      this.listLoading = true
      await this.$store.dispatch('resource/findResources', this.searchText)
      this.listLoading = false
    },
    updateSearchText(value) {
      this.$store.state.resource.searchText = value
    },
    bind() {
      this.$confirm('确定要将资源绑定到当前作品吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info'
      }).then(() => {
        this.$emit('bind', { id: this.cur.id, folder: this.selectedPath })
      }).catch(() => {})
    }
  }
}
</script>
<style lang="scss" scoped>
.file-list {
    font-size: 12px;
    color:dimgrey;
}
</style>
