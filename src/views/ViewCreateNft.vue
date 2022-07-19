<template>
<div class="mx-12 md:mx-36 lg:mx-60 xl:mx-84 justify-center ">
    <div class="font-semibold mt-8 dark:text-white">Create New item</div>
    <div v-if="!isConnected" class="text-center text-red-600 bg-red-300 rounded-lg ml-auto mr-auto w-52 py-1.5">Wallet is not connected</div>
    <div class="mt-2 dark:text-white">Name</div>
    <TextInputVue placeholder="Name your item" v-model="name"/>
    <div class="mt-4 dark:text-white">Description</div>
    <textarea type="text " v-model="description" placeholder="Prepare a detailed description of your item" class="w-full px-3  py-1.5 mt-1 border border-black"></textarea>
    <div class="mt-4 dark:text-white">External Link</div>
    <TextInputVue placeholder="https://yoursite.io/item/123"  v-model="externalLink"  />
    <div class="mt-4 dark:text-white">Properties</div>
    <div v-for="(attributeName,index) of attributeNames" :key="index" >
        <div class="flex gap-2 mb-2" >
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
    <button @click="createItem()" class="dark:bg-[#f73d93] flex px-5 ml-auto mr-auto mt-3 py-1.5 bg-blue-600 text-white rounded-md disabled:opacity-50" :disabled="disabledCreate">Create Item</button>
    
   <!--qr modal-->
    <transition enter-active-class="animate__animated animate__fadeInDown" leave-active-class="animate__animated animate__fadeOutUp">
        <div v-if="toggleModal" class="popup-outer-lang absolute flex z-50 ">
            <div class="modal-popup-box ">
                <div v-html="qr" class="w-8/12 ml-auto mr-auto py-3" />
                <div class="text-gray-500 ml-auto mr-auto w-8/12">Please scan the QR above with Sirius Mobile App to sign the transaction.</div>
                <div @click="toggleModal=false;qr=''" class="cursor-pointer flex justify-center my-3 bg-blue-600 dark:bg-[#f73d93] w-24 rounded-lg text-white py-1.5 ml-auto mr-auto">Close</div>
            </div>
        </div>
    </transition>
    <div @click="toggleModal=false;qr=''" v-if="toggleModal" class="fixed inset-0 opacity-50 bg-gray-600 dark:bg-[#171717] z-20"></div>
</div>
</template>

<script lang="ts" setup>
import {  computed, getCurrentInstance, shallowRef, watch, ref} from 'vue';
import TextInputVue from '@/components/TextInput.vue';
import NumberInput from '@/components/NumberInput.vue';
import { AggregateBondedTransactionBuilder, Convert, Deadline, InnerTransaction, Mosaic, MosaicDefinitionTransactionBuilder, MosaicId, MosaicLevy, MosaicMetadataTransactionBuilder, MosaicModifyLevyTransactionBuilder, MosaicNonce, MosaicProperties,MosaicSupplyChangeTransactionBuilder, MosaicSupplyType, NetworkType, PublicAccount, UInt64 } from 'tsjs-xpx-chain-sdk';
import QRCode from 'qrcode'

//initialize variables
const name = shallowRef('')
const description = shallowRef('')
const externalLink = shallowRef('')
const attributeNames = ref(['']) 
const attributeValues = ref([''])
const royalties = shallowRef('0')
const toggleModal = shallowRef(false)
const publicKey = shallowRef('')
const qr = shallowRef('')
const isConnected = shallowRef(false)
const internalInstance = getCurrentInstance() 
const emitter = internalInstance!.appContext.config.globalProperties.emitter

//add and remove property
const addProperty = () =>{
    attributeNames.value.push('')
    attributeValues.value.push('')
}

const removeProperty = (i :number) => {
    attributeNames.value.splice(i, 1);
    attributeValues.value.splice(i, 1)
}

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
        isConnected.value= true
    }else{
        isConnected.value = false
    }
},{immediate:true})

//convert both array values into object keys and values
const getAttributeObject = () =>{
    return attributeNames.value.reduce((key,value,index)=>{
        return {...key, [value]: attributeValues.value[index]};
    },{})
}

//create button validation
const disabledCreate = computed(()=>{
    return !attributeNames.value.every(name=>name!='') || !attributeValues.value.every(name=>name!='') || name.value=='' || externalLink.value == '' || publicKey.value == ''
})

//reset inputs
const resetInputs = () =>{
    name.value = ''
    description.value = ''
    externalLink.value = ''
    attributeNames.value = []
    attributeNames.value = []
    royalties.value = '0'
}
//create nft transaction
const createItem = async() =>{
    const newValue = {
        name: name.value, 
        description: description.value,
        image: externalLink.value,  
        attributes: getAttributeObject()
    }
    resetInputs()
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
    .mosaicLevy(
        MosaicLevy.createWithAbsoluteFee(
            publicAccount.address,
            new MosaicId('13bfc518e40549d7'), /* prx.xpx in testnet2 */
            parseFloat(royalties.value)*Math.pow(10,6)
        )
    )
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
    toggleModal.value = true

}

</script>

<style scoped>
.popup-outer-lang{
  top: 80px; left: 0; right: 0; margin-left: auto; margin-right: auto; max-width: 350px;
}
.modal-popup-box{
  @apply transition ease-in duration-300 w-[500px] bg-white shadow-xl rounded-2xl ;
}
</style>