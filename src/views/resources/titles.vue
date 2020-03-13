<template>
  <div>
    <el-autocomplete
      v-model="searchText"
      class="search-input"
      :fetch-suggestions="getSearchHistory"
      placeholder="请输入搜索条件"
      clearable
      @select="handleSearchSelect"
    >
      <el-button slot="append" icon="el-icon-search" />
    </el-autocomplete>
    <el-checkbox-group v-model="selectTypes" size="medium">
      <el-checkbox-button v-for="type in titleTypes" :key="type.id" :label="type">{{ type.name }}</el-checkbox-button>
    </el-checkbox-group>
    <el-pagination
      :current-page="curPage"
      :page-size="pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
      @current-change="handlePageChange"
      @size-change="handleSizeChange"
    />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'ResourcesTitles',
  data() {
    return {
      total: 500,
      pageSize: 100,
      curPage: 1,
      searchText: '',
      selectTypes: [],
      titleTypes: [{ name: '动画', id: 1 }]
    }
  },
  computed: {
    ...mapGetters([
      'name'
    ])
  },
  methods: {
    handlePageChange(page) {
      this.curPage = page
      console.log(this.curPage)
    },
    handleSizeChange(size) {
      this.pageSize = size
      console.log(this.pageSize)
    },
    getSearchHistory(text, cb) {
      cb([{ value: 'aaa' }, { value: 'abc' }])
    },
    handleSearchSelect() {}
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

