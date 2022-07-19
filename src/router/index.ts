import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
import ViewHomeView from '../views/ViewHome.vue'
import ViewCreateNft from '../views/ViewCreateNft.vue'
import ViewDisplayNft from '../views/ViewDisplayNft.vue'
import ViewNftDetails from '../views/ViewNftDetails.vue'

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
  {
    path: '/view-nft-details/:assetId',
    props: true,
    component: ViewNftDetails,
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})





export default router
