<template>
  <div class="flex w-full items-center justify-end">
    <div class="flex-center size-16">
      <SettingFilled
        class="cursor-pointer"
        :style="{ fontSize: '24px', color: 'rgba(255,255,255,0.1)' }"
        @click="handleSettingBtn"
        ref="settingLogoRef"
      />
      <Transition name="fade">
        <div
          v-show="isShowMenu"
          class="flex-center absolute top-15 right-8 w-40 flex-col rounded-xl bg-white shadow-lg"
          :style="{ padding: '12px' }"
          ref="settingMenuRef"
        >
          <div
            class="flex-center h-10 w-34 rounded-lg hover:bg-[#eaeaea]"
            v-if="!isLogin"
          >
            <RouterLink
              class="text-center text-2xl/8 text-[#2d2e2e] no-underline transition-all duration-200"
              to="/login"
            >
              登录/注册
            </RouterLink>
          </div>
          <div
            class="flex-center h-10 w-34 rounded-lg hover:bg-[#eaeaea]"
            v-if="isLogin"
          >
            <a
              class="text-center text-2xl/8 text-[#2d2e2e] no-underline transition-all duration-200"
              @click="handleLogout"
              >退出登录</a
            >
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { SettingFilled } from '@ant-design/icons-vue'
import { useBookmarkStore } from '../store/bookmark'
import { getAccessToken, removeTokens } from '../utils/tools'

const isShowMenu = ref(false)
const settingLogoRef = ref<HTMLElement | null>(null)
const settingMenuRef = ref<HTMLElement | null>(null)
const isLogin = ref(false)

const bookmarkStore = useBookmarkStore()
const { resetBookmarkList } = bookmarkStore

const handleSettingBtn = () => {
  isShowMenu.value = !isShowMenu.value
}
const handleLogout = () => {
  removeTokens()
  isLogin.value = false
  resetBookmarkList()
}
const handleClick = (e: MouseEvent) => {
  if (isShowMenu.value) {
    const logoEl = settingLogoRef.value
    const menuEl = settingMenuRef.value
    if (
      logoEl &&
      menuEl &&
      !logoEl.contains(e.target as HTMLElement) &&
      !menuEl.contains(e.target as HTMLElement)
    ) {
      handleSettingBtn()
    }
  }
}

onMounted(() => {
  if (getAccessToken()) {
    isLogin.value = true
  }
  document.addEventListener('click', handleClick)
})
onBeforeUnmount(() => {
  document.removeEventListener('click', handleClick)
})
</script>
