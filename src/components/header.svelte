<script>
  import {link} from 'svelte-spa-router'
  import { addMessages,_ } from 'svelte-i18n';
  import { connected,address,connecting,connect,disconnect } from '../components/arwallet.svelte';
  import clsx from 'clsx';
  import { onDestroy, onMount } from 'svelte';
  import Avatar from './avatar.svelte';
  import {recharger} from './recharger.svelte'

  // translations
  addMessages('en', {
    "nav.home":"home",
    "nav.about":"about"
  });
  addMessages('zh', {
    "nav.home":"首页",
    "nav.about":"关于"
  });

  // menus 
  let menus = [{
    key: "home",
    text: "nav.home",
    path: "/"
  },{
    key: "about",
    text: "nav.about",
    path: "/about"
  }]
  let stickied = false

  onMount(()=>{
    window.addEventListener("scroll", ()=>{
      if(window.scrollY > 30 && !stickied){
        stickied = true
      }
      if(window.scrollY < 30 && stickied){
        stickied = false
      }
    });
  })

  onDestroy(()=>{
    window.removeEventListener("scroll",()=>{})
  })
  

</script>

<header class={clsx(`flex w-full justify-between h-16 px-2 items-center sticky top-0 z-50 transition-all`,`${stickied}?"bg-base/80 backdrop-blur-3xl shadow-base-content/5 shadow-xs":"bg-base/0"`)}>
  <div>
    <a href="/" use:link >aoslot</a>  
  </div>
  
  <div class="flex gap-10">
    <nav class=" flex gap-2">
      {#each menus as { key, text,path }}
        <a href={path} id={key} use:link class="inline-flex">{$_(text)}</a>
      {/each}
    </nav>
    <div>
      <button on:click={()=>recharger.showModal()}>recharge</button>
    </div>
    <div class="flex">
      {#if $connected == true}
        <a href="/me" use:link><Avatar username={$address}/></a>
      {:else}
        <button on:click={()=>connect()}>connect</button>
      {/if}
    </div>
  </div>
</header>