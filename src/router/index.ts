import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
import ViewHomeView from '../views/ViewHome.vue'
import ViewCreateNft from '../views/ViewCreateNft.vue'
const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    component: ViewHomeView,
  },
  {
    path: '/create-nft',
    component: ViewCreateNft,
  },
  
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})





export default router
