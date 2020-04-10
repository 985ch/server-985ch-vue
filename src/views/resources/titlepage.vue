<template>
  <div class="main-page">
    <h2>
      {{ titleName }}
      <span class="title-type">{{ `${titleTypeName}(${getDate(curTitle.release_time)})` }}</span>
      <el-switch v-if="role['editor']" v-model="editMode" />
      <el-button v-show="editMode" @click="saveData">{{ saveBtnName }}</el-button>
    </h2>
    <div v-show="editMode">
      <array-input :list="edit.names" listname="titleNames" placeholder="请添加作品名称" defaultitem />
      <el-select v-model="edit.typeid" placeholder="作品类型">
        <el-option v-for="item in titleTypes" :key="item.id" :label="item.name" :value="item.id" />
      </el-select>
      <el-date-picker v-model="edit.releaseTime" type="month" placeholder="发行时间" />
      <el-switch v-if="role['adult']" v-model="edit.nsfw" active-text="NSFW" inactive-text="健全作品" />
      <div class="catch-input">
        <el-input v-model="bgmid" placeholder="请输入bgmid" @keyup.enter.native="catchInfo">
          <el-button slot="append" @click="catchInfo">爬取</el-button>
        </el-input>
      </div>
    </div>
    <div v-show="!editMode">
      <div v-for="name in titleAlias" :key="name" class="title-alias">
        {{ name }}
        <br>
      </div>
    </div>
    <hr>
    <el-row>
      <el-col :span="16">
        <resource-explorer
          :resources="resources"
          :titleid="curTitle.id"
          @unbind="unbindResource"
          @add="showResBox=true"
        />
        <markdown-editor v-model="edit.info" :visible="editMode" language="zh_CN" height="500px" />
        <markdown-viewer v-show="!editMode" v-model="curTitle.info" />
      </el-col>
      <el-col :span="8">
        <el-image style="width: 300px; height: 300px" :src="titleImage" fit="scale-down" />
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
import { bindTitle, unbindTitle, getBgmData } from '@/api/resource'
import { mapGetters, mapState } from 'vuex'
import { parseTime } from '@/utils'
import { info2markdown } from '@/utils/resource'
import _ from 'lodash'

export default {
  name: 'ResourcesTitle',
  components: {
    MarkdownEditor: () => import('@/components/MarkdownEditor'),
    MarkdownViewer: () => import('@/components/MarkdownViewer'),
    ArrayInput: () => import('@/components/ArrayInput'),
    ResourcesList: () => import('@/components/ResourcesList'),
    ResourceExplorer: () => import('@/components/ResourceExplorer')
  },
  filters: {
    timeFilter(time) { return parseTime(time) },
    dateFilter(time) { return parseTime(time, '{y}/{m}') }
  },
  data() {
    const defaultTime = new Date()
    return {
      // 当前作品主要字段
      curTitle: {
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
      // 当前作品编辑字段
      edit: {
        id: 0,
        typeid: 1,
        names: [],
        releaseTime: defaultTime,
        pic: '',
        info: '暂无介绍',
        nsfw: false
      },
      resources: [], // 关联资源
      picInput: '', // 图片地址输入框绑定值
      bgmid: '', // bangumi链接ID
      editMode: true, // 编辑模式
      showResBox: false // 是否显示资源绑定框
    }
  },
  computed: {
    ...mapGetters(['role', 'titleTypes']),
    ...mapGetters('title', ['typeMap']),
    ...mapState('resource', ['resData']),
    // 作品名数组
    titleNames() {
      const names = this.curTitle.names.split('\n')
      const result = []
      for (const cur of names) {
        if (cur && cur !== '') result.push(cur)
      }
      if (result.length === 0) result.push('未知作品')
      return result
    },
    // 作品名
    titleName() {
      return this.titleNames[0]
    },
    // 作品别名
    titleAlias() {
      return _.takeRight(this.titleNames, this.titleNames.length - 1)
    },
    // 作品类名
    titleTypeName() {
      const obj = this.typeMap[this.curTitle.typeid]
      return obj ? obj.name : '未知类型'
    },
    // 作品图片链接
    titleImage() {
      const pic = this.editMode ? this.edit.pic : this.curTitle.pic
      if (pic && pic !== '') return pic
      return require('@/assets/default.jpg')
    },
    // 保存按钮文本
    saveBtnName() {
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
        this.$message({ type: 'info', message: '放弃修改' })
      })
    },
    async onSaveData() {
      this.edit.pic = this.picInput
      const data = await saveTitle(this.edit)
      this.edit.id = data.id
      data.release_time = new Date(data.release_time)
      this.curTitle = data
      this.$message({ type: 'success', message: '编辑成功' })
      this.editMode = false
    },
    // 绑定作品
    async bindResource({ id, folder }) {
      if (this.curTitle.id === 0) return
      const result = await bindTitle(this.curTitle.id, id, folder)
      const res = await this.$store.dispatch('resource/getResource', id)
      this.resources = [
        ...this.resources,
        {
          id: result.id,
          resid: res.id,
          source: res.source,
          path: res.path,
          valid: res.valid,
          updatetime: res.updatetime,
          folder: result.folder
        }
      ]
      this.showResBox = false
    },
    // 解除绑定
    async unbindResource({ id }) {
      await unbindTitle(id)
      this.resources = _.filter(this.resources, item => item.id === id)
      this.activeResource = ''
    },
    // 爬取bangumi的资源
    catchInfo() {
      this.$confirm('即将用来自bgm.tv的数据覆盖掉现有数据，确定吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info'
      }).then(() => {
        return getBgmData(this.bgmid)
      }).then(data => {
        const cur = this.curTitle
        this.edit = {
          id: cur.id,
          typeid: cur.typeid,
          names: data.names,
          nsfw: cur.nsfw,
          releaseTime: new Date(data.releaseTime),
          pic: data.img,
          info: info2markdown(data)
        }
        this.picInput = data.img
      }).catch(() => {})
    }
  }
}
</script>

<style lang="scss" scoped>
.title-type {
  font-size: 18px;
  color: #b0b0b0;
}
.catch-input {
  display: inline-block;
}
.deleted-res {
  color: gray;
}
.title-alias {
  display: inline-block;
  margin:0 20px 0 20px;
  color:grey;
}
.main-page {
  margin: 2%;
}
</style>
