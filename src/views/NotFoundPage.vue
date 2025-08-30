<template>
  <div class="flex h-screen items-center justify-center">
    <Result status="404" title="404" sub-title="对不起，您要找的页面被丢失了">
      <template #extra>
        <RouterLink to="/home">
          <Button type="primary"> Back Home </Button>
        </RouterLink>
      </template>
    </Result>
  </div>
</template>

<script setup lang="ts">
import { Result, Button } from 'ant-design-vue'
</script>
