<template>
  <div class="main-page">
    <title-head
      v-model="editMode"
      :title="title"
      :edit="edit"
      :note="note"
      @save="saveData"
      @get="catchInfo"
    />
    <el-row>
      <el-col :xs="24" :sm="12" :md="14" :lg="16" :xl="18">
        <resource-explorer
          :resources="resources"
          :show-addbtn="!newTitle"
          @unbind="unbindResource"
          @add="showResBox=true"
        />
        <markdown-editor v-model="edit.info" :visible="editMode" language="zh_CN" height="500px" />
        <markdown-viewer v-show="!editMode" v-model="title.info" />
        <div v-if="!newTitle" v-show="!editMode">
          <hr>
          <el-input
            v-model="tmpNote"
            type="textarea"
            autosize
            placeholder="这里用来输入私人备注，其他用户无法看到您的私人备注"
          />
          <div style="text-align:right">
            <el-button @click="updateNote">提交</el-button>
          </div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="12" :md="10" :lg="8" :xl="6">
        <el-input v-show="editMode" v-model="picInput">
          <el-button slot="append" @click="edit.pic = picInput">预览</el-button>
        </el-input>
        <img class="img-thumbnail" :src="titleImage">
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
import { noteTitle, saveTitle, getTitleData } from '@/api/title'
import { bindTitle, unbindTitle } from '@/api/resource'
import { mapState } from 'vuex'
import { info2markdown } from '@/utils/resource'
import _ from 'lodash'

export default {
  name: 'ResourcesTitle',
  components: {
    MarkdownEditor: () => import('@/components/MarkdownEditor'),
    MarkdownViewer: () => import('@/components/MarkdownViewer'),
    TitleHead: () => import('./components/titlehead'),
    ResourcesList: () => import('@/components/ResourcesList'),
    ResourceExplorer: () => import('@/components/ResourceExplorer')
  },
  data() {
    return {
      // 当前作品主要字段
      title: {
        id: 0,
        userid: 0,
        typeid: 1,
        names: '未知作品',
        pic: '',
        release_time: (new Date()).toString(),
        info: '暂无介绍',
        nsfw: 0,
        public: 1
      },
      // 当前作品编辑字段
      edit: {},
      resources: [], // 关联资源
      note: {}, // 个人的附加信息
      tmpNote: '', // 临时笔记文本
      picInput: '', // 图片地址输入框绑定值
      editMode: true, // 编辑模式
      showResBox: false // 是否显示资源绑定框
    }
  },
  computed: {
    ...mapState('resource', ['resData']),
    // 作品图片链接
    titleImage() {
      const pic = this.editMode ? this.edit.pic : this.title.pic
      if (pic && pic !== '') return pic
      return require('@/assets/default.jpg')
    },
    // 保存按钮文本
    newTitle() { return this.title.id === 0 }
  },
  async created() {
    const id = this.$route.query.id
    if (id) {
      const data = await getTitleData(id)
      this.title = data.base
      this.resources = data.res
      this.note = data.note
      this.editMode = false
    }
    await this.$store.dispatch('title/getTitleTypes')
    this.tmpNote = this.note.note || ''
    this.picInput = this.title.pic
    this.edit = _.clone(this.title)
  },
  methods: {
    // 保存数据
    async saveData() {
      this.edit.pic = this.picInput
      const data = await saveTitle(this.edit)
      if (data) {
        this.edit.id = data.id
        this.title = data
        this.$message({ type: 'success', message: '添加成功' })
        this.$router.replace({ name: 'ResourcesTitle', query: { id: data.id }})
      } else {
        this.title = this.edit
        this.$message({ type: 'success', message: '编辑成功' })
      }
      this.editMode = false
    },
    // 更新备注
    async updateNote() {
      await noteTitle(this.title.id, this.tmpNote)
      this.$message({ type: 'success', message: '备注已保存' })
    },
    // 绑定作品
    async bindResource({ id, folder }) {
      if (this.title.id === 0) return
      const result = await bindTitle(this.title.id, id, folder)
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
      this.resources = _.filter(this.resources, item => {
        return item.id !== id
      })
      this.activeResource = ''
    },
    // 爬取bangumi的资源
    async catchInfo(data) {
      const cur = this.title
      this.edit = {
        id: cur.id,
        typeid: data.type === 'MOVIE' ? 2 : 1,
        names: data.names.join('\n'),
        nsfw: cur.nsfw === 1,
        release_time: data.releaseTime,
        pic: data.img,
        info: info2markdown(data)
      }
      this.picInput = data.img
    }
  }
}
</script>

<style lang="scss" scoped>
.deleted-res {
  color: gray;
}
.main-page {
  margin: 2%;
}
.img-thumbnail {
  display: inline-block;
  max-width: 100%;
  height: auto;
  padding: 4px;
  line-height: 1.42857143;
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  -webkit-transition: all .2s ease-in-out;
       -o-transition: all .2s ease-in-out;
          transition: all .2s ease-in-out;
}
</style>
