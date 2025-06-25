<template>
  <Tooltip color="#fff" :title="title">
    <slot>default value</slot>
  </Tooltip>
</template>

<script setup lang="ts">
import { Tooltip } from 'ant-design-vue'
defineProps({
  title: {
    type: String,
    required: true
  }
})
</script>

<style lang="scss">
.ant-tooltip-inner {
  color: #2d2e2e !important;
  font-size: 13px;
  font-family:
    'PingFang SC', 'HarmonyOS Sans SC', 'Microsoft YaHei', sans-serif;
}
</style>
