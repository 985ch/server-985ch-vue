<template>
  <div>
    <el-input
      v-for="(item, index) in list"
      :key="index"
      :value="list[index]"
      :placeholder="placeholder"
      @input="handleInput(index, $event)"
    >
      <div slot="prepend">
        <el-button icon="el-icon-arrow-up" @click="itemUp(index)" />
        <el-button icon="el-icon-arrow-down" @click="itemDown(index)" />
      </div>
      <div slot="append">
        <el-button icon="el-icon-plus" @click="addItem(index)" />
        <el-button icon="el-icon-minus" @click="removeItem(index)" />
      </div>
    </el-input>
    <el-button v-show="value.length===0" @click="addItem(-1)">{{ addtext }}</el-button>
  </div>
</template>
<script>
export default {
  name: 'ArrayInput',
  props: {
    value: { type: Array, required: true },
    addtext: { type: String, default: '添加一条记录' },
    placeholder: { type: String, default: '请输入内容' },
    defaultitem: { type: String, default: 'new item' },
    minimum: { type: Number, default: 0 },
    maximum: { type: Number, default: 0 }
  },
  data() {
    return {
    }
  },
  computed: {
    list: {
      get() { return this.value },
      set(val) { this.$emit('input', val) }
    }
  },
  methods: {
    addItem(index) {
      const list = this.list
      if (list.length > this.maximum || this.maximum === 0) {
        list.splice(index + 1, 0, this.defaultitem)
        this.list = list
      }
    },
    removeItem(index) {
      const list = this.list
      if (list.length > this.minimum) {
        list.splice(index, 1)
        this.list = list
      }
    },
    itemUp(i) {
      const list = this.list
      if (i <= 0) return
      const tmp = list[i]
      list[i] = list[i - 1]
      list[i - 1] = tmp
      this.list = list
    },
    itemDown(i) {
      const list = this.list
      if (i >= list.length - 1) return
      const tmp = list[i]
      list[i] = list[i + 1]
      list[i + 1] = tmp
      this.list = list
    },
    handleInput(i, val) {
      const list = this.list
      this.$set(list, i, val)
      this.list = list
    }
  }
}
</script>
