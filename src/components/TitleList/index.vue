<template>
  <div>
    <div v-if="mobileMode">
      <el-card v-for="item in raw" :key="item.id">
        <img
          class="image"
          :src="item.id | imageUrl(imageLoaded)"
          fit="scale-down"
          @click="handleShow(item)"
        >
        <div style="padding: 14px;">
          <router-link :to="item.id | titleLink" :style="item.like | likeStyle">
            <i v-show="item.concern" class="el-icon-warning" />
            {{ item.names | nameFilter }}
            <span class="time">({{ item.release_time | dateFilter }})</span>
          </router-link>
          <div class="bottom clearfix">
            <time class="time">更新时间：{{ item.add_time | timeFilter }} 资源：{{ item.count }}</time>
          </div>
        </div>
      </el-card>
    </div>
    <el-table
      v-else
      v-loading="listLoading"
      :data="raw"
      element-loading-text="Loading"
      border
      fit
      highlight-current-row
    >
      <el-table-column align="center" label="分类" width="95">
        <template slot-scope="scope">
          {{ scope.row.typeid | titleTypeName(typeMap) }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="喜好" width="80">
        <template slot-scope="scope">
          <span :style="scope.row.like | likeStyle">{{ scope.row.like | likeText }}</span>
        </template>
      </el-table-column>
      <el-table-column label="作品">
        <template slot-scope="scope">
          <el-popover
            placement="right-start"
            trigger="hover"
            :disabled="scope.row.pic==''"
            @show="handleShow(scope.row)"
          >
            <img class="image" :src="scope.row.id | imageUrl(imageLoaded)" fit="scale-down">
            <router-link
              slot="reference"
              :to="scope.row.id | titleLink"
              :style="scope.row.concern===1?'color:royalblue':'color:dimgrey'"
            >
              <i v-show="scope.row.concern" class="el-icon-warning" />
              {{ scope.row.names | nameFilter }}
            </router-link>
          </el-popover>
        </template>
      </el-table-column>
      <el-table-column label="资源" width="60" align="center">
        <template slot-scope="scope">
          {{ scope.row.count }}
        </template>
      </el-table-column>
      <el-table-column label="发布时间" width="100" align="center">
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
    <pagination :total="total" :page.sync="curPage" :limit.sync="pageLimit" @pagination="handlePageChange" />
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import { parseTime } from '@/utils'
import _ from 'lodash'

const likeInfo = [
  { text: '一般', style: 'color:dimgrey' },
  { text: '喜欢', style: 'color:darkblue' },
  { text: '不喜', style: 'color:grey' },
  { text: '未看', style: 'color:brown' }
]

export default {
  name: 'Pagination',
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
    },
    titleTypeName(typeid, typeMap) {
      const obj = typeMap[typeid]
      return obj ? obj.name : '未知类型'
    },
    titleLink(id) {
      return { name: 'ResourcesTitle', query: { id }}
    },
    likeText(val) {
      return likeInfo[val || 0].text
    },
    likeStyle(val) {
      return likeInfo[val || 0].style
    },
    imageUrl(id, imageLoaded) {
      if (imageLoaded[id] === '') return require('@/assets/default.jpg')
      return imageLoaded[id] || require('@/assets/logo.jpg')
    }
  },
  components: {
    pagination: () => import('@/components/Pagination')
  },
  props: {
    raw: { type: Array, required: true }, // 当前页的列表源数据
    total: { type: Number, default: 0 } // 总条目
  },
  data() {
    return {
      listLoading: false
    }
  },
  computed: {
    ...mapState('settings', ['mobileMode']),
    ...mapState('title', ['imageLoaded']),
    ...mapGetters('title', ['typeMap']),
    data() {
      return _.map(this.raw, this.translator)
    },
    curPage: {
      get() { return this.$store.state.title.curPage },
      set(val) { this.$store.commit('title/setState', { key: 'curPage', val }) }
    },
    pageLimit: {
      get() { return this.$store.state.title.pageSize },
      set(val) {
        this.curPage = Math.floor((this.curPage - 1) * this.pageLimit / val) + 1
        this.$store.commit('title/setState', { key: 'pageSize', val })
      }
    }
  },
  methods: {
    handlePageChange(cur) {
      this.$emit('pagination', cur)
    },
    handleShow(item) {
      this.$store.commit('title/loadImage', item)
    }
  }
}
</script>

<style scoped>
  .time {
    font-size: 13px;
    color: #999;
  }
  .bottom {
    margin-top: 13px;
    line-height: 12px;
  }

  .button {
    padding: 0;
    float: right;
  }

  .image {
    width: auto;
    height: auto;
    max-width: 200px;
    max-height: 200px;
    display: block;
  }

  .clearfix:before,
  .clearfix:after {
      display: table;
      content: "";
  }

  .clearfix:after {
      clear: both
  }
</style>
