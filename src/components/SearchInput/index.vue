<template>
  <div>
    <el-autocomplete
      :ref="name"
      class="search-input"
      :value="value"
      :fetch-suggestions="getHistory"
      :placeholder="placeholder"
      :trigger-on-focus="false"
      clearable
      @input="input"
      @select="onSelected"
      @keyup.enter.native="search($event)"
    >
      <el-button slot="append" icon="el-icon-search" @click="search($event)" />
    </el-autocomplete>
  </div>
</template>
<script>
import { pushHistory } from '@/utils/history'
import Cookies from 'js-cookie'

export default {
  name: 'SearchInput',
  props: {
    name: {
      type: String,
      default: 'searchinput'
    },
    value: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: '请输入搜索条件'
    },
    ckey: {
      type: String,
      required: true
    },
    max: {
      type: Number,
      default: 10
    }
  },
  data() {
    return {
      history: []
    }
  },
  computed: {
  },
  created() {
    const fromCookie = Cookies.get(this.ckey)
    this.history = fromCookie ? JSON.parse(fromCookie) : []
  },
  methods: {
    input(value) {
      this.$emit('input', value)
    },
    getHistory(text, cb) {
      const list = []
      const cmp = this.value
      for (const cur of this.history) {
        if (cur.value !== cmp && cur.value.includes(cmp)) {
          list.push(cur)
        }
      }
      cb(list)
    },
    search(event) {
      // 关闭建议框
      if (event) {
        event.target.blur()
        this.$refs[this.name].close()
      }
      this.$emit('search', this.value)
      const keyword = this.value === '' ? this.value : undefined
      if (keyword) {
        const history = pushHistory({ value: keyword }, this.history, this.max)
        Cookies.set(this.ckey, JSON.stringify(history))
      }
    },
    onSelected(event) {
      this.$refs[this.name].focus()
    }
  }
}
</script>
<style lang="scss" scoped>
.search-input {
    display: inline-block;
    width: 100%;
}
</style>
