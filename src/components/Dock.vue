<template>
  <div class="dock">
    <div class="dock-list" ref="el">
      <NavIcon
        v-for="item in bookmarkList"
        :key="item.id"
        :id="item.id"
        :imgUrl="item.imgUrl"
        :size="item.size"
        :href="item.href"
        :bgColor="item.bgColor"
        :title="item.title"
        @addOrEditBookmark="showDrawer"
      />
    </div>
  </div>
  <Drawer
    :title="drawerInfo.drawerTitle"
    placement="left"
    :open="drawerInfo.drawerVisible"
    @close="closeDrawer"
  >
    <Form :model="bookmarkInfo" :label-col="{ style: { width: '100px' } }">
      <FormItem label="书签名">
        <Input
          v-model:value="bookmarkInfo.title"
          placeholder="请输入书签名称"
        />
      </FormItem>
      <FormItem label="网址">
        <Input
          v-model:value="bookmarkInfo.href"
          placeholder="请输入网站的完整网址"
        />
      </FormItem>
      <FormItem label="图标大小 (px)">
        <InputNumber v-model:value="bookmarkInfo.size" :min="1" :step="2" />
      </FormItem>
      <FormItem label="背景颜色">
        <Input v-model:value="bookmarkInfo.bgColor" />
      </FormItem>
      <FormItem label="图标地址">
        <Input :placeholder="bookmarkInfo.imgUrl" :disabled="true" />
      </FormItem>
      <div class="favicon-container">
        <div
          class="favicon-bg"
          :style="{ backgroundColor: bookmarkInfo.bgColor }"
        >
          <img
            :src="`${imgBaseUrl}${bookmarkInfo.imgUrl}`"
            alt="baidu.com favicon"
            :style="{
              width: bookmarkInfo.size + 'px',
              height: bookmarkInfo.size + 'px'
            }"
          />
        </div>
      </div>
      <input
        type="file"
        @change="onFileChange"
        accept="image/*"
        ref="imgInputRef"
        style="display: none"
      />
      <Button style="width: 45%" @click="handleSelectImage">
        <UploadOutlined :style="{ display: isUploading ? 'none' : '' }" />
        <LoadingOutlined :style="{ display: isUploading ? '' : 'none' }" />
        更改图标
      </Button>
      <Button style="width: 45%; margin-left: 10%" @click="handleAddOrSave">
        <SaveOutlined v-if="drawerInfo.drawerTitle === '编辑书签'" />
        <FileAddOutlined v-else />
        {{ drawerInfo.drawerTitle === '编辑书签' ? '保存书签' : '添加书签' }}
      </Button>
    </Form>
  </Drawer>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, toRaw } from 'vue'
import { storeToRefs } from 'pinia'
import { useBookmarkStore } from '../store/bookmark'
import NavIcon from './NavIcon.vue'
import { getAccessToken, removeTokens } from '../utils/tools'
import {
  message,
  Drawer,
  Form,
  FormItem,
  Input,
  Button,
  InputNumber
} from 'ant-design-vue'
import {
  UploadOutlined,
  SaveOutlined,
  FileAddOutlined,
  LoadingOutlined
} from '@ant-design/icons-vue'
import { useDraggable } from 'vue-draggable-plus'
import { Bookmarks } from '../api/types/user'
import { uploadImageApi } from '../api/user'
import { nanoid } from 'nanoid'

const drawerInfo = reactive({
  drawerTitle: '',
  drawerVisible: false
})
const defaultBookmarkInfo = {
  id: '',
  title: '',
  imgUrl: '/icon-default-favicon.png',
  size: 32,
  href: '',
  bgColor: '#fff'
}
const bookmarkInfo = reactive({}) as Bookmarks
const imgBaseUrl = import.meta.env.VITE_APP_PROXY_TARGET + '/images'
const imgInputRef = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)
const isUploading = ref(false)

const bookmarkStore = useBookmarkStore()
const { bookmarkList } = storeToRefs(bookmarkStore)
const {
  getBookmarkList,
  resetBookmarkList,
  saveBookmarkList,
  editBookmarkById,
  addBookmark
} = bookmarkStore

const el = ref()
useDraggable(el, bookmarkList, {
  animation: 150,
  ghostClass: 'ghost',
  // delay: 50,
  onStart() {},
  onUpdate() {
    saveUserBookmarkList()
  }
})

const getUserBookmarkList = async () => {
  await getBookmarkList().catch((err) => {
    console.error(err)
    message.error('获取书签数据失败,请重新登录！')
    resetBookmarkList()
    removeTokens()
  })
}

const saveUserBookmarkList = async () => {
  await saveBookmarkList()
    .then(() => {
      message.success('同步成功')
    })
    .catch((err) => {
      console.error(err)
      message.error('同步失败，请重试')
    })
}

const showDrawer = (bookmarkId: string | undefined) => {
  if (bookmarkId === undefined) {
    drawerInfo.drawerTitle = '添加书签'
    Object.assign(bookmarkInfo, defaultBookmarkInfo)
  } else {
    drawerInfo.drawerTitle = '编辑书签'
    const bookmarkData = bookmarkList.value.find(
      (item) => item.id === bookmarkId
    )
    Object.assign(bookmarkInfo, toRaw(bookmarkData))
  }
  drawerInfo.drawerVisible = true
}

const closeDrawer = () => {
  drawerInfo.drawerVisible = false
}

const handleAddOrSave = async () => {
  if (drawerInfo.drawerTitle == '添加书签') {
    // add
    bookmarkInfo.id = nanoid()
    await addBookmark(toRaw(bookmarkInfo))
      .then(() => {
        message.success('添加成功')
        closeDrawer()
      })
      .catch(() => {
        message.error('添加失败，请重试')
      })
  } else {
    // edit
    await editBookmarkById(bookmarkInfo.id, toRaw(bookmarkInfo))
      .then(() => {
        message.success('修改成功')
        closeDrawer()
      })
      .catch(() => {
        message.error('修改失败，请重试')
      })
  }
}

const handleSelectImage = () => {
  imgInputRef.value?.click()
}

const onFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    selectedFile.value = target.files[0]
    uploadImage()
  }
}

const uploadImage = async () => {
  if (!selectedFile.value) return
  // formData
  const formData = new FormData()
  formData.append('image', selectedFile.value)
  isUploading.value = true
  // upload
  try {
    const res = await uploadImageApi(formData)
    if (res.code >= 200 && res.code < 300) {
      isUploading.value = false
      bookmarkInfo.imgUrl = res.data.imagePath
    }
  } catch (error) {
    console.error('Upload Error:', error)
    isUploading.value = false
  }
  imgInputRef.value!.value = ''
}

onMounted(() => {
  if (getAccessToken()) {
    getUserBookmarkList()
  } else {
    resetBookmarkList()
  }
})
</script>

<style scoped lang="scss">
.dock {
  background-color: rgb(211, 211, 211, 0.5);
  min-width: 76px;
  height: 86px;
  position: absolute;
  text-align: center;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
  border-radius: 26px;
  .dock-list {
    margin: 0 10px;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    .icon-box {
      background-color: #fff;
      width: 60px;
      height: 60px;
      margin: 0 8px;
      display: flex;
      justify-content: center;
      align-items: center;
      border-radius: 12px;
    }
  }
}
.ghost {
  opacity: 0.5;
  background: #c8ebfb;
}
.editing-btn {
  font-size: 24px;
  margin: 0 10px;
  color: rgba(255, 255, 255, 0.5);
  &:hover {
    color: rgba(255, 255, 255, 0.2);
  }
  &:active {
    color: rgba(255, 255, 255, 0.3);
  }
}
.favicon-container {
  background-color: #eee;
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
  .favicon-bg {
    width: 60px;
    height: 60px;
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 10px 0;
    border-radius: 12px;
    // overflow: hidden;
  }
}
</style>
