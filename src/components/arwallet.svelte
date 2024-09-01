<script context="module">
  import { onDestroy, onMount } from "svelte";
  import { Othent } from "@othent/kms";
  import {writable,readable,derived,get} from "svelte/store"
  let connector
  export let connected = writable(false)
  export let connecting = writable(false)
  export let address = writable(null)
  export let sdk = writable(null)
  export function disconnect() {
    return new Promise((resolve)=>{
      console.log("handle wallet disconnect",get(connected))
      if(get(connected)&&get(sdk)){
        get(sdk).disconnect().then(()=>{
          address.set(null)
          sdk.set(null)
          connected.set(false)
          connecting.set(false)
          localStorage.removeItem("AR_WALLET_SDK_NAME")
          resolve()
        })
      }
    })
    
  }
  export function connect(){
    if(!get(connected)){
      connector.showModal()
    }
  }
</script>
  
<script>
  
  export const config = null
  let sdks = {
    arconnect: window.arweaveWallet,
    othent: new Othent({
      appInfo:{
        name: "aoslot",
        version: Othent.walletVersion,
        env: "",
      }
    })
  }
  
  async function handleConnection(key){
    if(!key) return
    console.log(key)
    try {
      let wallet = sdks[key]
      if(!wallet) throw("no wallet instance")
      connecting.set(true)
      let active_address
      switch(key){
        case "arconnect":
          const permissions = await wallet.getPermissions()
          console.log('permissions: ', permissions);
          if(!permissions||permissions?.length<=0){
            await wallet.connect(config?.permissions||["ACCESS_ADDRESS","SIGN_TRANSACTION"],{name:config?.appInfo?.name})
          }
          active_address = await wallet.getActiveAddress()
          if(!active_address) throw("no active address")
          sdk.set(wallet)
          address.set(active_address)
          connected.set(true)
          addEventListener("walletSwitch",(e)=>{
            address.set(e.detail.address)
          })
          break;
        case "othent":
          let theaddress = await wallet.getActiveAddress()
          console.log('address: ', theaddress);
          if(!theaddress){
            let res = await wallet.connect()
            if(!res || !res?.walletAddress) throw("othent connact faild.")
            sdk.set(wallet)
            address.set(res.walletAddress)
            connected.set(true)
          }else{
            sdk.set(theaddress?wallet:null)
            address.set(theaddress)
            connected.set(theaddress?true:false)
          }
          break;
      }
      localStorage.setItem("AR_WALLET_SDK_NAME",key)
      connecting.set(false)
    } catch (error) {
      address.set(null)
      connected.set(false)
      connecting.set(false)
      console.log('error: ', error);
      return
    }
  }

  onMount(()=>{
    let key = localStorage.getItem("AR_WALLET_SDK_NAME")
    if(key){handleConnection(key)}
  })

  onDestroy(()=>{
    removeEventListener("walletSwitch",()=>console.log("Removed walletSwitch listener"))
  })

  $: connections = [{key:"arconnect",name:"Arconnect"},{key:"othent",name:"Othent"}].map((item)=>{return {
    name:item.name,
    key:item.key,
    enable:sdks[item.key]?true:false
  }})

</script>

<dialog bind:this={connector} id="ar_wallet_connector" on:close={(e)=>console.log("wallet connector closed")} class="bg-base-200 backdrop:bg-black/50 fixed top-1/2 left-1/2 fixed -translate-1/2 transition-all p-8">
  <div class="flex flex-col gap-2">
    {#each connections as connection}
    <div>
      <button disabled={!connection.enable} on:click={()=>handleConnection(connection.key).then(()=>connector.close())} class="bg-black p-2 w-full text-center">{connection.name}</button>
    </div>
  {/each}
  <button on:click={()=>connector.close()}>cancel</button>
  </div>
  
</dialog>