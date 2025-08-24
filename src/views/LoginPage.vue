<template>
  <div
    class="relative h-screen overflow-hidden bg-cover"
    style="background-image: url('/images/bg.jpg')"
  >
    <div
      class="absolute top-1/2 left-1/2 z-[100] h-[450px] w-[800px] rounded-xl bg-cover bg-center bg-no-repeat"
      style="
        background-image: url('/images/user-login-bg.png');
        transform: translate(-50%, -50%);
      "
    >
      <RouterLink to="/">
        <CloseOutlined class="absolute top-5 right-5 text-[#928cb1]" />
      </RouterLink>
      <div
        class="flex h-[450px] w-[465px] flex-col items-center justify-between"
      >
        <div class="mt-[50px] text-center text-2xl font-bold text-[#928cb1]">
          登录
        </div>
        <Form
          class="mt-[30px] flex w-[300px] flex-col items-center justify-center"
        >
          <FormItem class="mt-[15px] w-full" name="username">
            <span class="text-sm font-medium text-[#9c9c9c]">用户名</span>
            <Input
              class="border-none shadow-none"
              v-model:value="formState.username"
            />
            <div class="border-b border-[#cfcfcf]"></div>
          </FormItem>
          <FormItem class="mt-[15px] w-full" name="password">
            <span class="text-sm font-medium text-[#9c9c9c]">密码</span>
            <InputPassword
              class="border-none shadow-none"
              v-model:value="formState.password"
            />
            <div class="border-b border-[#cfcfcf]"></div>
          </FormItem>
          <FormItem class="mt-[30px] w-full">
            <Button
              class="w-[250px] bg-[#a9a2cc] text-base leading-4 text-white hover:bg-[#7e7999] active:bg-[#545065]"
              type="text"
              @click="handleLoginBtn"
              :loading="loginBtnLoading"
            >
              登录
            </Button>
          </FormItem>
        </Form>
        <div class="mb-[50px] text-center">
          <router-link to="/register" class="text-sm text-[#9c9c9c]"
            >没有账号？去注册</router-link
          >
        </div>
      </div>
    </div>
    <div
      class="absolute z-[99] h-full w-full bg-black/50 backdrop-blur-lg"
    ></div>
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

<!-- <style scoped lang="scss">
.login-bg {
  height: 100vh;
  overflow: hidden;
  background-image: url('/images/bg.jpg');
  background-size: cover;
}
.login-container {
  width: 800px;
  height: 450px;
  background-image: url('/images/user-login-bg.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  border-radius: 12px;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  z-index: 100;
}
.close-icon {
  position: absolute;
  top: 20px;
  right: 20px;
  color: #928cb1;
}
.left-box {
  width: 465px;
  height: 450px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
}
.login-title {
  text-align: center;
  font-size: 32px;
  font-weight: 700;
  margin-top: 50px;
  color: #928cb1;
}
.login-form {
  width: 300px;
  margin-top: 30px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.username-box,
.password-box {
  width: 100%;
  margin-top: 15px;
}
.text-tips {
  color: #9c9c9c;
  font-size: 14px;
  font-weight: 500;
}
.form-input {
  border: none;
  box-shadow: none;
}
.div-line {
  border-bottom: 1px solid #cfcfcf;
}
.btn-box {
  margin-top: 30px;
  .btn {
    font-size: 16px;
    line-height: 16px;
    color: #fff;
    width: 250px;
    background-color: #a9a2cc;
    &:hover {
      background-color: #7e7999;
    }
    &:active {
      background-color: #545065;
    }
  }
}
.register {
  text-align: center;
  margin-bottom: 50px;
  a {
    font-size: 14px;
    color: #9c9c9c;
  }
}
.overlay {
  position: relative;
  width: 100%;
  height: 100%;
  backdrop-filter: blur(10px);
  background: rgba(0, 0, 0, 0.5);
  z-index: 99;
}
</style> -->
