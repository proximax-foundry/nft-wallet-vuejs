import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
import ViewHomeView from '../views/ViewHome.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    component: ViewHomeView,
  },
  
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})





export default router
