<template>
  <div>
    <h2>
      <el-button v-if="!newTitle" :type="concern | concernBtnType" round @click="concern=!concern">关注</el-button>
      {{ titleName }}
      <span class="title-type">{{ titleTypeName }}({{ title.release_time | dateFilter }})</span>
      <el-switch v-if="role['editor']" v-model="editMode" />
      <el-button v-show="editMode" @click="handleSave">{{ newTitle? '添加作品' : '确认修改' }}</el-button>
    </h2>
    <div v-if="editMode">
      <array-input v-model="names" placeholder="请添加作品名称" :minimum="1" defaultitem="新名字" />
      <el-select v-model="edit.typeid" class="select-box" placeholder="作品类型">
        <el-option v-for="item in titleTypes" :key="item.id" :label="item.name" :value="item.id" />
      </el-select>
      <el-date-picker v-model="edit.release_time" type="month" placeholder="发行时间" />
      <el-button
        v-if="role['adult']"
        type="text"
        @click="nsfw=!nsfw"
      >{{ nsfw?'NSFW':'SAFE' }}</el-button>
      <div class="catch-input">
        <el-input v-model="bgmid" placeholder="请输入bgmid" @keyup.enter.native="handleBgmGet">
          <el-button slot="append" @click="handleBgmGet">爬取</el-button>
        </el-input>
      </div>
    </div>
    <div v-show="!editMode">
      <el-select v-if="!newTitle" v-model="like" class="select-box" placeholder="个人喜好">
        <el-option v-for="item in likeInfo" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
      <div v-for="name in titleAlias" :key="name" class="title-alias">
        {{ name }}
        <br>
      </div>
    </div>
    <hr>
  </div>
</template>

<script>
import { concernTitle, likeTitle } from '@/api/title'
import { getBgmData } from '@/api/resource'
import { mapGetters } from 'vuex'
import { parseTime } from '@/utils'
import _ from 'lodash'

export default {
  name: 'TitleHead',
  components: {
    ArrayInput: () => import('@/components/ArrayInput')
  },
  filters: {
    dateFilter(time) { return parseTime(time, '{y}/{m}') },
    concernBtnType(concern) { return concern ? 'primary' : 'info' }
  },
  props: {
    value: { type: Boolean, required: true },
    title: { type: Object, required: true },
    edit: { type: Object, required: true },
    note: { type: Object, required: true }
  },
  data() {
    return {
      bgmid: '',
      likeInfo: [
        { label: '一般', value: 0 },
        { label: '喜欢', value: 1 },
        { label: '不喜', value: 2 },
        { label: '未看', value: 3 }
      ]
    }
  },
  computed: {
    ...mapGetters(['role', 'titleTypes']),
    ...mapGetters('title', ['typeMap']),
    // 保存按钮文本
    newTitle() { return this.title.id === 0 },
    // 作品名数组
    titleNames() { return this.names2array(this.title.names) },
    // 作品名
    titleName() { return this.titleNames[0] },
    // 作品别名
    titleAlias() {
      return _.takeRight(this.titleNames, this.titleNames.length - 1)
    },
    // 作品类名
    titleTypeName() {
      const obj = this.typeMap[this.title.typeid]
      return obj ? obj.name : '未知类型'
    },
    names: {
      get() { return (this.edit.names || '').split('\n') },
      set(val) { this.edit.names = val.join('\n') }
    },
    // NSFW
    nsfw: {
      get() { return this.edit.nsfw === 1 },
      set(val) { this.$set(this.edit, 'nsfw', val ? 1 : 0) }
    },
    // 编辑模式
    editMode: {
      get() { return this.value },
      set(val) { this.$emit('input', val) }
    },
    // 当前喜好
    like: {
      get() { return this.note.like || 0 },
      set(val) {
        const like = val || 0
        this.$set(this.note, 'like', like)
        likeTitle(this.title.id, like)
      }
    },
    // 关注状态
    concern: {
      get() { return this.note.concern === 1 },
      set(val) {
        const concern = val ? 1 : 0
        this.$set(this.note, 'concern', concern)
        concernTitle(this.title.id, concern)
      }
    }
  },
  methods: {
    names2array(raw = '') {
      const names = raw.split('\n')
      const result = []
      for (const cur of names) {
        if (cur && cur !== '') result.push(cur)
      }
      if (result.length === 0) result.push('未知作品')
      return result
    },
    handleSave() {
      this.$emit('save')
    },
    handleBgmGet() {
      getBgmData(this.bgmid).then(data => {
        this.$emit('get', data)
      }).catch(e => {
        this.$message({ type: 'error', message: '获取数据失败' })
        console.log(e)
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.title-type {
  font-size: 18px;
  color: #b0b0b0;
}
.select-box {
  width: 120px;
}
.catch-input {
  display: inline-block;
}
.title-alias {
  display: inline-block;
  margin:0 20px 0 20px;
  color:grey;
}
</style>
