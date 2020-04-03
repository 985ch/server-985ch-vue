<template>
  <div>
    <h2>
      {{ titleName }}
      <el-switch v-if="role['editor']" v-model="editMode" />
      <el-button v-show="editMode" @click="saveData">{{ saveBtnName }}</el-button>
    </h2>
    <div v-show="editMode">
      <el-select v-model="edit.typeid" placeholder="作品类型">
        <el-option
          v-for="item in titleTypes"
          :key="item.id"
          :label="item.name"
          :value="item.id"
        />
      </el-select>
      <el-date-picker v-model="edit.releaseTime" type="month" placeholder="发行时间" />
      <el-switch v-if="role['adult']" v-model="edit.nsfw" active-text="NSFW" inactive-text="健全作品" />
      <array-input :list="edit.names" listname="titleNames" placeholder="请添加作品名称" defaultitem="" />
    </div>
    <div v-show="!editMode">
      <h4 v-for="name in titleAlias" :key="name">{{ name }}<br></h4>
      <span class="titleType">{{ `${titleTypeName}(${getDate(curTitle.release_time)})` }}</span>
    </div>
    <hr>
    <el-row>
      <el-col :span="16">
        <el-collapse v-model="activeResource" accordion @change="onResourceShow">
          <el-collapse-item v-for="item in resources" :key="item.id" :title="item | pathFullName" :name="item.id">
            <resource-viewer :is-admin="role['admin']||false" :info="item" :filejson="filejson" @unbind="unbindResource" />
          </el-collapse-item>
        </el-collapse>
        <div v-show="role['admin']" align="right">
          <el-button @click="showResBox=true">添加资源路径</el-button>
        </div>
        <hr>
        <markdown-editor v-model="edit.info" :visible="editMode" language="zh_CN" height="500px" />
        <markdown-viewer v-show="!editMode" v-model="curTitle.info" />
      </el-col>
      <el-col :span="8">
        <el-image
          style="width: 300px; height: 300px"
          :src="titleImage"
          fit="scale-down"
        />
        <el-input v-show="editMode" v-model="picInput">
          <el-button slot="append" @click="edit.pic = picInput">预览</el-button>
        </el-input>
      </el-col>
    </el-row>
    <el-drawer
      title="添加资源路径"
      size="60%"
      direction="ltr"
      :visible.sync="showResBox"
      :with-header="false"
    >
      <resources-list @bind="bindResource" />
    </el-drawer>
  </div>
</template>

<script>
import { saveTitle, getTitleData } from '@/api/title'
import { bindTitle, unbindTitle } from '@/api/resource'
import { mapGetters, mapState } from 'vuex'
import { parseTime } from '@/utils'
import _ from 'lodash'

export default {
  name: 'ResourcesTitle',
  components: {
    MarkdownEditor: () => import('@/components/MarkdownEditor'),
    MarkdownViewer: () => import('@/components/MarkdownViewer'),
    ArrayInput: () => import('@/components/ArrayInput'),
    ResourcesList: () => import('@/components/ResourcesList'),
    ResourceViewer: () => import('@/components/ResourceViewer')
  },
  filters: {
    timeFilter(time) {
      return parseTime(time)
    },
    dateFilter(time) {
      return parseTime(time, '{y}/{m}')
    },
    pathFullName(item) {
      const folder = (item.folder && item.folder !== '') ? '/' + item.folder : ''
      return `${item.path}${folder}(${item.source})`
    }
  },
  data() {
    const defaultTime = new Date('1970-1-1')
    return {
      curTitle: { // 当前作品主要字段
        id: 0,
        userid: 0,
        typeid: 1,
        names: '未知作品',
        pic: '',
        release_time: defaultTime,
        add_time: defaultTime,
        info: '暂无介绍',
        nsfw: 0,
        public: 1
      },
      resources: [], // 关联资源
      activeResource: '', // 激活的资源
      filejson: {}, // 文件资源
      edit: { // 当前作品编辑字段
        id: 0,
        typeid: 1,
        names: [],
        releaseTime: defaultTime,
        pic: '',
        info: '暂无介绍',
        nsfw: false
      },
      picInput: '', // 图片地址输入框绑定值
      editMode: true, // 编辑模式
      showResBox: false // 是否显示资源绑定框
    }
  },
  computed: {
    ...mapGetters(['role', 'titleTypes']),
    ...mapGetters('title', ['typeMap']),
    ...mapState('resource', ['resData']),
    titleNames() { // 作品名数组
      const names = this.curTitle.names.split('\n')
      const result = []
      for (const cur of names) {
        if (cur && cur !== '')result.push(cur)
      }
      if (result.length === 0)result.push('未知作品')
      return result
    },
    titleName() { return this.titleNames[0] }, // 作品名
    titleAlias() { return _.takeRight(this.titleNames, this.titleNames.length - 1) }, // 作品别名
    titleTypeName() { // 作品类名
      const obj = this.typeMap[this.curTitle.typeid]
      return obj ? obj.name : '未知类型'
    },
    titleImage() { // 作品图片链接
      const pic = this.editMode ? this.edit.pic : this.curTitle.pic
      if (pic && pic !== '') return pic
      return require('@/assets/default.jpg')
    },
    saveBtnName() { // 保存按钮文本
      return this.curTitle.id === 0 ? '添加作品' : '确认修改'
    }
  },
  async created() {
    const id = this.$route.query.id
    if (id) {
      const data = await getTitleData(id)
      data.release_time = new Date(data.release_time)
      this.curTitle = data.base
      this.resources = data.res
      this.editMode = false
    }
    await this.$store.dispatch('title/getTitleTypes')
    this.cur2Edit()
  },
  methods: {
    // 获取日期
    getDate(date) {
      return parseTime(date, '{y}/{m}')
    },
    // 将当前作品的数据复制到编辑项
    cur2Edit() {
      const cur = this.curTitle
      const edit = {
        id: cur.id,
        typeid: cur.typeid,
        names: this.titleNames,
        nsfw: cur.nsfw,
        releaseTime: cur.release_time,
        pic: cur.pic,
        info: cur.info
      }
      this.picInput = cur.pic
      this.edit = edit
    },
    // 保存数据
    saveData() {
      const tip = this.curTitle.id === 0 ? '确定添加？' : '确定修改？'
      this.$confirm(tip, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info'
      }).then(() => {
        this.onSaveData()
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '放弃修改'
        })
      })
    },
    async onSaveData() {
      this.edit.pic = this.picInput
      const data = await saveTitle(this.edit)
      data.release_time = new Date(data.release_time)
      this.curTitle = data
      this.$message({
        type: 'success',
        message: '编辑成功'
      })
      this.editMode = false
    },
    // 绑定作品
    async bindResource({ id, folder }) {
      if (this.curTitle.id === 0) return
      const result = await bindTitle(this.curTitle.id, id, folder)
      const res = await this.$store.dispatch('resource/getResource', id)
      this.resources = [...this.resources, {
        id: result.id,
        resid: res.id,
        source: res.source,
        path: res.path,
        valid: res.valid,
        updatetime: res.updatetime,
        folder: result.folder
      }]
      this.showResBox = false
    },
    // 展开资源面板
    async onResourceShow(id) {
      for (const cur of this.resources) {
        if (cur.id === id) {
          const res = await this.$store.dispatch('resource/getResource', cur.resid)
          if (res) this.filejson = res.info
          return
        }
      }
      this.filejson = {}
    },
    // 解除绑定
    async unbindResource(id) {
      await unbindTitle(id)
      _.remove(this.resources, (item) => item.id === id)
      this.activeResource = ''
    }
  }
}
</script>

<style lang="scss" scoped>
  .titleType {
		font-size: 18px;
		color:#B0B0B0
	}
</style>
