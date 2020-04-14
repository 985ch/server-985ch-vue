<template>
  <div class="main-page">
    <div class="search-input">
      <search-input
        v-model="keyword"
        ckey="TitleSearchHistory"
        :max="10"
        @search="search"
      />
    </div>
    <el-button v-if="role['editor']" @click="addTitle">添加作品</el-button>
    <el-switch v-if="role['adult']" v-model="curNsfw" active-text="NSFW" inactive-text="健全" />
    <el-checkbox-group v-model="curTypes" size="medium">
      <el-checkbox-button v-for="type in titleTypes" :key="type.id" :label="type">{{ type.name }}</el-checkbox-button>
    </el-checkbox-group>
    <title-list :raw="data.rows" :total="data.count" @pagination="search" />
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'

export default {
  name: 'ResourcesTitles',
  components: {
    SearchInput: () => import('@/components/SearchInput'),
    TitleList: () => import('@/components/TitleList')
  },
  data() {
    return {
      listLoading: false,
      keyword: '',
      data: {
        rows: [],
        count: 0
      }
    }
  },
  computed: {
    ...mapGetters(['role', 'titleTypes']),
    ...mapState('title', ['searchText', 'selectTypes', 'nsfw']),
    ...mapGetters('title', ['typeMap']),
    curNsfw: {
      get() { return this.nsfw },
      set(val) { this.$store.commit('title/setState', { key: 'nsfw', val }) }
    },
    curTypes: {
      get() { return this.selectTypes || [] },
      set(val) { this.$store.commit('title/setState', { key: 'selectTypes', val }) }
    }
  },
  created() {
    this.$store.dispatch('title/getTitleTypes').then(() => {
      this.keyword = this.searchText
      this.search()
    })
  },
  methods: {
    // 添加作品
    async addTitle() {
      this.$router.push({ name: 'ResourcesTitle' })
    },
    // 搜索
    async search() {
      this.data = await this.$store.dispatch('title/search', this.keyword)
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

