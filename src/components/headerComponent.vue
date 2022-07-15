<template>
<div class="px-6 py-1 flex justify-between items-center border-b-[2px] border-blue-500">
    <img @mouseover="isHover=true" @mouseout="isHover=false" @click="visibleLeft = true" src="../assets/icon-menu.svg" class="w-12 h-12 cursor-pointer"/>
    <router-link to="/">
        <img src="../assets/proximax-logo.png" class="w-12 h-12 cursor-pointer"/>
    </router-link>
    <connectComponentVue />
    <Sidebar @mouseover="isHover=true" @mouseout="isHover=false" v-model:visible="visibleLeft" class="bg-orange-500" :baseZIndex="10000">
        <div class="px-6 py-3">
            <div>Settings</div>
            <div>NFT Marketplace</div>
            <router-link @click="visibleLeft = false" to="/create-nft">Create NFT</router-link>
        </div>
    </Sidebar>
</div> 
</template>

<script setup lang="ts">
import Sidebar from 'primevue/sidebar';
import { getCurrentInstance, shallowRef } from 'vue';
import connectComponentVue from './connectComponent.vue';

const visibleLeft = shallowRef(false)
const isHover = shallowRef(false)
const internalInstance = getCurrentInstance(); 
const emitter = internalInstance!.appContext.config.globalProperties.emitter;
emitter.on('PAGE_CLICK', () => {
    if(!isHover.value && visibleLeft.value==true){
        visibleLeft.value = false
    }
})

</script>

<style>

</style>