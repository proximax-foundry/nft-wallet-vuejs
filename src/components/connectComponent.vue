<template>
<div>
  <button v-if="address==''" @click="toggleModal=!toggleModal" class="px-3 bg-blue-600 rounded-lg py-1.5 text-white">Connect</button>
  <div v-else @mouseover="toggleWallet = true" @mouseout="toggleWallet = false" class="px-3 py-1 rounded-md border flex items-center cursor-pointer" :title="address">
    <img src="../assets/wallet.svg" class="w-8 h-8">
    <div class="truncate w-24 ml-1">{{address}}</div>
  </div>
  <div v-if="toggleWallet" @mouseover="toggleWallet = true" @mouseout="toggleWallet = false" class=" relative">
    <div class="absolute bg-white w-full border border-t-0 rounded-md ">
      <div @click="removeSessionStorage()" class="px-3 py-2 cursor-pointer">Disconnect</div>
    </div>
  </div>
  <transition
    enter-active-class="animate__animated animate__fadeInDown"
    leave-active-class="animate__animated animate__fadeOutUp"
  >
      <div v-if="toggleModal" class="popup-outer-lang absolute flex z-50 ">
      <div class="modal-popup-box ">
        <div class="bg-blue-300 text-center py-2 rounded-t-2xl text-lg font-semibold">Connect Wallet</div>
        <div class="flex px-6 pt-2 pb-24 border-b-[2px] border-blue-600">
          <div v-if="!mobileQrPage" @click="generateMobileQr()" class="flex flex-col items-center cursor-pointer hover:bg-blue-300 py-1.5 px-2 rounded-md">
              <img src="../assets/proximax-logo.png" class="w-10 h-10" >
              <div class="font-semibold text-xs">Mobile Wallet</div>
          </div>
          <div v-if="mobileQrPage">
            <div  v-html="qr"/>
            <div class="text-gray-500 text-center">Please scan the QR above with Sirius Mobile App to connect.</div>
          </div>
          
        </div>
        <div class="flex justify-center">
          <button class="my-3 py-1.5 px-6 text-center text-white bg-blue-700 rounded-xl">Learn how to connect</button>
        </div>
      </div>
    </div>
  </transition>
  <div @click="closeModal()" v-if="toggleModal" class="fixed inset-0 bg-opacity-60 bg-gray-100 z-20"></div>
</div>
</template>

<script lang="ts" setup>
import { shallowRef } from "@vue/reactivity"
import { Peer } from "peerjs"
import QRCode from 'qrcode'
import { NetworkType, PublicAccount } from "tsjs-xpx-chain-sdk"
import { onMounted } from "vue";

const toggleModal = shallowRef(false)
const toggleWallet = shallowRef(false)
const qr = shallowRef('')
const address = shallowRef('')
const mobileQrPage = shallowRef(false)
const generateMobileQr = () =>{
  
  const peer = new Peer(); 
  const secret = "this is a secret"

  peer.on("open", async()=> {
    const qrValue = {
      type: "connect",
      recvId: peer.id,
      secret: secret,
      generationHash: "56D112C98F7A7E34D1AEDC4BD01BC06CA2276DD546A93E36690B785E82439CA9", //testnet2
    };
    qr.value = await QRCode.toString(JSON.stringify(qrValue))
    mobileQrPage.value = true
  });
  peer.on("connection", (conn) => {
    conn.on("data", (data :any) => {
      const signerPubAcc = PublicAccount.createFromPublicKey(data.publicKey, NetworkType.TEST_NET)
      const isValid = signerPubAcc.verifySignature(secret, data.signature)
      if (isValid) {
        conn.send("success")
        sessionStorage.setItem('userPublicKey',signerPubAcc.publicKey)
        fetchSessionStorage()
        peer.disconnect()
        closeModal()
      } else {
        console.error("signature doesn't match!")
      }
    });
  });
}
const fetchSessionStorage = () =>{
  const publicKey = sessionStorage.getItem('userPublicKey')
  if(publicKey!=null){
    address.value = PublicAccount.createFromPublicKey(publicKey, NetworkType.TEST_NET).address.pretty()
  }else{
    address.value = ""
  }
}

const removeSessionStorage = () =>{
  const publicKey = sessionStorage.removeItem('userPublicKey')
  fetchSessionStorage()
}
onMounted(()=>{
  fetchSessionStorage()
})
const closeModal = () =>{
  toggleModal.value = false
  qr.value = ''
  mobileQrPage.value = false
}
</script>

<style scoped>
.popup-outer-lang{
  top: 80px; left: 0; right: 0; margin-left: auto; margin-right: auto; max-width: 300px;
}
.modal-popup-box{
  @apply transition ease-in duration-300 w-[500px] bg-white shadow-xl rounded-2xl border border-blue-600;
}
</style>