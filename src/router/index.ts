import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../views/HomePage.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/home',
      component: HomePage
    },
    {
      path: '/login',
      component: () => import('../views/LoginPage.vue')
    },
    {
      path: '/register',
      component: () => import('../views/RegisterPage.vue')
    },
    {
      path: '/',
      redirect: '/home'
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('../views/NotFoundPage.vue')
    }
  ]
})

export default router
