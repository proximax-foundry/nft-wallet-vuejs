import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
import ViewHomeView from '../views/ViewHome.vue'
import ViewCreateNft from '../views/ViewCreateNft.vue'
import ViewDisplayNft from '../views/ViewDisplayNft.vue'
import ViewNftDetails from '../views/ViewNftDetails.vue'
import ViewTransferNft from '../views/ViewTransferNft.vue'
import ViewEditNft from '../views/ViewEditNft.vue'
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
    path: '/nft-details/:assetId',
    props: true,
    component: ViewNftDetails,
  },
  {
    path: '/edit-nft/:assetId',
    props: true,
    component: ViewEditNft,
  },
  {
    path: '/transfer-nft/:assetId',
    props: true,
    component: ViewTransferNft,
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
