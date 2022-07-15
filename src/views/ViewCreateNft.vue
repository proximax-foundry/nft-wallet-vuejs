<template>
<div class="mx-12 md:mx-36 lg:mx-60 xl:mx-84 justify-center ">
    <div class="font-semibold mt-8">Create New item</div>
    <div class="mt-4">Name</div>
    <TextInputVue placeholder="Name your item" v-model="name"/>
    <div class="mt-4">Description</div>
    <textarea type="text " v-model="description" placeholder="Prepare a detailed description of your item" class="w-full px-3  py-1.5 mt-1 border border-black"></textarea>
    <div class="mt-4">External Link</div>
    <TextInputVue placeholder="https://yoursite.io/item/123"  v-model="externalLink"  />
    <div class="mt-4">Properties</div>
    <div v-for="(scopedKey,index) of scopedKeys" :key="index" >
        <div class="flex gap-2 items-center mb-6">
            <img src="../assets/icon-delete-red.svg" class="w-4 h-4 cursor-pointer" @click="removeProperty(index)">
            <div>
                <TextInputVue placeholder="Property name" :showError="showScopedKeyErr[index]" errorMessage="More than 8 bytes." v-model="scopedKeys[index]" />
            </div>
            <TextInputVue placeholder="Property value" v-model="scopedValues[index]" />
        </div>
    </div>
    <div class="text-blue-600 font-semibold w-[70px] text-xs mt-2 cursor-pointer" @click="addProperty()">+ Add more</div>
    <div class="mt-4">Royalties</div>
    <div class="my-2 text-gray-500 text-xs" >Collect a fee (XPX) when a user re-sells an item you created.</div>
    <NumberInput v-model="royalties" :decimal="6"/>
    <div class="ml-auto mr-auto text-center mt-3 px-5 py-1.5 bg-blue-600 text-white rounded-md">Create</div>
</div>

</template>

<script lang="ts" setup>
import {  ref, shallowRef, watch } from 'vue';
import TextInputVue from '@/components/TextInput.vue';
import NumberInput from '@/components/NumberInput.vue';
import { Convert } from 'tsjs-xpx-chain-sdk';

const name = shallowRef('')
const description = shallowRef('')
const externalLink = shallowRef('')
const scopedKeys = ref(['']) 
const scopedValues = ref([''])
const showScopedKeyErr = ref([false])
const royalties = shallowRef('0')

const removeProperty = (i :number) => {
    scopedKeys.value.splice(i, 1);
    scopedValues.value.splice(i, 1)
    showScopedKeyErr.value.splice(i, 1);
}
const addProperty = () =>{
    scopedKeys.value.push('')
    scopedValues.value.push('')
    showScopedKeyErr.value.push(false)
}

watch(() => [...scopedKeys.value], (n) => {
    console.log(n)
    for(let i = 0; i < n.length; i++){
        let tempHexData = Convert.utf8ToHex(scopedKeys.value[i]); 
        const hexDataBytes = tempHexData.length / 2;

        if(hexDataBytes <= 8){
            showScopedKeyErr.value[i] = false
        }else{
            showScopedKeyErr.value[i] = true
        }
    }
},{deep:true})
</script>