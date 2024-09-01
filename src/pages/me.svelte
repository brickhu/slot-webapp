<script>
  import {replace} from "svelte-spa-router"
  import {user} from "../stores/user"
  import { address, disconnect} from "../components/arwallet.svelte"
  import {recharger} from "../components/recharger.svelte"
</script>

<div class="p-20">
  {#if $user}
    <div>{$address} <button on:click={()=>disconnect().then(()=>replace("/"))}>disconnct</button></div>
    <div>your credits: {$user.balance}</div>
    
    <button on:click={()=>recharger.showModal()} class="p-3 bg-primary text-primary-content">recharge</button>

  {/if}
</div>