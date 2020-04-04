<template>
  <div class="main-page">
    <div class="search-input">
      <search-input
        ckey="TitleSearchHistory"
        name="titleSearchInput"

        :value="searchText"
        :max="10"
        @input="updateSearchText"
        @search="search"
      />
    </div>
    <el-button v-if="role['editor']" @click="addTitle">添加作品</el-button>
    <el-switch v-if="role['adult']" :value="nsfw" active-text="NSFW" inactive-text="健全" @input="handleNsfw" />
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
      <el-table-column label="作品">
        <template slot-scope="scope">
          <el-popover
            placement="right-start"
            width="300"
            trigger="hover"
            :disabled="scope.row.pic==''"
          >
            <el-image
              style="width: 300px; height: 300px"
              :src="scope.row.pic"
              fit="scale-down"
            />
            <router-link slot="reference" :to="getTitleLink(scope.row.id)">
              {{ scope.row.names | nameFilter }}
            </router-link>
          </el-popover>
        </template>
      </el-table-column>
      <el-table-column label="发布时间" width="150" align="center">
        <template slot-scope="scope">
          {{ scope.row.release_time | dateFilter }}
        </template>
      </el-table-column>
      <el-table-column label="更新时间" width="200" align="center">
        <template slot-scope="scope">
          {{ scope.row.add_time | timeFilter }}
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
  components: {
    SearchInput: () => import('@/components/SearchInput')
  },
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
      listLoading: false
    }
  },
  computed: {
    ...mapState('title', [
      'total',
      'curPage',
      'searchText',
      'titles',
      'pageSize',
      'selectTypes',
      'nsfw'
    ]),
    ...mapGetters(['role', 'titleTypes']),
    ...mapGetters('title', ['typeMap']),
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
  created() {
    this.$store.dispatch('title/getTitleTypes').then(() => {
      this.pageChange(1)
    })
  },
  methods: {
    // 处理选择类型变化
    typesChange(types) {
      this.$store.commit('title/selectTypes', types)
    },
    // 处理搜索文本的变化
    updateSearchText(text) {
      this.$store.state.title.searchText = text
    },
    // 处理翻页
    pageChange(page) {
      this.$store.state.title.curPage = page
    },
    // 处理尺寸缩放
    handleSizeChange(size) {
      this.$store.state.title.pageSize = size
    },
    // 处理NSFW选项
    handleNsfw(nsfw) {
      this.$store.state.title.nsfw = nsfw
    },
    // 添加作品
    async addTitle() {
      this.$router.push({ name: 'ResourcesTitle' })
    },
    // 搜索
    async search(event) {
      this.listLoading = true
      await this.$store.dispatch('title/findTitles', {
        keyword: this.searchText,
        types: _.map(this.selectTypes, 'id'),
        nsfw: this.nsfw ? 1 : 0
      })
      this.listLoading = false
    },
    // 获取类型名称
    getTitleTypeName(typeid) {
      const obj = this.typeMap[typeid]
      return obj ? obj.name : '未知类型'
    },
    // 获取作品地址
    getTitleLink(id) {
      return {
        name: 'ResourcesTitle',
        query: { id }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.search-input {
    display: inline-block;
    height: 47px;
    width: 70%;
}
.main-page {
    margin:2%
  }
</style>

