import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
import ViewHomeView from '../views/ViewHome.vue'
import ViewCreateNft from '../views/ViewCreateNft.vue'
import ViewDisplayNft from '../views/ViewDisplayNft.vue'
const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    component: ViewHomeView,
  },
  {
    path: '/create-nft',
    component: ViewCreateNft,
  },
  {
    path: '/view-nft',
    component: ViewDisplayNft,
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})





export default router
