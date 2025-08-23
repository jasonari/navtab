<template>
  <div class="login-bg">
    <div class="login-container">
      <RouterLink to="/"><CloseOutlined class="close-icon" /></RouterLink>
      <div class="left-box">
        <div class="login-title">注册</div>
        <Form class="login-form">
          <FormItem
            class="username-box"
            name="username"
            :class="{
              shake: usernameInputShake,
              errtext: usernameInputErrText
            }"
          >
            <div>
              <span class="text-tips">用户名 {{ usernameTips }}</span>
            </div>
            <Input
              class="form-input"
              v-model:value="formState.username"
              @blur="usernameInputErrText = false"
            />
            <div class="div-line"></div>
          </FormItem>
          <FormItem
            class="password-box"
            name="password"
            :class="{
              shake: passwordInputShake,
              errtext: passwordInputErrText
            }"
          >
            <div>
              <span class="text-tips">密码 {{ passwordTips }}</span>
            </div>
            <InputPassword
              class="form-input"
              v-model:value="formState.password"
              @blur="passwordInputErrText = false"
            />
            <div class="div-line"></div>
          </FormItem>
          <FormItem class="btn-box">
            <Button
              class="btn"
              type="text"
              @click="handleRegBtn"
              :loading="regBtnLoading"
            >
              注册
            </Button>
          </FormItem>
        </Form>
        <div class="register">
          <router-link to="/login">已有账号？去登录</router-link>
        </div>
      </div>
    </div>
    <div class="overlay"></div>
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
import { registerApi } from '../api/user'
import useRegexp from '../hooks/useRegexp'
import { setAccessToken, setRefreshToken } from '../utils/tools'

interface FormState {
  username: string
  password: string
}

const router = useRouter()
const usernameTips = ref('')
const passwordTips = ref('')
const usernameInputShake = ref(false)
const usernameInputErrText = ref(false)
const passwordInputShake = ref(false)
const passwordInputErrText = ref(false)
const regBtnLoading = ref(false)
const formState = reactive<FormState>({
  username: '',
  password: ''
})

const handleRegBtn = async () => {
  // button loading
  regBtnLoading.value = true

  await useRegexp(formState)
    .then(() => {
      registerRequest()
    })
    .catch((err: { reason: string }) => {
      regBtnLoading.value = false
      if (err.reason === 'username') {
        message.error('用户名应由3-15位英文或汉字组成')
        usernameInputShake.value = true
        usernameInputErrText.value = true
        setTimeout(() => {
          usernameInputShake.value = false
        }, 1500)
        return
      }
      if (err.reason === 'password') {
        message.error('密码应由8-16位英文字母和数字组成')
        passwordInputShake.value = true
        passwordInputErrText.value = true
        setTimeout(() => {
          passwordInputShake.value = false
        }, 1500)
        return
      }
      message.error('注册失败，请稍后再试！')
    })
}

const registerRequest = async () => {
  const { username, password } = formState
  await registerApi({
    username,
    password
  })
    .then((res) => {
      message.success('注册成功,自动登录中...')
      setAccessToken(res.data.accessToken)
      setRefreshToken(res.data.refreshToken)
      setTimeout(() => {
        regBtnLoading.value = false
        router.push('/')
      }, 1500)
    })
    .catch((err) => {
      regBtnLoading.value = false
      const resMsgStr = err.response.data.message
      if (resMsgStr?.indexOf('Duplicate entry')) {
        message.error('注册失败: 用户名已存在！')
      } else {
        message.error('注册失败，请稍后再试！')
      }
    })
}
</script>

<style scoped lang="scss">
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
  width: 300px;
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
.errtext {
  span,
  input {
    color: red;
  }
  .div-line {
    border-bottom: 1px solid red;
  }
}
.shake {
  animation: shake 0.82s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
}
@keyframes shake {
  10%,
  90% {
    transform: translateX(-1px);
  }
  20%,
  80% {
    transform: translateX(2px);
  }
  30%,
  50%,
  70% {
    transform: translateX(-4px);
  }
  40%,
  60% {
    transform: translateX(4px);
  }
}
</style>
