<template>
  <div
    class="relative h-screen overflow-hidden bg-cover"
    style="background-image: url('/images/bg.jpg')"
  >
    <div
      class="absolute top-1/2 left-1/2 z-99 h-[450px] w-200 rounded-xl bg-cover bg-center bg-no-repeat"
      style="
        background-image: url('/images/user-login-bg.png');
        transform: translate(-50%, -50%);
      "
    >
      <RouterLink to="/">
        <CloseOutlined class="absolute top-5 right-5 text-[#928cb1]" />
      </RouterLink>
      <div class="flex h-112 w-116 flex-col items-center justify-between">
        <div class="!mt-12 text-center !text-2xl !font-bold text-[#928cb1]">
          登录
        </div>
        <Form class="!mt-7 flex w-70 flex-col items-center justify-center">
          <FormItem class="!mt-4 w-full" name="username">
            <span class="text-sm font-medium text-[#9c9c9c]">用户名</span>
            <Input class="!shadow-none" v-model:value="formState.username" />
            <div class="border-b border-[#cfcfcf]"></div>
          </FormItem>
          <FormItem class="w-full" name="password">
            <span class="text-sm font-medium text-[#9c9c9c]">密码</span>
            <InputPassword
              class="!shadow-none"
              v-model:value="formState.password"
            />
            <div class="border-b border-[#cfcfcf]"></div>
          </FormItem>
          <FormItem class="!mt-8 w-full">
            <Button
              class="!hover:bg-[#7e7999] !active:bg-[#545065] w-full !bg-[#a9a2cc] text-base leading-4 !text-white"
              type="text"
              @click="handleLoginBtn"
              :loading="loginBtnLoading"
            >
              登录
            </Button>
          </FormItem>
        </Form>
        <div class="!mb-12 text-center">
          <router-link to="/register" class="!text-sm text-[#9c9c9c]"
            >没有账号？去注册</router-link
          >
        </div>
      </div>
    </div>
    <!-- mask -->
    <div class="absolute z-98 h-full w-full bg-black/50 backdrop-blur-lg"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import {
  Form,
  FormItem,
  Input,
  Button,
  InputPassword,
  message
} from 'ant-design-vue'
import { CloseOutlined } from '@ant-design/icons-vue'
import useRegexp from '../hooks/useRegexp'
import { loginApi } from '../api/user'
import { setAccessToken, setRefreshToken } from '../utils/tools'

interface FormState {
  username: string
  password: string
}

const router = useRouter()
const loginBtnLoading = ref(false)
const formState = reactive<FormState>({
  username: '',
  password: ''
})

const handleLoginBtn = async () => {
  loginBtnLoading.value = true

  await useRegexp(formState)
    .then(() => {
      loginRequest()
    })
    .catch(() => {
      message.error('用户名或密码不正确！请重新输入')
      loginBtnLoading.value = false
    })
}

const loginRequest = async () => {
  const { username, password } = formState
  await loginApi({ username, password })
    .then((res) => {
      message.success('登录成功!')
      loginBtnLoading.value = false
      setAccessToken(res.data.accessToken)
      setRefreshToken(res.data.refreshToken)
      router.push('/')
    })
    .catch((err) => {
      const resMsgStr = err.response.data.message
      if (resMsgStr.indexOf('Wrong password')) {
        message.error('用户名或密码不正确！请重新输入')
      } else {
        message.error('登录失败，请稍后再试！')
      }
      loginBtnLoading.value = false
    })
}
</script>

<style scoped>
:deep(.ant-input:hover),
:deep(.ant-input:focus),
:deep(.ant-input-affix-wrapper:focus-within),
:deep(.ant-input-affix-wrapper:hover) {
  border-color: #a9a2cc;
}
</style>
