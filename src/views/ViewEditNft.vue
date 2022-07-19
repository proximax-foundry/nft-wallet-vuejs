<template>
<div class="mx-12 md:mx-36 lg:mx-60 xl:mx-84 pt-8">
    <div>Edit Existing Item</div>
</div>
</template>
<script lang="ts" setup>
import { NetworkType, PublicAccount } from 'tsjs-xpx-chain-sdk';
import { getCurrentInstance, shallowRef, watch } from 'vue';
import { useRouter } from 'vue-router';

    //property passed from parent page
    const props = defineProps({
        assetId: String
    })
    
    //initialize variables
    const testnetUrl = 'https://api-2.testnet2.xpxsirius.io'
    const publicKey = shallowRef('') 
    const internalInstance = getCurrentInstance() 
    const emitter = internalInstance!.appContext.config.globalProperties.emitter
    const router = useRouter()
    //get public key from session storage
    const fetchSessionStorage = () =>{
    const searchStorage = sessionStorage.getItem('userPublicKey') 
    if(searchStorage!=null){
        publicKey.value = PublicAccount.createFromPublicKey(searchStorage, NetworkType.TEST_NET).publicKey
    }else{
        publicKey.value = ""  
    }
    }

    fetchSessionStorage()

    //listens to wallet connection events, update publicKey
    emitter.on('Mobile Wallet Connected',()=>{
        fetchSessionStorage()
    })

    emitter.on('Mobile Wallet Disconnected',()=>{
        fetchSessionStorage()
    })

    //check if wallet is connected
    watch(publicKey,n=>{ 
        if(n.length){
            
        }else{
            router.push('/view-nft')
        }
    },{immediate:true}) 
</script>

<style>

</style>