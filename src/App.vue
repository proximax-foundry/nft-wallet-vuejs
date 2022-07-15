<template>
  <div class="min-h-screen" @click="clickEvent()">
    <headerComponentVue />
    <router-view />
    
  </div>
</template>

<script setup lang="ts">
import { getCurrentInstance } from 'vue';
import headerComponentVue from './components/headerComponent.vue';


const internalInstance = getCurrentInstance()
const emitter = internalInstance!.appContext.config.globalProperties.emitter
const clickEvent = () => {
    emitter.emit("PAGE_CLICK")
};
</script>

<style scoped>

</style>
