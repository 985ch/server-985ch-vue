<template>
  <div>
    <el-autocomplete
      ref="memberinput"
      v-model="name"
      class="member-input"
      value-key="name"
      :fetch-suggestions="getActiveMembers"
      placeholder="请输入微信备注"
      clearable
      @input="input"
    />
    <el-select
      slot="append"
      v-model="level"
      class="type-select"
      placeholder="请选择级别"
      :disabled="value>0"
    >
      <el-option
        v-for="(val, index) in memberTypes"
        :key="val"
        :label="val"
        :value="index"
      />
    </el-select>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import _ from 'lodash'

export default {
  name: 'MemberInput',
  props: {
    value: { type: Number, default: 1 },
    type: { type: Number, default: 0 }
  },
  data() {
    return {
      name: '',
      level: 0
    }
  },
  computed: {
    ...mapGetters('psi', [
      'memberTypes',
      'activeMembers',
      'activeSuppliers',
      'activeCustomers',
      'allMembers',
      'memberMap'
    ]),
    optionMembers() {
      const suppliers = this.activeSuppliers
      const customers = this.activeCustomers
      const allMembers = _.takeRight(this.activeMembers, this.activeMembers.length - 1)
      const groups = [suppliers, customers, suppliers, customers, allMembers, allMembers]
      return groups[this.type] || []
    },
    memberData() { return _.keyBy(this.allMembers, 'name') }
  },
  watch: {
    value(val, old) {
      const member = this.memberMap[val]
      if (member && old !== val) {
        this.name = member.name
        this.level = member.level
      }
    },
    type(val, old) {
      if (val !== old) {
        const members = this.optionMembers
        this.name = members[0].name
        this.level = members[0].level
        this.$emit('input', members[0].id)
      }
    },
    level(val, old) {
      if (val !== old) {
        this.$emit('level-change', val)
      }
    }
  },
  mounted() {
    const member = this.memberMap[this.value]
    this.name = member.name
    this.level = member.level
  },
  methods: {
    input(text) {
      const member = this.memberData[text]
      if (member) {
        if (member.id !== this.value) this.$emit('input', member.id)
      } else {
        this.$emit('input', 0)
      }
    },
    newMember() {
      return {
        id: 0,
        name: this.name,
        level: this.level,
        type: this.type === 0 ? 1 : 0,
        info: '',
        hide: 0
      }
    },
    getActiveMembers(text, cb) {
      const members = this.optionMembers
      if (text === '') {
        cb(members)
      } else {
        cb(_.sortBy(_.filter(members, obj => obj.name.includes(text)), 'name'))
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.member-input {
    display: inline-block;
    width: 60%;
}
.type-select {
    display: inline-block;
    width: 100px;
}
</style>
