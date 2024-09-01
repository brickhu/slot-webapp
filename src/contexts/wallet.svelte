<script context="module">
  let storage_keys = {
    sdk_name: "AR_WALLET_SDK_NAME"
  }
  export let sdks = {
    arconnect: window.arweaveWallet,
    othent: new Othent({
      appInfo:{
        name: "aoslot",
        version: Othent.walletVersion,
        env: "",
      }
    })
  }
  let sdk_info = {
    arconnect: {name:"Arconnect"},
    othent: {name:"Othent"},
  }
  let enable_sdks = Object.entries(sdk_info).map(([k,v]) => {
    v.key = k
    v.enable = sdks[k]?true:false
    return v
  });
  let method = localStorage.getItem(storage_keys.sdk_name)

  export let address = writable(null)
  export let connected = writable(false)
  export let connecting = writable(false)
  export let sdk = writable(sdks[method])
  export const useWallet = ()=>{
    return getContext("wallet")
  }
</script>

<script>
  import { onMount,onDestroy } from 'svelte';
  import mergeClasses from "@robit-dev/tailwindcss-class-combiner"
  import clsx from 'clsx/lite';
  import { setContext, getContext } from 'svelte'
  import { writable } from 'svelte/store';
  import { Othent } from "@othent/kms";

  export let config = {
      permissions:["ACCESS_ADDRESS","SIGN_TRANSACTION"],
      ensurePermissions: true,
      appInfo: {
        name: "aoslot"
      }
    }
  

  let visable = false

  onMount(()=>{
    console.log("初始化钱包环境")
    if($sdk&&method==="arconnect"){
      addEventListener("arweaveWalletLoaded", $sdk.getPermissions().then((permissions)=>{
        if(permissions&&permissions?.length>0){
          $sdk.getActiveAddress().then(active_address=>{
            address.set(active_address)
            connected.set(active_address?true:false)
          })
        }
      }))

      addEventListener("walletSwitch",(e)=>{
        address.set(e.detail.address)
      })
    }

    if($sdk&&method === "othent"){
      $sdk.getActiveAddress().then(active_address=>{
        console.log('active_address: ', active_address);
        address.set(active_address)
        connected.set(active_address?true:false)
      })
    }

  })
  

  onDestroy(()=>{
    removeEventListener("walletSwitch",()=>{})
  })
  

  async function handleConnect(sdk_name) {
    sdk.set(sdks[sdk_name])
    let active_address = null
    switch (sdk_name) {
      case "arconnect":
        let permissions = await $sdk.getPermissions()
        if(!permissions||permissions?.length<=0){
          await $sdk.connect(config?.permissions||["ACCESS_ADDRESS","SIGN_TRANSACTION"],{name:config?.appInfo?.name})
          active_address = await $sdk.getActiveAddress()
        }
        address.set(active_address)
        connected.set(active_address?true:false)

        break;
      case "othent":
        console.log($sdk)
        let res = await $sdk.connect()
        address.set(res?.walletAddress)
        connected.set(res?.walletAddress?true:false)
        break;
    }
    connecting.set(false)
    visable = false
    localStorage.setItem(storage_keys.sdk_name,sdk_name)
    return
  }

  
  setContext("wallet",{
    connect: () => {
      if($connected) return
      $connecting = true
      visable = true
    },
    disconnct: async() => {
      if(!$connected) return
      await $sdk.disconnect()
      address.set(null)
      connected.set(false)
      connecting.set(false)
      sdk.set(null)
      localStorage.removeItem(storage_keys.sdk_name)
    }
  })
</script>

<div>
  <slot></slot>
  <div id="ar_wallet_connector" class="fixed top-0 left-0">
    <div 
      class={mergeClasses(clsx(`fixed top-0 left-0 w-full h-full transition-all`,`bg-black/60 z-[999]`,`${visable?"opacity-100 visible":"opacity-0 invisible"}`))} 
      on:click={()=>{visable=false}}
      role="button"
      aria-hidden="true"
    >
    </div>
    <div class={mergeClasses(clsx(`fixed top-0 left-0 w-full h-full transition-all`,`z-[1000] flex justify-center items-center pointer-events-none` ,`${visable?"opacity-100 visible translate-y-0":"opacity-0 invisible translate-y-full"}`))}>
      <div class="w-100 bg-base-100 p-10 rounded-2xl pointer-events-auto">
        <ul class="flex flex-col gap-2.5">
          {#each enable_sdks as { key, name , enable }}
            <li><button data-sdk={key} disabled={!enable} on:click={()=>handleConnect(key)}>{name}</button></li>
          {/each}
        </ul>
        <div><button on:click={()=>{visable=false}}>cancel</button></div>
      </div>
    </div>
    
  </div>
</div>


