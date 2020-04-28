<template>
  <div class="main-page">
    <el-row>
      <el-col :xs="24" :sm="16" :md="16" :lg="18" :xl="20">
        <search-input
          v-model="keyword"
          ckey="TitleSearchHistory"
          :max="10"
          @search="search(true)"
        />
      </el-col>
      <el-col :xs="16" :sm="5" :md="4" :lg="4" :xl="2">
        <el-button
          v-if="role['adult']"
          :type="curConcern==2?'success':curConcern==1?'primary':'info'"
          @click="curConcern=(curConcern+1)%3"
        >{{ curConcern?'关注':'全部' }}</el-button>
        <el-button
          v-if="role['adult']"
          type="text"
          @click="curNsfw=!curNsfw"
        >{{ curNsfw?'NSFW':'SAFE' }}</el-button>
      </el-col>
      <el-col :xs="8" :sm="3" :md="4" :lg="2" :xl="2" class="right-align">
        <el-button v-if="role['editor']" @click="addTitle">添加作品</el-button>
      </el-col>
    </el-row>
    <el-checkbox-group v-model="curTypes" size="medium">
      <el-checkbox-button v-for="type in titleTypes" :key="type.id" :label="type">{{ type.name }}</el-checkbox-button>
    </el-checkbox-group>
    <title-list :raw="data.rows" :total="data.count" @pagination="search(false)" />
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
    ...mapState('title', ['searchText', 'selectTypes', 'nsfw', 'concern']),
    ...mapGetters('title', ['typeMap']),
    curNsfw: {
      get() { return this.nsfw },
      set(val) { this.$store.commit('title/setState', { key: 'nsfw', val }) }
    },
    curTypes: {
      get() { return this.selectTypes || [] },
      set(val) { this.$store.commit('title/setState', { key: 'selectTypes', val }) }
    },
    curConcern: {
      get() { return this.concern },
      set(val) { this.$store.commit('title/setState', { key: 'concern', val }) }
    }
  },
  created() {
    this.$store.dispatch('title/getTitleTypes').then(() => {
      this.keyword = this.searchText
      this.search(false)
    })
  },
  methods: {
    // 添加作品
    async addTitle() {
      this.$router.push({ name: 'ResourcesTitle' })
    },
    // 搜索
    async search(reset = true) {
      this.data = await this.$store.dispatch('title/search', { keyword: this.keyword, reset })
    }
  }
}
</script>

<style lang="scss" scoped>
  .main-page {
    margin:2%
  }
  .right-align {
    text-align: right;
  }
</style>

