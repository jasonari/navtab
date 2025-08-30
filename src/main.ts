import { createApp } from 'vue'
import App from './App.vue'
import './assets/styles/reset.css'
import './assets/styles/global.css'
import router from './router'
import { createPinia } from 'pinia'
import './auto-update'

const app = createApp(App)
const pinia = createPinia()

app.use(router)
app.use(pinia)

app.mount('#app')
