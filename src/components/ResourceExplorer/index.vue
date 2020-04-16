<template>
  <div>
    <el-collapse v-model="activeResource" accordion @change="onResourceShow">
      <el-collapse-item
        v-for="item in resources"
        :key="item.id"
        :name="item.id"
        :disabled="item.valid===0"
      >
        <template slot="title">
          <div v-if="item.valid===0">
            <s class="deleted-res">{{ item | pathFullName }}</s>
            <el-button v-show="role['admin']" @click="handleUnbind(item)">删除资源路径</el-button>
          </div>
          <p v-else>{{ item | pathFullName }}</p>
        </template>
        <resource-viewer
          :is-admin="role['admin']||false"
          :info="item"
          :filejson="filejson"
          @unbind="handleUnbind"
        />
      </el-collapse-item>
    </el-collapse>
    <div v-if="role['admin'] && showAddbtn" align="right">
      <el-button @click="handleAdd">添加资源路径</el-button>
    </div>
    <hr>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import _ from 'lodash'

export default {
  name: 'ResourcesExplorer',
  components: {
    ResourceViewer: () => import('@/components/ResourceViewer')
  },
  filters: {
    pathFullName(item) {
      const folder = item.folder && item.folder !== '' ? '/' + item.folder : ''
      return `${item.path}${folder}(${item.source})`
    }
  },
  props: {
    resources: {
      type: Array,
      default() {
        return []
      }
    },
    showAddbtn: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      activeResource: '', // 当前激活的资源面板
      filejson: {} // 文件资源
    }
  },
  computed: {
    ...mapGetters(['role'])
  },
  methods: {
    // 展开资源面板
    async onResourceShow(id) {
      for (const cur of this.resources) {
        if (cur.id === id) {
          const res = await this.$store.dispatch(
            'resource/getResource',
            cur.resid
          )
          if (res) this.filejson = res.info
          return
        }
      }
      this.filejson = {}
    },
    // 解除绑定
    handleUnbind(item) {
      this.$emit('unbind', item)
      _.remove(this.resources, obj => item.id === obj.id)
    },
    handleAdd() {
      this.$emit('add')
    }
  }
}
</script>
<style lang="scss" scoped>
</style>
