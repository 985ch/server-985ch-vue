<template>
  <div>
    <el-input
      v-for="(item, index) in list"
      :key="listname+index"
      v-model="list[index]"
      :placeholder="placeholder"
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
  </div>
</template>
<script>
export default {
  name: 'ArrayInput',
  props: {
    list: { type: Array, required: true },
    listname: { type: String, required: true },
    placeholder: { type: String, default: '请输入内容' },
    defaultitem: { type: String, default: 'new item' }
  },
  data() {
    return {
    }
  },
  methods: {
    addItem(index) {
      this.list.splice(index + 1, 0, this.defaultitem)
    },
    removeItem(index) {
      this.list.splice(index, 1)
    },
    itemUp(i) {
      const list = this.list
      if (i <= 0) return
      const tmp = list[i]
      this.$set(list, i, list[i - 1])
      this.$set(list, i - 1, tmp)
    },
    itemDown(i) {
      const list = this.list
      if (i >= list.length - 1) return
      const tmp = list[i]
      this.$set(list, i, list[i + 1])
      this.$set(list, i + 1, tmp)
    }
  }
}
</script>
