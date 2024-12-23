<template>
  <div>
    <div class="search-bar" ref="searchBarRef">
      <section class="search-engine flex-center">
        <section class="icon-box flex-center">
          <img src="/images/icon-bing-48.png" alt="bing" />
        </section>
      </section>
      <Input
        class="search-input"
        placeholder="输入搜索内容"
        v-model:value="searchValue"
        v-on:press-enter="search"
        @focus="handleInputFocus"
        @blur="handleInputBlur"
      />
      <section class="clear-icon-box flex-center">
        <CloseCircleFilled
          v-show="searchValue"
          class="clear-icon"
          @click="clearInput"
        />
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Input } from 'ant-design-vue'
import { CloseCircleFilled } from '@ant-design/icons-vue'

let searchValue = ref<string>('')

function search() {
  window.location.href = 'https://cn.bing.com/search?q=' + searchValue.value
}

function clearInput() {
  searchValue.value = ''
}

const searchBarRef = ref<HTMLInputElement | null>(null)
let handleInputFocus = () => {
  searchBarRef.value?.classList.add('search-bar-active')
}
let handleInputBlur = () => {
  searchBarRef.value?.classList.remove('search-bar-active')
}
</script>

<style scoped lang="scss">
.flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}
.search-bar {
  width: 560px;
  height: 52px;
  background-color: rgb(255, 255, 255, 0.5);
  position: absolute;
  top: 15vh;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  .search-engine {
    width: 52px;
    height: 52px;
    flex: none;
    .icon-box {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      &:hover {
        background-color: rgb(255, 255, 255, 0.6);
      }
      img {
        width: 24px;
        height: 24px;
        display: block;
      }
    }
  }
  .search-input {
    color: #526071;
    font-size: 16px;
    line-height: 28px;
    font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
      'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    border: 0;
    outline: none;
    background: rgba(0, 0, 0, 0);
    box-shadow: none;
  }
  .clear-icon-box {
    width: 52px;
    height: 52px;
    flex: none;
    .clear-icon {
      color: rgba(0, 0, 0, 0.4);
    }
  }
}
.search-bar-active {
  background-color: #fff;
  .search-input {
    color: #2d2e2e;
  }
}
</style>
