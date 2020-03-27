<template>
  <div>
    <el-autocomplete
      v-model="searchText"
      class="search-input"
      :fetch-suggestions="getSearchHistory"
      placeholder="请输入搜索条件"
      clearable
      @keydown.enter="search"
    >
      <el-button slot="append" icon="el-icon-search" @click="search" />
    </el-autocomplete>
    <el-checkbox-group :value="selectTypes" size="medium" @input="typesChange">
      <el-checkbox-button v-for="type in titleTypes" :key="type.id" :label="type">{{ type.name }}</el-checkbox-button>
    </el-checkbox-group>
    <el-table
      v-loading="listLoading"
      :data="showTitles"
      element-loading-text="Loading"
      border
      fit
      highlight-current-row
    >
      <el-table-column align="center" label="分类" width="95">
        <template slot-scope="scope">
          {{ getTitleTypeName(scope.row.typeid) }}
        </template>
      </el-table-column>
      <el-table-column label="名字">
        <template slot-scope="scope">
          {{ scope.row.names | nameFilter }}
        </template>
      </el-table-column>
      <el-table-column label="发布时间" width="150" align="center">
        <template slot-scope="scope">
          {{ scope.row.release_time | dateFilter }}
        </template>
      </el-table-column>
      <el-table-column label="更新时间" width="200" align="center">
        <template slot-scope="scope">
          {{ scope.row.release_time | timeFilter }}
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      :current-page="curPage"
      :page-size="pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
      @current-change="pageChange"
      @size-change="handleSizeChange"
    />
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import { parseTime } from '@/utils'
import _ from 'lodash'

export default {
  name: 'ResourcesTitles',
  filters: {
    timeFilter(time) {
      return parseTime(time)
    },
    dateFilter(time) {
      return parseTime(time, '{y}/{m}')
    },
    nameFilter(names) {
      const list = names.split('\n')
      return list[0]
    }
  },
  data() {
    return {
      total: 0,
      curPage: 1,
      searchText: '',
      titles: [],
      listLoading: false
    }
  },
  computed: {
    ...mapState('title', [
      'pageSize',
      'selectTypes'
    ]),
    ...mapGetters([
      'titleTypes'
    ]),
    showTitles() {
      const showTitles = []
      const first = (this.curPage - 1) * this.pageSize
      const last = Math.min(this.total, first + this.pageSize)
      for (let i = first; i < last; i++) {
        showTitles.push(this.titles[i])
      }
      return showTitles
    }
  },
  mounted() {
    this.$store.dispatch('title/getTitleTypes').then(() => {
      this.pageChange(1)
    })
  },
  methods: {
    // 处理选择类型变化
    typesChange(types) {
      this.$store.commit('title/selectTypes', types)
    },
    // 处理翻页
    pageChange(page) {
      this.curPage = page
      console.log(this.curPage)
    },
    // 处理尺寸缩放
    handleSizeChange(size) {
      this.$store.state.title.pageSize = size
      console.log(this.pageSize)
    },
    // 获取搜索历史记录
    getSearchHistory(text, cb) {
      cb([{ value: 'aaa' }, { value: 'abc' }])
    },
    // 搜索
    async search() {
      this.listLoading = true
      const titles = await this.$store.dispatch('title/findTitles', {
        keyword: this.searchText,
        types: _.map(this.selectTypes, 'id'),
        nsfw: 0
      })
      console.log(titles)
      this.listLoading = false
      this.total = titles.length
      this.titles = titles
    },
    // 获取类型名称
    getTitleTypeName(typeid) {
      for (const cur of this.titleTypes) {
        if (typeid === cur.id) return cur.name
      }
      return '未知'
    }
  }
}
</script>

<style lang="scss" scoped>
.search-input {
    display: inline-block;
    height: 47px;
    width: 85%;
}
</style>

