<template>
  <div :id="id" />
</template>

<script>
// deps for editor
import 'codemirror/lib/codemirror.css' // codemirror
import 'tui-editor/dist/tui-editor.css' // editor ui
import 'tui-editor/dist/tui-editor-contents.css' // editor content

import Viewer from 'tui-editor/dist/tui-editor-Viewer'

export default {
  name: 'MarkdownViewer',
  props: {
    value: {
      type: String,
      default: ''
    },
    id: {
      type: String,
      required: false,
      default() {
        return 'markdown-viewer-' + +new Date() + ((Math.random() * 1000).toFixed(0) + '')
      }
    },
    options: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  data() {
    return {
      viewer: null
    }
  },
  watch: {
    value(newValue, preValue) {
      if (newValue !== preValue) {
        this.viewer.setValue(newValue)
      }
    }
  },
  mounted() {
    this.initViewer()
  },
  destroyed() {
    this.destroyViewer()
  },
  methods: {
    initViewer() {
      this.viewer = new Viewer({
        el: document.getElementById(this.id),
        ...this.options
      })
      if (this.value) {
        this.viewer.setValue(this.value)
      }
    },
    destroyViewer() {
      if (!this.viewer) return
      this.viewer.remove()
    },
    setValue(value) {
      this.viewer.setValue(value)
    }
  }
}
</script>
