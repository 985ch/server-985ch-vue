<template>
  <div>
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
  name: 'ResourcesImages',
  data() {
    return {
      total: 500,
      pageSize: 100,
      curPage: 1
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
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
