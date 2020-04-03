<template>
  <div>
    <div align="right">
      <el-button v-show="isAdmin" size="mini" @click="unbind">解除绑定</el-button>
      <el-button size="mini" @click="cpyPath(root.path,$event)">复制路径</el-button>
    </div>
    <el-tree
      :data="filelist"
      :expand-on-click-node="false"
    >
      <div slot-scope="{ node, data }" class="tree-node">
        <div class="node-main">{{ node.label }}</div>
        <div class="node-info">
          <span v-if="!data.children">{{ (data.size || 0) | bytesFilter }}</span>
          <span v-if="data.children">
            <el-button size="mini" @click="cpyPath(data.path, $event)">
              复制路径
            </el-button>
          </span>
        </div>
      </div>
    </el-tree>
  </div>
</template>
<script>
import { bytesFilter } from '@/filters'
import clip from '@/utils/clipboard'

function json2list(files, prefix) {
  const list = []
  for (const key in files) {
    const cur = files[key]
    if (cur.files) {
      const path = prefix + '/' + key
      list.push({
        label: key,
        path,
        children: json2list(cur.files, path)
      })
    } else {
      list.push({
        label: key,
        size: cur.size,
        mt: cur.mt
      })
    }
  }
  return list
}

export default {
  name: 'ResourcesList',
  filters: {
    bytesFilter
  },
  props: {
    info: { type: Object, required: true },
    filejson: { type: Object, required: true },
    isAdmin: { type: Boolean, default: false }
  },
  data() {
    return {
      listLoading: false
    }
  },
  computed: {
    root() {
      let json = this.filejson
      let path = this.info.path
      const folder = this.info.folder
      if (folder && json[folder] && json[folder].files) {
        json = json[folder].files
        path += '/' + folder
      }
      return { json, path }
    },
    filelist() {
      const list = json2list(this.root.json, this.root.path)
      return list
    }
  },
  methods: {
    cpyPath(text, event) {
      clip(text, event)
    },
    unbind() {
      this.$confirm('将资源从当前作品解绑吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info'
      }).then(() => {
        this.$emit('unbind', this.info.id)
      }).catch(() => {})
    }
  }
}
</script>
<style lang="scss" scoped>
.tree-node {
    width: 100%;
}
.node-main {
    display: inline-block;
}
.node-info {
    float: right;
}
</style>
