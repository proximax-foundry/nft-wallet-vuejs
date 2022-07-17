<template>
<div class="mx-12 md:mx-36 lg:mx-60 xl:mx-84 justify-center ">
    <div class="font-semibold mt-8 dark:text-white">Create New item</div>
    <div class="mt-4 dark:text-white">Name</div>
    <TextInputVue placeholder="Name your item" v-model="name"/>
    <div class="mt-4 dark:text-white">Description</div>
    <textarea type="text " v-model="description" placeholder="Prepare a detailed description of your item" class="w-full px-3  py-1.5 mt-1 border border-black"></textarea>
    <div class="mt-4 dark:text-white">External Link</div>
    <TextInputVue placeholder="https://yoursite.io/item/123"  v-model="externalLink"  />
    <div class="mt-4 dark:text-white">Properties</div>
    <div v-for="(attributeName,index) of attributeNames" :key="index" >
        <div class="flex gap-2 " >
            <img src="../assets/icon-delete-red.svg" class="w-4 h-4 cursor-pointer mt-2.5" @click="removeProperty(index)">
            <div class="w-full">
                <TextInputVue placeholder="Property name" errorMessage="More than 8 bytes." v-model="attributeNames[index]" />
            </div>
            <div class="w-full">
                <TextInputVue placeholder="Property value" v-model="attributeValues[index]" />
            </div>
        </div>
    </div>
    <div class="text-blue-600 font-semibold w-[70px] text-xs mt-2 cursor-pointer dark:text-[#f73d93]" @click="addProperty()">+ Add more</div>
    <div class="mt-4 dark:text-white">Royalties</div>
    <div class="my-2 text-gray-500 text-xs" >Collect a fee (XPX) when a user re-sells an item you created.</div>
    <NumberInput v-model="royalties" :decimal="6"/>
    <div @click="createItem()" class="dark:bg-[#f73d93] cursor-pointer ml-auto mr-auto text-center mt-3 px-5 py-1.5 bg-blue-600 text-white rounded-md">Create</div>
    <div v-html="qr"></div>
</div>

</template>

<script lang="ts" setup>
import {  getCurrentInstance, onMounted, ref, shallowRef} from 'vue';
import TextInputVue from '@/components/TextInput.vue';
import NumberInput from '@/components/NumberInput.vue';
import { AggregateBondedTransactionBuilder, Convert, Deadline, InnerTransaction, MosaicDefinitionTransactionBuilder, MosaicId, MosaicLevy, MosaicMetadataTransactionBuilder, MosaicModifyLevyTransactionBuilder, MosaicNonce, MosaicProperties,MosaicSupplyChangeTransactionBuilder, MosaicSupplyType, NetworkType, PublicAccount, UInt64 } from 'tsjs-xpx-chain-sdk';
import QRCode from 'qrcode'

const name = shallowRef('')
const description = shallowRef('')
const externalLink = shallowRef('')
const attributeNames = ref(['']) 
const attributeValues = ref([''])
const royalties = shallowRef('0')

const removeProperty = (i :number) => {
    attributeNames.value.splice(i, 1);
    attributeValues.value.splice(i, 1)
}
const addProperty = () =>{
    attributeNames.value.push('')
    attributeValues.value.push('')
}


const internalInstance = getCurrentInstance() 
const emitter = internalInstance!.appContext.config.globalProperties.emitter
emitter.on('Mobile Wallet Connected',()=>{
    fetchSessionStorage()
})
const publicKey = shallowRef('')
const qr = shallowRef('')
const fetchSessionStorage = () =>{
  const searchStorage = sessionStorage.getItem('userPublicKey')
  if(searchStorage!=null){
    publicKey.value = PublicAccount.createFromPublicKey(searchStorage, NetworkType.TEST_NET).publicKey
  }else{
    publicKey.value = ""  
  }
}
onMounted(()=>{
    fetchSessionStorage()
})
const getAttributeString = () =>{
    let tempArray = []
    for(let i =0;i<attributeNames.value.length;i++){
        let tempString = '"' + attributeNames.value[i].toString() + '"' + ':' + '"' +attributeValues.value[i].toString() + '"'
        tempArray.push(tempString)
    }
    return  '{' + tempArray.join(',') + '}'
}
const createItem = async() =>{
    const newValue = {
        name: name.value, 
        description: description.value,
        externalLink: externalLink.value,  
        attributes: JSON.parse(getAttributeString()),
    }
    const assetDefinitionBuilder = new MosaicDefinitionTransactionBuilder()
    const nonce = MosaicNonce.createRandom(); 
    const publicAccount = PublicAccount.createFromPublicKey(publicKey.value,NetworkType.TEST_NET)
    const assetDefinitionTx = assetDefinitionBuilder
    .deadline(Deadline.create())
    .mosaicNonce(nonce)
    .mosaicId(MosaicId.createFromNonce(nonce, publicAccount)) 
    .mosaicProperties( 
        MosaicProperties.create({
            supplyMutable: false, 
            transferable: true,
            divisibility: 0,
            duration: undefined
        })
    )
    .networkType(NetworkType.TEST_NET)
    .build();
    
    const assetSupplyChangeBuilder = new MosaicSupplyChangeTransactionBuilder()
    const assetSupplyChangeTx =  assetSupplyChangeBuilder
    .deadline(Deadline.create())
    .mosaicId(assetDefinitionTx.mosaicId)
    .direction(MosaicSupplyType.Increase)
    .delta(UInt64.fromUint(1))
    .networkType(NetworkType.TEST_NET)
    .build()

    const mosaicMetadataBuilder = new MosaicMetadataTransactionBuilder()
    const mosaicMetadataTx = mosaicMetadataBuilder
    .deadline(Deadline.create())
    .targetPublicKey(publicAccount)
    .targetMosaicId(assetDefinitionTx.mosaicId)
    .scopedMetadataKey(UInt64.fromHex(Convert.utf8ToHex('nft.json')))
    .value(JSON.stringify(newValue))
    .oldValue('')
    .calculateDifferences()
    .networkType(NetworkType.TEST_NET)
    .build()

    const mosaicLevyBuilder = new MosaicModifyLevyTransactionBuilder()
    const mosaicLevyTx = mosaicLevyBuilder
    .deadline(Deadline.create())
    .mosaicId(assetDefinitionTx.mosaicId)
    .mosaicLevy(MosaicLevy.createWithAbsoluteFee(publicAccount.address,assetDefinitionTx.mosaicId,parseFloat(royalties.value)))
    .networkType(NetworkType.TEST_NET)
    .build()

    let innerTx :InnerTransaction[]
    = [assetDefinitionTx.toAggregate(publicAccount),assetSupplyChangeTx.toAggregate(publicAccount),mosaicMetadataTx.toAggregate(publicAccount)] 
     
    if(parseFloat(royalties.value)>0){
        innerTx.push(mosaicLevyTx.toAggregate(publicAccount))
    }
    const aggregateTxBuilder = new AggregateBondedTransactionBuilder()
    const aggregateTx = aggregateTxBuilder
    .deadline(Deadline.create())
    .innerTransactions(innerTx)
    .networkType(NetworkType.TEST_NET)
    .build()
    
    const data = {
        payload:aggregateTx.serialize(),
        type:'sign',
        generationHash: "56D112C98F7A7E34D1AEDC4BD01BC06CA2276DD546A93E36690B785E82439CA9", //testnet2
        callbackUrl: null
    } 
    qr.value = await QRCode.toString(JSON.stringify(data))

}
</script>